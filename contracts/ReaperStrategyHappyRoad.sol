// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./abstract/ReaperBaseStrategyv3.sol";
import "./interfaces/IAsset.sol";
import "./interfaces/IBasePool.sol";
import "./interfaces/IBaseWeightedPool.sol";
import "./interfaces/IBeetVault.sol";
import "./interfaces/IRewardsOnlyGauge.sol";
import "./interfaces/IMasterChef.sol";
import "./interfaces/ISwapper.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/**
 * @dev LP compounding strategy for Two Gods One Pool Beethoven-X pool.
 */
contract ReaperStrategyHappyRoad is ReaperBaseStrategyv3 {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // 3rd-party contract addresses
    address public constant BEET_VAULT = address(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

    /**
     * @dev Tokens Used:
     * {want} - LP token for the Beethoven-x pool.
     * {underlyings} - Array of IAsset type to represent the underlying tokens of the pool.
     * {joinErc} - underlying asset used to create want BPT
     * {reward} - token received as reward
     */
    address public want;
    IAsset[] underlyings;
    address public joinErc;
    address public reward;

    /**
     * @dev Strategy variables
     * {gauge} - ID of MasterChef pool in which to deposit LP tokens REWARDGAUGE
     * {beetsPoolId} - bytes32 ID of the Beethoven-X pool corresponding to {want}
     * {joinErcPosition} - index of asset used to join pool
     */
    address public gauge; //rewardGauge
    bytes32 public beetsPoolId;
    bytes32 public rewardJoinErcPool;
    uint256 public joinErcPosition;

    /// Fee variables
    /// {rewardUsdcPool} - bytes32 of the pool used to swap rewards to USDC
    /// {USDC} - fees are charged in USDC
    bytes32 public rewardUsdcPool;
    address public constant USDC = address(0x7F5c764cBc14f9669B88837ca1490cCa17c31607);

    bytes32 public constant beetsRewardPool = 0x7ef99013e446ddce2486b8e04735b7019a115e6f000100000000000000000005;
    address public constant BEETS = address(0x97513e975a7fA9072c72C92d8000B0dB90b163c5);
    /**
     * @dev Initializes the strategy. Sets parameters and saves routes.
     * @notice see documentation for each variable above its respective declaration.
     */
    function initialize(
        address _vault,
        address[] memory _feeRemitters,
        address[] memory _strategists,
        address[] memory _multisigRoles,
        address _want,
        address _joinErc,
        address _gauge,
        bytes32 _rewardUsdcPool,
        bytes32 _rewardJoinErcPool
    ) public initializer {
        __ReaperBaseStrategy_init(_vault, _feeRemitters, _strategists, _multisigRoles);
        want = _want;
        joinErc = _joinErc;
        gauge = _gauge;
        rewardUsdcPool = _rewardUsdcPool;
        rewardJoinErcPool = _rewardJoinErcPool;
        beetsPoolId = IBasePool(want).getPoolId();

        reward = IRewardsOnlyGauge(gauge).reward_tokens(0);
        (IERC20Upgradeable[] memory tokens, , ) = IBeetVault(BEET_VAULT).getPoolTokens(beetsPoolId);
        for (uint256 i = 0; i < tokens.length; i++) {
            if (address(tokens[i]) == joinErc) {
                joinErcPosition = i;
            }

            underlyings.push(IAsset(address(tokens[i])));
        }
    }

    /**
     * @dev Function that puts the funds to work.
     *      It gets called whenever someone deposits in the strategy's vault contract.
     */
    function _deposit() internal override {
        uint256 wantBalance = IERC20Upgradeable(want).balanceOf(address(this));
        IERC20Upgradeable(want).safeApprove(gauge, wantBalance);
        if (wantBalance != 0) {
            IRewardsOnlyGauge(gauge).deposit(wantBalance);
        }
    }

    /**
     * @dev Withdraws funds and sends them back to the vault.
     */
    function _withdraw(uint256 _amount) internal override {
        uint256 wantBal = IERC20Upgradeable(want).balanceOf(address(this));
        if (wantBal < _amount) {
            IRewardsOnlyGauge(gauge).withdraw(_amount - wantBal, false);
        }

        IERC20Upgradeable(want).safeTransfer(vault, _amount);
    }

    /**
     * @dev Core function of the strat, in charge of collecting and re-investing rewards.
     *      1. Claims {BAL} from the {gauge}.
     *      2. Uses totalFee% of {DEUS} and all of {BEETS} to swap to {WFTM} and charge fees.
     *      3. Swaps any leftover {WFTM} to {DEUS}.
     *      4. Joins {beetsPoolId} using {DEUS}.
     *      5. Deposits.
     */
    function _harvestCore() internal override returns (uint256 callerFee) {
        IRewardsOnlyGauge(gauge).claim_rewards(address(this));
        _swapBeetsToReward();
        callerFee = _chargeFees();
        _swapToJoinErc();
        _joinPool();
        deposit();
    }

    function _chargeFees() internal returns (uint256 callFeeToUser) {
        uint256 rewardBal = IERC20Upgradeable(reward).balanceOf(address(this));
        _swap(reward, USDC, (rewardBal * totalFee) / PERCENT_DIVISOR, rewardUsdcPool);

        IERC20Upgradeable usdc = IERC20Upgradeable(USDC);
        uint256 usdcFee = usdc.balanceOf(address(this));

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

    function _swapToJoinErc() internal {
        uint256 rewardBal = IERC20Upgradeable(reward).balanceOf(address(this));
        _swap(reward, joinErc, rewardBal, rewardJoinErcPool);
    }

    function _swapBeetsToReward() internal {
        uint256 beetsBal = IERC20Upgradeable(BEETS).balanceOf(address(this));
        _swap(BEETS, reward, beetsBal, beetsRewardPool);
    }

     /**
     * @dev Core harvest function. Swaps {_amount} of {_from} to {_to} using {_poolId}.
     */
    function _swap(
        address _from,
        address _to,
        uint256 _amount,
        bytes32 _poolId
    ) internal {
        if (_from == _to || _amount == 0) {
            return;
        }

        IBeetVault.SingleSwap memory singleSwap;
        singleSwap.poolId = _poolId;
        singleSwap.kind = IBeetVault.SwapKind.GIVEN_IN;
        singleSwap.assetIn = IAsset(_from);
        singleSwap.assetOut = IAsset(_to);
        singleSwap.amount = _amount;
        singleSwap.userData = abi.encode(0);

        IBeetVault.FundManagement memory funds;
        funds.sender = address(this);
        funds.fromInternalBalance = false;
        funds.recipient = payable(address(this));
        funds.toInternalBalance = false;

        IERC20Upgradeable(_from).safeIncreaseAllowance(BEET_VAULT, _amount);
        IBeetVault(BEET_VAULT).swap(singleSwap, funds, 1, block.timestamp);
    }

    /**
     * @dev Core harvest function. Joins {beetsPoolId} using {joinErc} balance;
     */
    function _joinPool() internal {
        uint256 joinErcBal = IERC20Upgradeable(joinErc).balanceOf(address(this));
        if (joinErcBal == 0) {
            return;
        }

        IBaseWeightedPool.JoinKind joinKind = IBaseWeightedPool.JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT;
        uint256[] memory amountsIn = new uint256[](underlyings.length);
        amountsIn[joinErcPosition] = joinErcBal;
        uint256 minAmountOut = 1;
        bytes memory userData = abi.encode(joinKind, amountsIn, minAmountOut);

        IBeetVault.JoinPoolRequest memory request;
        request.assets = underlyings;
        request.maxAmountsIn = amountsIn;
        request.userData = userData;
        request.fromInternalBalance = false;

        IERC20Upgradeable(joinErc).safeIncreaseAllowance(BEET_VAULT, joinErcBal);
        IBeetVault(BEET_VAULT).joinPool(beetsPoolId, address(this), address(this), request);
    }

    /**
     * @dev Function to calculate the total {want} held by the strat.
     *      It takes into account both the funds in hand, plus the funds in the MasterChef.
     */
    function balanceOf() public view override returns (uint256) {
        uint256 amount = IRewardsOnlyGauge(gauge).balanceOf(address(this));
        return amount + IERC20Upgradeable(want).balanceOf(address(this));
    }

    /**
     * @dev Withdraws all funds leaving rewards behind.
     */
    function _reclaimWant() internal override {
        uint256 wantBal = IRewardsOnlyGauge(gauge).balanceOf(address(this));
        IRewardsOnlyGauge(gauge).withdraw(wantBal);
    }
}
