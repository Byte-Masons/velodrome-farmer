// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ISwapper {
    function swap(
        address _from,
        address _to,
        uint256 _amount
    ) external;
}
