require("@nomicfoundation/hardhat-toolbox")
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
    solidity: "0.8.14",
    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false,
    },
}
