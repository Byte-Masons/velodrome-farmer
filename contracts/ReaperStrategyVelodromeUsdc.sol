// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./abstract/ReaperBaseStrategyv3.sol";
import "./interfaces/IVeloRouter.sol";
import "./interfaces/IVeloPair.sol";
import "./interfaces/IVeloGauge.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/// @dev Deposit and stake want in Velodrome Gauges. Harvests VELO rewards and compounds.
///     Designed for USDC-X pairs
contract ReaperStrategyVelodromeUsdc is ReaperBaseStrategyv3 {
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
        address[] memory rewards;
        rewards[0] = VELO;
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

        IERC20Upgradeable(_from).safeIncreaseAllowance(VELODROME_ROUTER, _amount);
        IVeloRouter router = IVeloRouter(VELODROME_ROUTER);

        (, bool useStable) = router.getAmountOut(_amount, _from, _to);
        IVeloRouter.route[] memory routes = new IVeloRouter.route[](1);
        routes[0] = IVeloRouter.route({from: _from, to: _to, stable: useStable});
        router.swapExactTokensForTokens(_amount, 0, routes, address(this), block.timestamp);
    }


    /// @dev Core harvest function.
    ///      Charges fees based on the amount of USDC gained from reward
    function _chargeFees() internal returns (uint256 callFeeToUser){
        IERC20Upgradeable usdc = IERC20Upgradeable(USDC);
        uint256 veloBal = IERC20Upgradeable(VELO).balanceOf(address(this));
        _swap(VELO, USDC, veloBal);
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

        if (USDC == lpToken0) {
            _swap(USDC, lpToken1, usdcBal / 2);
        } else {
            _swap(USDC, lpToken0, usdcBal / 2);
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
}
