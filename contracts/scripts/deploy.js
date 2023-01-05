const hre = require("hardhat");

async function main() {
  const signerAddress = "TODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODO"

  const Water = await hre.ethers.getContractFactory("Water");
  const water = await Water.deploy("https://api.faucet.usecogs.xyz/");

  await water.deployed();

  console.log("Water deployed to:", water.address);

  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy();

  await faucet.deployed();

  console.log("Faucet deployed to:", faucet.address);

  // Set the water on the Faucet contract
  await faucet.setWater(water.address);

  // Set the signer on the Faucet contract
  await faucet.setSigner(signerAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
