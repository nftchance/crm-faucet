// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

/// @dev Core dependencies.
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Pricer
 * @dev The Pricer contains all pricing logic for the Faucet.
 * @author Cogs: https://usecogs.xyz // nftchance* & masonthechain+
 */
contract Pricer is Ownable {
    /// @dev The price per unit.
    uint256 public base = 0.0005 ether;

    /// @dev The number of contacts one can download for free.
    uint256 public free = 5;

    /// @dev The maximum number of units that can be sold per transaction.
    uint256 public max = 5000;

    /// @dev Whether or not the contract has been locked.
    bool public locked = false;
    
    ////////////////////////////////////////////////////
    ///                   SETTERS                    ///
    ////////////////////////////////////////////////////

    /**
     * @dev Allows the owner of the Faucet to update the pricing engine and lock it if desired.
     * @param _base The new base price per unit.
     * @param _free The new number of units that can be downloaded for free.
     * @param _max The new maximum number of units that can be sold per transaction.
     * @param _locked Whether or not to lock the contract.
     */
    function setBase(
        uint256 _base,
        uint256 _free,
        uint256 _max,
        bool _locked
    ) external onlyOwner {
        require(!locked, "Pricer: Locked");

        base = _base;
        free = _free;
        max = _max;

        if (_locked) locked = true;
    }

    ////////////////////////////////////////////////////
    ///                   GETTERS                    ///
    ////////////////////////////////////////////////////

    /**
     * @dev Allows the owner of the Faucet to update the pricing engine and lock it if desired.
     * @param _units Whether or not to lock the contract.
     * @param _referrerBalance The balance of the referrer.
     * @return The price.
     */
    function price(
        address,
        uint256 _units,
        address,
        bytes calldata,
        uint256 _referrerBalance
    ) external view returns (uint256) {
        /// @dev Ensure the number of units is within the allowed range.
        require(_units <= max, "Pricer: Too many units");

        /// @dev If they are just getting the sample, it is free.
        if (_units <= free) return 0;

        /// @dev If there is no referrer, return here so we don't charge more gas than needed.
        if (_referrerBalance == 0) return ((_units - free) * base);

        /// @dev Calculate the price.
        return (((_units - free) * base) * 40) / 100;
    }
}
