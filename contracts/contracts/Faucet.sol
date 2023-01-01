// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import { Spout } from "./Spout.sol";

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { Base64 } from "./Base64.sol"; 

contract Faucet is 
      Spout
    , ERC721
{
    using Strings for uint256;

    /// @dev The number of contacts one can download for free.
    uint256 public constant free = 5;

    /// @dev The maximum number of units that can be sold per transaction.
    uint256 public constant max = 5000;

    /// @dev Unit pricing for each contact.
    uint256 public constant delta = 0.005 ether;

    /// @dev The number of units sold per bonding curve step.
    /// @notice A bonding curve is in place to minimize unit competition and 
    ///         promote the utilization of the secondary market after consumption.
    ///         With a bonding curve, users have the ability to recoup cost
    ///         by the nature of increasing cost for future unit-access.
    uint256 public constant gamma = 100000;

    /// @dev The volality of activity for a represented token based on token impact.
    uint256 public constant vega = 1000;

    /// @dev The number of units stored inside an NFT.
    mapping(uint256 => uint256) public tokenToUnits;

    constructor() ERC721("Faucet", "FCT") {}

    /**
     * @dev Drip an NFT and the relevant number of units into the owning wallet.
     * @param _units The number of units to drip.
     */
    function drip(
        uint256 _units
    ) 
        external 
        payable 
    {
        /// @dev Calculate the price of the units.
        uint256 price = drop(units - theta, _units);

        /// @dev Ensure the caller has paid the price.
        require(msg.value >= price, "Faucet: Insufficient payment");

        /// @dev Increment the number of units sold.
        units += _units;

        /// @dev Store how many units are inside the NFT.
        tokenToUnits[units] = _units;

        /// @dev Mint the NFT to the executing wallet.
        _mint(msg.sender, units);

        /// @dev If the caller has overpaid, refund the excess.
        /// @notice This is in place due to potential price 'slippage' in the bonding curve.
        if(msg.value > price) payable(msg.sender).transfer(msg.value - price);
    }

    /**
     * @dev Calculate the continuous price of a number of units.
     * @param _start The starting point of the bonding curve.
     * @param _units The number of units to calculate the price of.
     * @return price The price of the units.
     */
    function drop(
          uint256 _start
        , uint256 _units
    ) 
        public 
        returns (
            uint256 price
        ) 
    {
        /// @dev If the caller is minting the sample batch of units it is free.
        if(_units <= free) return 0;

        /// @dev Determine the step in the bonding curve.
        uint256 step = (_start + _units) / gamma;

        /// @dev Calculate the price of the units.
        price = delta * _units * (step + 1);

        /// @dev If the caller is buying more than the remaining units in the step, add the price of the remainder.
        if(_units > gamma - (_start % gamma)) {
            /// @notice Max-depth recursion will explode however is not possible due to max units per transaction.
            price += drop(
                  _start + gamma - (_start % gamma)
                , _units - (gamma - (_start % gamma))
            );
        }
    }

    function aerator(
          uint256 _tokenId
        , uint256 _units
    )
        internal
        pure
        returns (string memory uri)
    {
        uint256 i; 

        for(
            i;
            i < _units / vega;
            i++
        ) { 
            uri = string(
                abi.encodePacked(
                      uri
                    , '<circle cx="270" cy="270" r="'
                    , 230 - 20 * (i + 1)
                    , '" fill="none" stroke="black" stroke-width="10" filter="url(#a)" />'
                )
            );
        }

        return string(
            abi.encodePacked(
                  'data:image/svg+xml;base64'
                , Base64.encode(
                    bytes(
                        string(
                            abi.encodePacked(
                                  prepend
                                , _tokenId.toString()
                                , '0.03'
                                , _tokenId.toString()
                                , '; 0.05 0.05; 0.01'
                                , _tokenId.toString()
                                , '0.03'
                                , _tokenId.toString()
                                , '" dur="15s" repeatCount="indefinite" /></feTurbulence><feDisplacementMap in="SourceGraphic" in2="turbulence"><animate attributeName="scale" values="10; 20; 10" dur="15s" repeatCount="indefinite" /></feDisplacementMap></filter><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="1" result="turbulence" /><feDisplacementMap in="SourceGraphic" in2="turbulence"><animate attributeName="scale" values="10; 25; 30; 25; 10" dur="10s" repeatCount="indefinite" /></feDisplacementMap></filter><g><animateTransform attributeName="transform" type="rotate" from="0 270 270" to="360 270 270" dur="30s" repeatCount="indefinite" />'
                                , uri
                                , '</g><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80" font-family="sans-serif" filter="url(#b)">'
                                , _units.toString()
                                , '</text></svg>'
                            )
                        )
                    )
                )
            )
        );
    }

    function escutcheon(
          uint256 _units
        , uint256 _max
    )
        internal
        pure
        returns (string memory)
    {
        ///@dev Reflect the current number of Story Votes the owner of a Comic token earns through ownership.
        return string(
            abi.encodePacked(
                  '","attributes":[{"display_type":"number","trait_type":"Contacts","value":"'
                , _units.toString()
                , '","max_value":"'
                , _max.toString()
                , '"}]}'
            )
        );
    }

    function tokenURI(
        uint256 _tokenId
    )
        override
        public 
        view 
        returns (
            string memory
        ) 
    {
        uint256 tokenUnits = tokenToUnits[_tokenId];

        /// @dev Build the metadata string and return it as encoded data
        return string(
            abi.encodePacked(
                  "data:application/json;base64,"
                , Base64.encode(
                    bytes(  
                        abi.encodePacked(
                              '{"name":"Faucet #'
                            , _tokenId.toString()
                            , '","description":"A faucet for the Aerator collection.","image":"'
                            , aerator(
                                    _tokenId
                                  , tokenUnits
                              )
                            , escutcheon(
                                    tokenToUnits[_tokenId]
                                  , max
                              )
                        )
                    )
                )
            )
        );
    }
}