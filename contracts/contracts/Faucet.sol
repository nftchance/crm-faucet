// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import {Spout} from "./Spout.sol";

contract Faucet is Spout {
    /// @dev The number of contacts one can download for free.
    uint256 public constant free = 5;

    /// @dev The price per unit.
    uint256 public constant base = 0.0005 ether;

    /// @dev The number of units sold.
    uint256 public units;

    /**
     * @dev Drip an NFT and the relevant number of units into the owning wallet.
     * @param _units The number of units to drip.
     */
    function drip(uint256 _units) external payable {
        require(_units > 0, "Faucet: Units must be greater than zero");

        /// @dev Ensure the caller is not trying to drip more than the maximum.
        require(_units <= max, "Faucet: Exceeds maximum");

        /// @dev Ensure the caller has paid the price.
        require(msg.value >= base * _units, "Faucet: Insufficient payment");

        /// @dev Increment the number of units sold.
        units += _units;

        /// @dev Store how many units are inside the NFT.
        tokenToUnits[units] = _units;

        /// @dev Mint the NFT to the executing wallet.
        _mint(msg.sender, units);
    }
}
