// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRewardsOnlyGauge {
    struct Reward {
        address token;
        address distributor;
        uint256 period_finish;
        uint256 rate;
        uint256 last_update;
        uint256 integral;
    }

    struct RewardToken {
        address distributor;
        uint256 period_finish;
        uint256 rate;
        uint256 duration;
        uint256 received;
        uint256 paid;
    }

    function decimals() external view returns (uint256);
    function balanceOf(address _address) external view returns (uint256);
    function version() external view returns (string memory);

    function reward_tokens(uint256 index) external returns (address);

    /// @notice Address of the reward contract providing non-CRV incentives for this gaug
    /// @dev Returns `ZERO_ADDRESS` if there is no reward contract active
    function reward_contract() external view returns (address);

    /// @notice Epoch timestamp of the last call to claim from `reward_contract`
    /// @dev Rewards are claimed at most once per hour in order to reduce gas costs
    function last_claim() external view returns (uint256);

    /// @notice Get the number of already-claimed reward tokens for a user
    /// @param _addr Account to get reward amount for
    /// @param _token Token to get reward amount for
    /// @return uint256 Total amount of `_token` already claimed by `_addr`
    function claimed_reward(address _addr, address _token) external view returns (uint256);

    /// @notice Get the number of claimable reward tokens for a user
    /// @dev This call does not consider pending claimable amount in `reward_contract`.
    ///      Off-chain callers should instead use `claimable_rewards_write` as a
    ///      view method.
    /// @param _addr Account to get reward amount for
    /// @param _token Token to get reward amount for
    /// @return uint256 Claimable reward token amount
    function claimable_reward(address _addr, address _token) external view returns (uint256);

    function reward_data(address _token) external view returns (Reward memory);

    /// @notice Get the number of claimable reward tokens for a user
    /// @dev This function should be manually changed to "view" in the ABI
    ///      Calling it via a transaction will claim available reward tokens
    /// @param _addr Account to get reward amount for
    /// @param _token Token to get reward amount for
    /// @return uint256 Claimable reward token amount
    function claimable_reward_write(address _addr, address _token) external returns (uint256);

    /// @notice Set the default reward receiver for the caller.
    /// @dev When set to ZERO_ADDRESS, rewards are sent to the caller
    /// @param _receiver Receiver address for any rewards claimed via `claim_rewards`
    function set_rewards_receiver(address _receiver) external;

    /// @notice Claim available reward tokens for `_addr`
    /// @param _addr Address to claim for
    /// @param _receiver Address to transfer rewards to - if set to
    ///                  ZERO_ADDRESS, uses the default reward receiver
    ///                  for the caller
    function claim_rewards(address _addr, address _receiver) external;
    function claim_rewards(address _addr) external;

    /// @notice Deposit `_value` LP tokens
    /// @dev Depositting also claims pending reward tokens
    /// @param _value Number of tokens to deposit
    /// @param _addr Address to deposit for, default msg.sender
    /// @param _claim_rewards bool, default FALSE
    function deposit(uint256 _value, address _addr, bool _claim_rewards) external;
    function deposit(uint256 _value, address _addr) external;
    function deposit(uint256 _value) external;

    /// @notice Withdraw `_value` LP tokens
    /// @dev Withdrawing also claims pending reward tokens
    /// @param _value Number of tokens to withdraw
    /// @param _claim_rewards bool, default FALSE
    function withdraw(uint256 _value, bool _claim_rewards) external;
    function withdraw(uint256 _value) external;

    /// @notice Transfer token for a specified address
    /// @dev Transferring claims pending reward tokens for the sender and receiver
    /// @param _to The address to transfer to.
    /// @param _value The amount to be transferred.
    function transfer(address _to, uint256 _value) external returns (bool);

    /// @notice Transfer tokens from one address to another.
    /// @dev Transferring claims pending reward tokens for the sender and receiver
    /// @param _from address The address which you want to send tokens from
    /// @param _to address The address which you want to transfer to
    /// @param _value uint256 the amount of tokens to be transferred
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);

    /// @notice Get `spender`'s current allowance from `owner`
    function allowance(address owner, address spender) external view returns (uint256);

    /// @notice Approve the passed address to transfer the specified amount of
    ///         tokens on behalf of msg.sender
    /// @dev Beware that changing an allowance via this method brings the risk
    ///      that someone may use both the old and new allowance by unfortunate
    ///      transaction ordering. This may be mitigated with the use of
    ///      {incraseAllowance} and {decreaseAllowance}.
    ///      https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    /// @param _spender The address which will transfer the funds
    /// @param _value The amount of tokens that may be transferred
    /// @return bool success
    function approve(address _spender, uint256 _value) external returns (bool);

    /// @notice Approves spender by owner's signature to expend owner's tokens.
    ///     See https://eips.ethereum.org/EIPS/eip-2612.
    /// @dev Inspired by https://github.com/yearn/yearn-vaults/blob/main/contracts/Vault.vy#L753-L793
    /// @dev Supports smart contract wallets which implement ERC1271
    ///     https://eips.ethereum.org/EIPS/eip-1271
    /// @param _owner The address which is a source of funds and has signed the Permit.
    /// @param _spender The address which is allowed to spend the funds.
    /// @param _value The amount of tokens to be spent.
    /// @param _deadline The timestamp after which the Permit is no longer valid.
    /// @param _v The bytes[64] of the valid secp256k1 signature of permit by owner
    /// @param _r The bytes[0:32] of the valid secp256k1 signature of permit by owner
    /// @param _s The bytes[32:64] of the valid secp256k1 signature of permit by owner
    /// @return True, if transaction completes successfully
    function permit(address _owner, address _spender, uint256 _value, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external returns (bool);

    /// @notice Increase the allowance granted to `_spender` by the caller
    /// @dev This is alternative to {approve} that can be used as a mitigation for
    ///      the potential race condition
    /// @param _spender The address which will transfer the funds
    /// @param _added_value The amount of to increase the allowance
    /// @return bool success
    function increaseAllowance(address _spender, uint256 _added_value) external returns (bool);

    /// @notice Decrease the allowance granted to `_spender` by the caller
    /// @dev This is alternative to {approve} that can be used as a mitigation for
    ///      the potential race condition
    /// @param _spender The address which will transfer the funds
    /// @param _subtracted_value The amount of to decrease the allowance
    /// @return bool success
    function decreaseAllowance(address _spender, uint256 _subtracted_value) external returns (bool);

    /// @notice Set the active reward contract
    /// @dev A reward contract cannot be set while this contract has no deposits
    /// @param _reward_contract Reward contract address. Set to ZERO_ADDRESS to
    ///                         disable staking.
    /// @param _claim_sig Four byte selectors for staking, withdrawing and claiming,
    ///              left padded with zero bytes. If the reward contract can
    ///              be claimed from but does not require staking, the staking
    ///              and withdraw selectors should be set to 0x00
    /// @param _reward_tokens List of claimable reward tokens. New reward tokens
    ///                       may be added but they cannot be removed. When calling
    ///                       this function to unset or modify a reward contract,
    ///                       this array must begin with the already-set reward
    ///                       token addresses.
    function set_rewards(address _reward_contract, bytes32 _claim_sig, address[] calldata _reward_tokens) external;

    function initialize(address _lp_token, address _reward_contract, bytes32 _claim_sig) external;
}