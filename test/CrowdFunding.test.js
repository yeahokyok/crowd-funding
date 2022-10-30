const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("CrowdFunding", () => {
    let crowdFunding
    let crowdFundingFactory
    let deadline
    let accounts
    let deployer
    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        crowdFundingFactory = await ethers.getContractFactory("CrowdFunding")
        deadline = 1667231582
    })

    it("deployment should assign the deadline", async () => {
        crowdFunding = await crowdFundingFactory.deploy(deadline)
        expect(await crowdFunding.deadline()).to.equal(deadline)
    })

    it("deployment should assign the owner", async () => {
        crowdFunding = await crowdFundingFactory.deploy(deadline)
        expect(await crowdFunding.i_owner()).to.equal(deployer.address)
    })

    describe("contribute", () => {
        let minimumContribution
        beforeEach(async () => {
            minimumContribution = ethers.utils.parseEther("0.01")
        })

        it("should fail if deadline passed", async () => {
            const passedDeadline = 1665417182 // 20 days ago
            crowdFunding = await crowdFundingFactory.deploy(passedDeadline)
            await expect(
                crowdFunding.contribute({ value: minimumContribution })
            ).to.be.revertedWithCustomError(
                crowdFunding,
                "CrowdFunding__DeadlinePassed"
            )
        })

        it("should fail if contribute less than 0.01 eth", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline)
            const lessMinimumContribution = ethers.utils.parseEther("0.001")
            await expect(
                crowdFunding.contribute({ value: lessMinimumContribution })
            ).to.be.revertedWith("You need to spend more ETH to contribute.")
        })
    })
})
