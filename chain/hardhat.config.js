require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()

/**
--- hardhat-toolbox ---
@nomiclabs/hardhat-ethers
@nomiclabs/hardhat-etherscan
hardhat-gas-reporter
solidity-coverage
@typechain/hardhat
*/

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
    },
    solidity: "0.8.14",
    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
}
