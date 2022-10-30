module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("------------------------------------------")
    log("Deploying and waiting for confirmations...")

    const contract = await deploy("CrowdFunding", {
        from: deployer,
        args: [],
    })
}
