// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./abstract/ReaperBaseStrategyv3.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IVeloRouter.sol";
import "./interfaces/IVeloPair.sol";
import "./interfaces/IVeloGauge.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/// @dev Deposit and stake want in Velodrome Gauges. Harvests VELO rewards and compounds.
///      Designed for DAI-X pairs
///      DAI is the token used for fees
contract ReaperStrategyVelodromeDai is ReaperBaseStrategyv3 {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /// 3rd-party contract addresses
    address public constant VELODROME_ROUTER = address(0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9);

    /// @dev Tokens Used:
    /// {DAI} - Fees are charged in {DAI}
    /// {VELO} - Velodrome's reward
    /// {gauge} - Gauge where {want} is staked.
    /// {want} - Token staked.
    /// {lpToken0} - {want}'s underlying token.
    /// {lpToken1} - {want}'s underlying token.
    address public constant DAI = address(0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1);
    address public constant VELO = address(0x3c8B650257cFb5f272f799F5e2b4e65093a11a05);
    address public gauge;
    address public want;
    address public lpToken0;
    address public lpToken1;

    address[] public veloToDaiPath;

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
    ///      2. Claims fees in {DAI} for the harvest caller and treasury.
    ///      3. Swaps the remaining rewards for {want} using {VELODROME_ROUTER}.
    ///      4. Deposits and stakes into {gauge}.
    function _harvestCore() internal override returns (uint256 callerFee) {
        IVeloGauge(gauge).getReward(address(this), VELO);
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
    ///      Charges fees based on the amount of DAI gained from reward
    function _chargeFees() internal returns (uint256 callFeeToUser){
        IERC20Upgradeable dai = IERC20Upgradeable(DAI);
        for (uint256 i; i < veloToDaiPath.length - 1; i++) {
            _swap(veloToDaiPath[i],veloToDaiPath[i+1],IERC20Upgradeable(veloToDaiPath[i]).balanceOf(address(this)));
        }
        uint256 daiFee = (dai.balanceOf(address(this)) * totalFee) / PERCENT_DIVISOR;

        if (daiFee != 0) {
            callFeeToUser = (daiFee * callFee) / PERCENT_DIVISOR;
            uint256 treasuryFeeToVault = (daiFee * treasuryFee) / PERCENT_DIVISOR;
            uint256 feeToStrategist = (treasuryFeeToVault * strategistFee) / PERCENT_DIVISOR;
            treasuryFeeToVault -= feeToStrategist;

            dai.safeTransfer(msg.sender, callFeeToUser);
            dai.safeTransfer(treasury, treasuryFeeToVault);
            dai.safeTransfer(strategistRemitter, feeToStrategist);
        }
    }

    /// @dev Core harvest function.
    ///      Converts half of held {DAI} in {want}
    function _addLiquidity() internal {
        uint256 daiBal = IERC20Upgradeable(DAI).balanceOf(address(this));
        if (daiBal == 0) {
            return;
        }

        if (DAI == lpToken0) {
            _swap(DAI, lpToken1, daiBal / 2);
        } else {
            _swap(DAI, lpToken0, daiBal / 2);
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

    function setVeloToDaiPath(address[] _path) external {
        _atLeastRole(STRATEGIST);
        require(_path[0] == VELO && _path[_path.length - 1] == DAI, "INVALID INPUT");
        veloToDaiPath = _path;
    }
}
