// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Spout is
    Ownable
{
    string public constant prepend = '<svg width="540" height="540" viewBox="0 0 540 540" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg"><filter id="a"><feTurbulence type="fractalNoise" numOctaves="1" result="turbulence"><animate attributeName="baseFrequency" values="0.01';

    /// @dev Reflects the bonding curve decay to maintain price.
    uint256 public theta;

    /// @dev The number of units sold.
    uint256 public units;

    /**
     * @dev Set the theta value.
     * @param _theta The new theta value.
     */
    function dilate(
        uint256 _theta
    )
        external
        onlyOwner
    {
        require(
              _theta <= units
            , "Faucet: Theta cannot be greater than units sold"
        );

        theta = _theta;
    }

    /**
     * @dev Drain the contract of all funds.
     */
    function drain()
        external 
        onlyOwner 
    {
        payable(msg.sender).transfer(address(this).balance);
    }
}