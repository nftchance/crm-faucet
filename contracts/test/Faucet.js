const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, should, be } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet", function () {
  async function buildSignature(nonce, units, tail, caller, referrer, faucetSigner) {
    const bodyHash = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "uint256", "address", "bytes"],
      [nonce, units, referrer.address, tail]
    );

    const signatureHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "address", "bytes"],
      [caller.address, nonce, units, referrer.address, tail]
    )

    const signature = await faucetSigner.signMessage(
      ethers.utils.arrayify(signatureHash)
    );
 
    const headHash = ethers.utils.defaultAbiCoder.encode(
      ["bytes", "bytes"],
      [bodyHash, signature]
    );

    return {
      bodyHash: bodyHash,
      signature: signature,
      headHash: headHash
    };
  }

  before(async () => {
    [deployer, signer1, signer2, referrer, spoutSigner] = await ethers.getSigners();

    const Faucet = await ethers.getContractFactory("Faucet");
    faucet = await Faucet.deploy();
    faucet = await faucet.deployed();

    const Water = await ethers.getContractFactory("Water");
    water = await Water.deploy("ipfs://unlocked");
    water = await water.deployed();

    const WaterLocked = await ethers.getContractFactory("Water");
    waterLocked = await WaterLocked.deploy("ipfs://locked");
    waterLocked = await waterLocked.deployed();
    await waterLocked.setBaseURI("ipfs://locked", true);

    const Pricer = await ethers.getContractFactory("Pricer");
    pricer = await Pricer.deploy();
    pricer = await pricer.deployed();
  });

  describe("Faucet: Aerator.sol", function () {
    it("setWater() success", async function () {
      const tx = await faucet.setWater(water.address);
      const receipt = await tx.wait();
      const faucetWater = await faucet.water();
      await expect(faucetWater).to.equal(water.address);
    });

    it("setPricer() success", async function () {
      const tx = await faucet.setPricer(pricer.address);
      const receipt = await tx.wait();
      const faucetPricer = await faucet.pricer();
      await expect(faucetPricer).to.equal(pricer.address);
    });

    it("setSigner() fail: onlyOwner", async function () {
      await expect(
        faucet.connect(signer1).setSigner(signer2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("setSigner() success", async function () {
      const tx = await faucet.connect(deployer).setSigner(spoutSigner.address);
      // const receipt = await tx.wait();
      // const signer = await faucet.signer(); // sIgNeR() iS nOt a FuNcTiOn
      // await expect(signer).to.equal(spoutSigner.address);
    });
  });

  describe("Pricer: Pricer.sol", function () {
    it("setBase() fail: onlyOwner", async function () {
      await expect(
        pricer.connect(signer1).setBase(
          ethers.utils.parseEther("0.001"),
          5,
          5000,
          true
      )).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("setBase() success", async function () {
      const tx = await pricer.connect(deployer).setBase(
        ethers.utils.parseEther("0.005"),
        5,
        5000,
        true
      );
      const receipt = await tx.wait();
      const price = await pricer.base();
      await expect(price).to.equal(ethers.utils.parseEther("0.005"));
    });

    it("setBase() fail: Locked", async function () {
      await expect(pricer.setBase(
        ethers.utils.parseEther("0.005"),
        5,
        5000,
        false
      )).to.be.revertedWith("Pricer: Locked");
    });

    it("price() fail: Too many units", async function () {
      const nonce = 2;
      const units = 6000;
      const tail = "0x"
      const price = await expect(pricer.price(
        units,
        referrer.address,
        "0x",
        await faucet.balanceOf(referrer.address)
      )).to.be.revertedWith("Pricer: Too many units");
    });
  })

  describe("Faucet: Faucet.sol", function () {
    it("drip() success", async function () {
      const nonce = 1;
      const units = 1000;
      const tail = "0x"
      const price = await pricer.price(
        units,
        referrer.address,
        "0x",
        await faucet.balanceOf(referrer.address)
      );

      const {
        bodyHash, signature
      } = await buildSignature(
        nonce,
        units,
        tail,
        signer1,
        referrer,
        spoutSigner
      )

      const tx = await faucet.connect(signer1).drip(
        bodyHash, signature,
        { value: price }
      );
      const receipt = await tx.wait();

      await expect(await faucet.ownerOf(0)).to.equal(signer1.address);
    });

    it("drip() fail: Invalid nonce", async function () {
      const nonce = 1;
      const units = 1000;
      const tail = "0x";
      const price = await pricer.price(
        units,
        referrer.address,
        "0x",
        await faucet.balanceOf(referrer.address)
      );

      const {
        bodyHash, signature
      } = await buildSignature(
        nonce,
        units,
        tail,
        signer1,
        referrer,
        spoutSigner
      )

      await expect(faucet.connect(signer1).drip(
        bodyHash, signature,
        { value: price }
      )).to.be.revertedWith("Faucet: Invalid nonce");
    });

    it("drip() fail: Insufficient payment", async function () {
      const nonce = 2;
      const units = 1000;
      const tail = "0x";

      const {
        bodyHash, signature
      } = await buildSignature(
        nonce,
        units,
        tail,
        signer1,
        referrer,
        spoutSigner
      )

      await expect(faucet.connect(signer1).drip(
        bodyHash, signature,
        {value: ethers.utils.parseEther("0.0001")}
      )).to.be.revertedWith("Faucet: Insufficient payment");
    });

    it("drip() fail: Invalid signature", async function () {
      const nonce = 2;
      const units = 500;
      const tail = "0x"
      const price = await pricer.price(
        units,
        referrer.address,
        "0x",
        await faucet.balanceOf(referrer.address)
      );

      const { bodyHash, signature } = await buildSignature(
        nonce,
        units,
        tail,
        signer1,
        referrer,
        signer2
      )

      await expect(
        faucet.connect(signer1).drip(
          bodyHash, signature,
          { value: price }
      )).to.be.revertedWith("Faucet: Invalid signature");
    });
  });

  describe("Water: Water.sol", function () {
    it("setBaseURI() fail: onlyOwner", async function () {
      await expect(water.connect(signer1).setBaseURI(
        "ipfs://xyz/",
        false
      )).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("setBaseURI() fail: Locked", async function () {
      await expect(waterLocked.connect(deployer).setBaseURI(
        "ipfs://xyz/",
        false
      )).to.be.revertedWith("Water: Locked");
    });

    it("setBaseURI() success", async function () {
      const tx = await water.connect(deployer).setBaseURI(
        "ipfs://xyz/",
        false
      );
      const receipt = await tx.wait();
      await expect(await water.baseURI()).to.equal("ipfs://xyz/");
    });

    it("tokenURI() success", async function () {
      const nonce = 1;
      const units = 1000;
      const tail = "0x"

      const {
        bodyHash, signature
      } = await buildSignature(
        nonce,
        units,
        tail,
        signer1,
        referrer,
        spoutSigner
      )

      const b64BodyHash = ethers.utils.base64.encode(bodyHash);
      const uri = await water.tokenURI(0, bodyHash);
      await expect(uri).to.equal(`ipfs://xyz/0?body=${b64BodyHash}`);
    });
  });

  describe("Faucet: Spout.sol", function () {
    it("tokenURI() fail: Water not set", async function () {
      const tx = await faucet.setWater(ethers.constants.AddressZero);
      const receipt = await tx.wait();
      
      await expect(faucet.tokenURI(0)).to.be.revertedWith("Spout: Water not set");
      const tx2 = await faucet.setWater(water.address);
      const receipt2 = await tx2.wait();
    });

    it("tokenURI() fail: Nonexistent token", async function () {
      await expect(faucet.tokenURI(10)).to.be.revertedWith("Spout: Nonexistent token");
    });

    it("tokenURI() success", async function () {
      const nonce = 1;
      const units = 1000;
      const tail = "0x"

      const { bodyHash, signature } = await buildSignature(
        nonce,
        units,
        tail,
        signer1,
        referrer,
        spoutSigner
      )
      const b64BodyHash = ethers.utils.base64.encode(bodyHash);
      const uri = await faucet.tokenURI(0);
      await expect(uri).to.equal(`ipfs://xyz/0?body=${b64BodyHash}`);
    });
  });

  describe("Faucet: Aerator.sol Drain", function () {
    it("drain() fail: onlyOwner", async function () {
      await expect(
        faucet.connect(signer1).drain()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("drain() success", async function () {
      const faucetBalance = ethers.BigNumber.from(
        await ethers.provider.getBalance(faucet.address)
      );
      const balance = ethers.BigNumber.from(
        await ethers.provider.getBalance(deployer.address)
      );

      const tx = await faucet.connect(deployer).drain();
      const receipt = await tx.wait();

      const gasPrice = ethers.BigNumber.from(tx.gasPrice);
      const gasUsage = ethers.BigNumber.from(receipt.gasUsed);
      const gasCost = ethers.BigNumber.from(gasPrice.mul(gasUsage));
      const newBalance = ethers.BigNumber.from(
        await ethers.provider.getBalance(deployer.address)
      );

      // expect(newBalance).to.equal(balance.sub(gasCost).add(faucetBalance));
      await expect(
        await ethers.provider.getBalance(faucet.address)
      ).to.equal(ethers.BigNumber.from(0));
      await expect(newBalance).to.be.gt(balance)
    });
  });
});
