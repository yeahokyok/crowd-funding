module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("------------------------------------------")
    log("Deploying and waiting for confirmations...")

    const deadline = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60 // + 14 days
    const goal = ethers.utils.parseEther("0.1")

    const contract = await deploy("CrowdFunding", {
        from: deployer,
        args: [deadline, goal],
        log: true,
        waitConfirmations: 1,
    })
    log(`Crowd Funding deployed at ${contract.address}`)
}
module.exports.tags = ["all", "crowdFunding"]
