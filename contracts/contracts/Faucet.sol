// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

/// @dev Core dependencies.
import {Spout} from "./Spout.sol";

/**
 * @title Faucet
 * @dev A user interface contract for users of the Cog Faucet to buy access to a certain number of units.
 * @author Cogs: https://usecogs.xyz // nftchance* & masonthechain+
 */
contract Faucet is Spout {
    ////////////////////////////////////////////////////
    ///                   MINTERS                    ///
    ////////////////////////////////////////////////////

    /**
     * @dev Drip an NFT and the relevant number of units into the owning wallet.
     * @param _body The signed ornament to drip.
     * @param _signature The signature of the ornament.
     */
    function drip(bytes calldata _body, bytes calldata _signature)
        external
        payable
    {
        /// @dev Confirm the nft mint is not leaking.
        _leakProof(_body, _signature);

        /// @dev Mint the NFT to the executing wallet.
        _safeMint(msg.sender, bodies.length - 1);
    }
}
