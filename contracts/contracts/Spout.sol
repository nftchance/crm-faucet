// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "./Base64.sol";

contract Spout is Ownable, ERC721 {
    using Strings for uint256;

    /// @dev The maximum number of units that can be sold per transaction.
    uint256 public constant max = 5000;

    /// @dev The number of units stored inside an NFT.
    mapping(uint256 => uint256) public tokenToUnits;

    constructor() ERC721("Faucet", "FCT") {}

    function tokenMetadata(uint256 _units, uint256 _max)
        internal
        pure
        returns (string memory)
    {
        ///@dev Reflect the current number of Story Votes the owner of a Comic token earns through ownership.
        return
            string(
                abi.encodePacked(
                    '","attributes":[{"display_type":"number","trait_type":"Contacts","value":"',
                    _units.toString(),
                    '","max_value":"',
                    _max.toString(),
                    '"}]}'
                )
            );
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        uint256 tokenUnits = tokenToUnits[_tokenId];

        /// @dev Build the metadata string and return it as encoded data
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"Faucet #',
                                _tokenId.toString(),
                                '","description":"A faucet for the Aerator collection.","image":"',
                                tokenMetadata(_tokenId, tokenUnits),
                            )
                        )
                    )
                )
            );
    }

    /**
     * @dev Drain the contract of all funds.
     */
    function drain() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
