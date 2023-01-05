// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

/// @dev Core dependencies.
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Aerator} from "./Aerator.sol";

/// @dev Helpers.
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Spout
 * @dev The Spout of the Faucet controls the backing NFT logic and moves the core logic
 *      away from the "main" contract so that noobs believe there to be less code than there is.
 *      Don't ask me why people seeing less code is perceived as a good thing, but it is.
 * @author Cogs: https://usecogs.xyz // nftchance* & masonthechain+
 */
contract Spout is ERC721, Aerator {
    using ECDSA for bytes32;

    /// @dev The number of times an ornament signature has been used.
    mapping(address => uint256) public nonces;

    /// @dev The number of units stored inside an NFT.
    bytes[] public bodies;

    /// @dev Initialize the ERC721.
    constructor() ERC721("Cogs Faucet", "CFCT") {}

    /**
     * See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        /// @dev Ensure that the water contract has been set.
        require(address(water) != address(0), "Spout: Water not set");

        /// @dev Ensure the token exists.
        require(_exists(_tokenId), "Spout: Nonexistent token");

        /// @dev Build the metadata string and return it.
        return water.tokenURI(_tokenId, bodies[_tokenId]);
    }

    /**
     * @dev Leak proof the body of the ornament.
     * @param _body The signed ornament to leak proof.
     * @param _signature The signature of the ornament.
     */
    function _leakProof(bytes calldata _body, bytes calldata _signature)
        internal
    {
        /// @dev Recover the data from the body.
        (
            uint256 _nonce,
            uint256 _units,
            address _referrer,
            bytes memory _tail
        ) = abi.decode(_body, (uint256, uint256, address, bytes));

        /// @dev Hash the body.
        bytes32 _hash = keccak256(
            abi.encodePacked(msg.sender, _nonce, _units, _referrer, _tail)
        );

        /// @dev Ensure the ornament has not been used before.
        require(_nonce == ++nonces[msg.sender], "Faucet: Invalid nonce");

        /// @dev Ensure the signature is valid.
        require(
            _hash.toEthSignedMessageHash().recover(_signature) == signer,
            "Faucet: Invalid signature"
        );
        
        /// @dev Ensure the caller has paid the price of the plumber.
        bool leaky = msg.value <
            pricer.price(_units, _referrer, _tail, balanceOf(_referrer));

        /// @dev Ensure the caller has paid the price.
        require(!leaky, "Faucet: Insufficient payment");
    }
}
