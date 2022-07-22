// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

interface IDeusRewarder {
    function pendingToken(uint256 _pid, address _user) external view returns (uint256 pending);

    function pendingTokens(
        uint256 pid,
        address user,
        uint256
    ) external view returns (address[] memory rewardTokens, uint256[] memory rewardAmounts);
}
