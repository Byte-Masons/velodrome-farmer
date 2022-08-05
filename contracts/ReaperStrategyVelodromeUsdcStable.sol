// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./abstract/ReaperBaseStrategyv3.sol";
import "./interfaces/IVeloRouter.sol";
import "./interfaces/IVeloPair.sol";
import "./interfaces/IVeloGauge.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

// computes square roots using the babylonian method
// https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method
library Babylonian {
    // credit for this implementation goes to
    // https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol#L687
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        // this block is equivalent to r = uint256(1) << (BitMath.mostSignificantBit(x) / 2);
        // however that code costs significantly more gas
        uint256 xx = x;
        uint256 r = 1;
        if (xx >= 0x100000000000000000000000000000000) {
            xx >>= 128;
            r <<= 64;
        }
        if (xx >= 0x10000000000000000) {
            xx >>= 64;
            r <<= 32;
        }
        if (xx >= 0x100000000) {
            xx >>= 32;
            r <<= 16;
        }
        if (xx >= 0x10000) {
            xx >>= 16;
            r <<= 8;
        }
        if (xx >= 0x100) {
            xx >>= 8;
            r <<= 4;
        }
        if (xx >= 0x10) {
            xx >>= 4;
            r <<= 2;
        }
        if (xx >= 0x8) {
            r <<= 1;
        }
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1; // Seven iterations should be enough
        uint256 r1 = x / r;
        return (r < r1 ? r : r1);
    }
}

