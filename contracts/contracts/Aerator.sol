// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

/// @dev Core dependencies.
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Helpers.
interface WaterInterface {
    /// @dev Returns whether or not the contract has been locked.
    function locked() external view returns (bool);

    /// @dev Returns the metadata URI for a given token ID.
    function tokenURI(uint256 _tokenId, bytes calldata _body)
        external
        view
        returns (string memory);
}

interface PricerInterface { 
    /// @dev Returns whether or not the contract has been locked.
    function locked() external view returns (bool);

    /// @dev Calculate the price of the purchase given the current pricing module.
    function price(uint256 _units, address _referrer, bytes calldata _tail, uint256 _referrerBalance)
        external
        view
        returns (uint256);
}

/**
 * @title Aerator
 * @dev The Aerator contains all admin functions for the Faucet.
 * @author Cogs: https://usecogs.xyz // nftchance* & masonthechain+
 */
contract Aerator is Ownable {
    /// @dev The Water contract that is used for token metadata.
    WaterInterface public water;

    /// @dev The Pricer contract that is used for token pricing.
    PricerInterface public pricer;

    /// @dev The address of the signer.
    address public signer;

    /**
     * @dev Allows the owner to set the signer address.
     * @param _signer The address of the signer.
     */
    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    /**
     * @dev Allows the owner to set the Water contract.
     * @param _water The address of the Water contract. 
     */
    function setWater(address _water) external onlyOwner {
        /// @dev Ensure the water contract has not been locked.
        require(
            address(water) == address(0) || !water.locked(),
            "Spout: Locked"
        );

        /// @dev Set the water contract.
        water = WaterInterface(_water);
    }

    /**
     * @dev Allows the owner to set the Pricer contract.
     * @param _pricer The address of the Pricer contract. 
     */
    function setPricer(address _pricer) external onlyOwner {
        /// @dev Ensure the pricer contract has not been locked.
        require(
            address(pricer) == address(0) || !pricer.locked(),
            "Spout: Locked"
        );

        /// @dev Set the pricer contract.
        pricer = PricerInterface(_pricer);
    }

    /**
     * @dev Drain the contract of all funds.
     */
    function drain() external onlyOwner {
        /// @dev Send all funds to the owner.
        payable(msg.sender).transfer(address(this).balance);
    }
}
