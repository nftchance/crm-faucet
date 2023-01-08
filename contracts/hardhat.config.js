require("hardhat-gas-reporter");
require('hardhat-deploy');
require("hardhat-watcher");
require("hardhat-tracer");
require("hardhat-abi-exporter");
require("hardhat-api-builder");
require("hardhat-docgen");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('solidity-coverage');
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

task("deploy", "Deploys the protocol")
    .addOptionalParam("verify", "Verify the deployed contracts on Etherscan", false, types.boolean)
    .setAction(async (taskArgs, hre) => {
        const willVerify = taskArgs.verify !== false
        console.log(`Will verify`, willVerify)

        // TODO: CHANGE THESE SETTINGS
        const baseURI = "baseURI/unset"
        const basePrice = "0.005"
        const freeLeads = 5
        const maxLeads = 5000
        // TODO: CHANGE THESE SETTINGS

        await hre.run('compile');

        const [deployer] = await ethers.getSigners();
        console.log(`✅ Connected to ${deployer.address}`);

        const chainId = await getChainId()
        console.log('✅ Connected to chain ' + chainId)

        const Faucet = await ethers.getContractFactory("Faucet");
        faucet = await Faucet.deploy();
        faucet = await faucet.deployed();
        console.log("✅ Faucet Deployed.")
        faucetDeployment = {
            "Deployer": deployer.address,
            "Faucet Address": faucet.address,
            "Remaining ETH Balance": parseInt((await deployer.getBalance()).toString()) / 1000000000000000000,
        }
        console.table(faucetDeployment)

        const Water = await ethers.getContractFactory("Water");
        water = await Water.deploy(baseURI);
        water = await water.deployed();
        console.log("✅ Water Deployed.")
        waterDeployment = {
            "Deployer": deployer.address,
            "Water Address": water.address,
            "Remaining ETH Balance": parseInt((await deployer.getBalance()).toString()) / 1000000000000000000,
        }
        console.table(waterDeployment)

        const Pricer = await ethers.getContractFactory("Pricer");
        pricer = await Pricer.deploy();
        pricer = await pricer.deployed();
        console.log("✅ Pricer Deployed.")
        pricerDeployment = {
            "Deployer": deployer.address,
            "Pricer Address": pricer.address,
            "Remaining ETH Balance": parseInt((await deployer.getBalance()).toString()) / 1000000000000000000,
        }
        console.table(pricerDeployment)

        let tx = await faucet.setWater(water.address);
        await tx.wait();
        console.log("✅ Faucet setWater")

        tx = await faucet.setPricer(pricer.address);
        await tx.wait();
        console.log("✅ Faucet setPricer")

        tx = await pricer.setBase(
            ethers.utils.parseEther(basePrice),
            freeLeads,
            maxLeads,
            false
        )
        console.log("✅ Pricer setBase")

        // Verifying
        if (taskArgs.verify !== false && chainId != '31337') {
            // Give time for etherscan to confirm the contract before verifying.
            await new Promise(r => setTimeout(r, 30000));
            await hre.run("verify:verify", {
                address: faucet.address,
                constructorArguments: [],
            });
            console.log("✅ Faucet Verified.")

            await new Promise(r => setTimeout(r, 30000));
            await hre.run("verify:verify", {
                address: water.address,
                constructorArguments: [baseURI],
            });
            console.log("✅ Water Verified.")

            await new Promise(r => setTimeout(r, 30000));
            await hre.run("verify:verify", {
                address: pricer.address,
                constructorArguments: [],
            });
            console.log("✅ Pricer Verified.")
        }
    }
    );


module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: { // Keeps the amount of gas used in check
                        enabled: true,
                        runs: 1000000
                    }
                }
            }
        ],
    },
    gasReporter: {
        currency: 'USD',
        gasPrice: 60,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        showMethodSig: true,
        showTimeSpent: true,
    },
    watcher: {
        compilation: {
            tasks: ["compile"],
            files: ["./contracts"],
            verbose: true,
        },
        ci: {
            tasks: [
                "clean",
                { command: "compile", params: { quiet: true } },
                { command: "test", params: { noCompile: true, testFiles: ["testfile.ts"] } }
            ],
        }
    },
    abiExporter: {
        path: 'abis/',
        runOnCompile: true,
        clear: true,
        spacing: 4,
        format: "minimal"
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY,
            mainnet: process.env.ETHERSCAN_API_KEY,
        }
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 1337,
            gas: "auto",
            gasPrice: "auto",
            saveDeployments: false,
            mining: {
                auto: false,
                order: 'fifo',
                interval: 1500,
            }
        },
        sepolia: {
            url: `https://rpc.sepolia.org/`,
            accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY}`],
            gasPrice: 50000000000, // 50 gwei
        },
        mainnet: {
            url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
            accounts: [`0x${process.env.ETHEREUM_PRIVATE_KEY}`],
            gasPrice: 50000000000, // 50 gwei
        },
    }
};