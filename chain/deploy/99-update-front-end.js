const { ethers, network } = require("hardhat")
const fs = require("fs")

const frontEndContractsFile = "../frontend/src/constants/contractAddresses.json"
const frontEndAbiFile = "../frontend/src/constants/abi.json"

module.exports = async () => {
    console.log("----------------------------------")
    console.log("Writing to frontend")
    await updateAbi()
    await updateContractAddresses()
    console.log("Frontend written")
}

const updateAbi = async () => {
    const crowdfunding = await ethers.getContract("CrowdFunding")
    fs.writeFileSync(
        frontEndAbiFile,
        crowdfunding.interface.format(ethers.utils.FormatTypes.json)
    )
}

const updateContractAddresses = async () => {
    const chainId = network.config.chainId.toString()
    const crowdfunding = await ethers.getContract("CrowdFunding")
    if (!fs.existsSync(frontEndContractsFile)) {
        fs.writeFileSync(frontEndContractsFile, JSON.stringify({}))
    }
    const contractAddresses = JSON.parse(
        fs.readFileSync(frontEndContractsFile, "utf8")
    )

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId].includes(crowdfunding.address)) {
            contractAddresses[chainId].push(crowdfunding.address)
        }
    } else {
        console.log("here")
        contractAddresses[chainId] = crowdfunding.address
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
