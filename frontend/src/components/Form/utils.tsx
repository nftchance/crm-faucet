import { ethers } from "ethers";

export function buildSignature(nonce: Number, units: Number, tail: string, caller: any, referrer: any): {
    bodyHash: string,
    storedHash: string
} {
    // if referrer is empty, use the address of the caller.
    if (referrer === "") {
        referrer = ethers.utils.getAddress(caller);
    } else {
        referrer = ethers.utils.getAddress(referrer);
    }

    const bodyHash = ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256", "address", "bytes"],
        [nonce, units, referrer.address, tail]
    );

    const storedHash = ethers.utils.solidityKeccak256(
        ["uint256", "bytes"],
        [units, tail]
    );

    return {
        bodyHash,
        storedHash
    };
}