/// @dev Deposit and stake want in Velodrome Gauges. Harvests VELO rewards and compounds.
///     Designed for USDC-X pairs
contract ReaperStrategyVelodromeUsdcStable is ReaperBaseStrategyv3 {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /// 3rd-party contract addresses
    address public constant VELODROME_ROUTER = address(0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9);

    /// @dev Tokens Used:
    /// {USDC} - Fees are charged in {USDC}
    /// {VELO} - Velodrome's reward
    /// {gauge} - Gauge where {want} is staked.
    /// {want} - Token staked.
    /// {lpToken0} - {want}'s underlying token.
    /// {lpToken1} - {want}'s underlying token.
    address public constant USDC = address(0x7F5c764cBc14f9669B88837ca1490cCa17c31607);
    address public constant VELO = address(0x3c8B650257cFb5f272f799F5e2b4e65093a11a05);
    address public gauge;
    address public want;
    address public lpToken0;
    address public lpToken1;

    /// @dev Arrays
    /// {rewards} - Array need to claim rewards
    /// {veloToUsdcPath} - Path from velo to usdc
    address[] public rewards;
    address[] public veloToUsdcPath;

    /// @dev tokenA => (tokenB => swapPath config): returns best path to swap
    ///         tokenA to tokenB
    mapping(address => mapping(address => address[])) public swapPath;

    /// @dev Initializes the strategy. Sets parameters and saves routes.
    /// @notice see documentation for each variable above its respective declaration.
    function initialize(
        address _vault,
        address[] memory _feeRemitters,
        address[] memory _strategists,
        address[] memory _multisigRoles,
        address _gauge
    ) public initializer {
        __ReaperBaseStrategy_init(_vault, _feeRemitters, _strategists, _multisigRoles);
        gauge = _gauge;
        want = IVeloGauge(gauge).stake();
        (lpToken0, lpToken1) = IVeloPair(want).tokens();

        // VELO, WETH, USDC
        veloToUsdcPath = [VELO, address(0x4200000000000000000000000000000000000006), USDC];
        rewards.push(VELO);
    }

    /// @dev Function that puts the funds to work.
    ///      It gets called whenever someone deposits in the strategy's vault contract.
    function _deposit() internal override {
        uint256 wantBalance = IERC20Upgradeable(want).balanceOf(address(this));
        if (wantBalance != 0) {
            uint256 wantId = IVeloGauge(gauge).tokenIds(want);
            IERC20Upgradeable(want).safeIncreaseAllowance(gauge, wantBalance);
            IVeloGauge(gauge).deposit(wantBalance, wantId);
        }
    }

    /// @dev Withdraws funds and sends them back to the vault.
    function _withdraw(uint256 _amount) internal override {
        uint256 wantBal = IERC20Upgradeable(want).balanceOf(address(this));
        if (wantBal < _amount) {

            // Calculate how much to cWant this is
            uint256 remaining = _amount - wantBal;
            IVeloGauge(gauge).withdraw(remaining);
        }
        IERC20Upgradeable(want).safeTransfer(vault, _amount);
    }

    /// @dev Core function of the strat, in charge of collecting and re-investing rewards.
    ///      1. Claims {VELO} from the {gauge}.
    ///      2. Claims fees in {USDC} for the harvest caller and treasury.
    ///      3. Swaps the remaining rewards for {want} using {VELODROME_ROUTER}.
    ///      4. Deposits and stakes into {gauge}.
    function _harvestCore() internal override returns (uint256 callerFee) {
        IVeloGauge(gauge).getReward(address(this), rewards);
        // All {VELO} is swapped to {USDC} here
        // Saves a swap because {USDC} is one of {want}'s underlying tokens
        callerFee = _chargeFees();
        _addLiquidity();
        deposit();
    }

    /// @dev Helper function to swap {_from} to {_to} given an {_amount}.
    function _swap(
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        if (_from == _to || _amount == 0) {
            return;
        }

        uint256 output;
        bool useStable;
        IVeloRouter router = IVeloRouter(VELODROME_ROUTER);
        address[] storage path = swapPath[_from][_to];
        IVeloRouter.route[] memory routes = new IVeloRouter.route[](path.length - 1);
        uint256 prevRouteOutput = _amount;

        IERC20Upgradeable(_from).safeIncreaseAllowance(VELODROME_ROUTER, _amount);
        for (uint256 i = 0; i < routes.length; i++) {
            (output, useStable) = router.getAmountOut(prevRouteOutput, path[i], path[i + 1]);
            routes[i] = IVeloRouter.route({from: path[i], to: path[i + 1], stable: useStable});
        }
        router.swapExactTokensForTokens(_amount, 0, routes, address(this), block.timestamp);
    }


    /// @dev Core harvest function.
    ///      Charges fees based on the amount of USDC gained from reward
    function _chargeFees() internal returns (uint256 callFeeToUser){
        IERC20Upgradeable usdc = IERC20Upgradeable(USDC);
        _swap(VELO,USDC,IERC20Upgradeable(VELO).balanceOf(address(this)));
        uint256 usdcFee = (usdc.balanceOf(address(this)) * totalFee) / PERCENT_DIVISOR;

        if (usdcFee != 0) {
            callFeeToUser = (usdcFee * callFee) / PERCENT_DIVISOR;
            uint256 treasuryFeeToVault = (usdcFee * treasuryFee) / PERCENT_DIVISOR;
            uint256 feeToStrategist = (treasuryFeeToVault * strategistFee) / PERCENT_DIVISOR;
            treasuryFeeToVault -= feeToStrategist;

            usdc.safeTransfer(msg.sender, callFeeToUser);
            usdc.safeTransfer(treasury, treasuryFeeToVault);
            usdc.safeTransfer(strategistRemitter, feeToStrategist);
        }
    }

    /// @dev Core harvest function.
    ///      Converts half of held {USDC} in {want}
    function _addLiquidity() internal {
        uint256 usdcBal = IERC20Upgradeable(USDC).balanceOf(address(this));
        if (usdcBal == 0) {
            return;
        }

        IVeloPair pair = IVeloPair(want);
        (uint256 reserveA, uint256 reserveB, ) = pair.getReserves();
        (address token0, address token1) = pair.tokens();
        uint256 toSwap;
        if (USDC == token0) {
            toSwap = _getSwapAmount(pair, usdcBal, reserveA, reserveB, USDC);
        } else {
            require(USDC == token1, "LP does not have USDC!");
            toSwap = _getSwapAmount(pair, usdcBal, reserveB, reserveA, USDC);
        }

        if (USDC == lpToken0) {
            _swap(USDC, lpToken1, toSwap);
        } else {
            _swap(USDC, lpToken0, toSwap);
        }

        uint256 lpToken0Bal = IERC20Upgradeable(lpToken0).balanceOf(address(this));
        uint256 lpToken1Bal = IERC20Upgradeable(lpToken1).balanceOf(address(this));
        IERC20Upgradeable(lpToken0).safeIncreaseAllowance(VELODROME_ROUTER, lpToken0Bal);
        IERC20Upgradeable(lpToken1).safeIncreaseAllowance(VELODROME_ROUTER, lpToken1Bal);
        IVeloRouter(VELODROME_ROUTER).addLiquidity(
            lpToken0,
            lpToken1,
            IVeloPair(want).stable(),
            lpToken0Bal,
            lpToken1Bal,
            0,
            0,
            address(this),
            block.timestamp
        );
    }

    /// @dev Update {SwapPath} for a specified pair of tokens.
    function updateSwapPath(address _tokenIn, address _tokenOut, address[] calldata _path) external {
        _atLeastRole(STRATEGIST);
        swapPath[_tokenIn][_tokenOut] = _path;
    }

    /// @dev Swap whole balance of a token to usdc
    ///     Should only be used to scrap lost funds.
    function guardianSwap(address _token) external {
        _atLeastRole(GUARDIAN);
        _swap(_token, USDC, IERC20Upgradeable(_token).balanceOf(address(this)));
    }

    /// @dev Function to calculate the total {want} held by the strat.
    ///      It takes into account both the funds directly held by the contract and those into the {gauge}
    function balanceOf() public view override returns (uint256) {
        return balanceInGauge() + IERC20Upgradeable(want).balanceOf(address(this));
    }

    /// @dev Returns the amount of {want} staked into the {gauge}
    function balanceInGauge() public view returns (uint256) {
        return IVeloGauge(gauge).balanceOf(address(this));
    }


    /// @dev Withdraws all funds leaving rewards behind.
    function _reclaimWant() internal override {
        IVeloGauge(gauge).withdrawAll();
    }

    function setVeloToUsdcPath(address[] memory _path) external {
        _atLeastRole(STRATEGIST);
        require(_path[0] == VELO && _path[_path.length - 1] == USDC, "INVALID INPUT");
        veloToUsdcPath = _path;
    }

    function _getSwapAmount(
        IVeloPair pair,
        uint256 investmentA,
        uint256 reserveA,
        uint256 reserveB,
        address tokenA
    ) private view returns (uint256 swapAmount) {
        uint256 halfInvestment = investmentA / 2;
        uint256 numerator = pair.getAmountOut(halfInvestment, tokenA);
        uint256 denominator = _quoteLiquidity(halfInvestment, reserveA + halfInvestment, reserveB - numerator);
        swapAmount = investmentA - Babylonian.sqrt((halfInvestment * halfInvestment * numerator) / denominator);
    }

    // Copied from Velodrome's Router since it's an internal function in there
    // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function _quoteLiquidity(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) internal pure returns (uint256 amountB) {
        require(amountA > 0, "Router: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "Router: INSUFFICIENT_LIQUIDITY");
        amountB = (amountA * reserveB) / reserveA;
    }
}
