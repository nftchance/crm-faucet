// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

/// @dev Core dependencies.
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Helpers.
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "./Base64.sol";

/**
 * @title Water
 * @dev The Water contract is used to generate the metadata for the Faucet.
 * @author Cogs: https://usecogs.xyz // nftchance* & masonthechain+
 */
contract Water is Ownable {
    using Strings for uint256;

    /// @dev The base URI for the metadata engine.
    string public baseURI;

    /// @dev Whether or not the contract has been locked.
    bool public locked;

    /// @dev Load up the initial metadata.
    constructor(string memory _baseURI) {
        baseURI = _baseURI;
    }

    ////////////////////////////////////////////////////
    ///                   SETTERS                    ///
    ////////////////////////////////////////////////////

    /**
     * @dev Allows the owner of the Faucet to update the metadata engine and lock it if desired.
     * @param _baseURI The new base URI for the metadata engine.
     * @param _locked Whether or not to lock the contract.
     */
    function setBaseURI(string memory _baseURI, bool _locked)
        external
        onlyOwner
    {
        /// @dev Ensure the contract has not been locked.
        require(!locked, "Water: Locked");

        /// @dev Update the base URI.
        baseURI = _baseURI;

        /// @dev Lock the contract if desired.
        if (_locked) locked = true;
    }

    ////////////////////////////////////////////////////
    ///                   GETTERS                    ///
    ////////////////////////////////////////////////////

    /**
     * @dev Returns the metadata URI for a given token ID.
     * @param _tokenId The token ID to generate the URI for.
     * @param _body The body of the NFT.
     * @return The metadata URI.
     */
    function tokenURI(uint256 _tokenId, bytes calldata _body)
        public
        view
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    baseURI,
                    _tokenId.toString(),
                    "?body=",
                    Base64.encode(_body)
                )
            );
    }
}
