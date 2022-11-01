const { ethers, network } = require("hardhat")
const { expect } = require("chai")

describe("CrowdFunding", () => {
    let crowdFunding
    let crowdFundingFactory
    let deadline
    let passedDeadline
    let accounts
    let deployer
    let recipient
    let contributor1
    let contributor2
    let contributor3
    let contributor4
    let goal

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        recipient = accounts[1]
        contributor1 = accounts[2]
        contributor2 = accounts[3]
        contributor3 = accounts[4]
        contributor4 = accounts[5]

        crowdFundingFactory = await ethers.getContractFactory("CrowdFunding")
        deadline = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60 // + 14 days
        passedDeadline = 1665417182 // 20 days ago
        goal = ethers.utils.parseEther("0.1")
    })

    describe("constructor", () => {
        it("deployment should assign goal", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
        })

        it("deployment should assign the deadline", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            expect(await crowdFunding.deadline()).to.equal(deadline)
        })

        it("deployment should assign the owner", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            expect(await crowdFunding.i_owner()).to.equal(deployer.address)
        })
    })

    describe("contribute", () => {
        let minimumContribution
        beforeEach(async () => {
            minimumContribution = ethers.utils.parseEther("0.01")
        })

        it("should fail if deadline passed", async () => {
            crowdFunding = await crowdFundingFactory.deploy(
                passedDeadline,
                goal
            )
            await expect(
                crowdFunding.contribute({ value: minimumContribution })
            ).to.be.revertedWithCustomError(crowdFunding, "DeadlinePassed")
        })

        it("should fail if contribute less than 0.01 eth", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            const lessMinimumContribution = ethers.utils.parseEther("0.001")
            await expect(
                crowdFunding.contribute({ value: lessMinimumContribution })
            ).to.be.revertedWith("You need to spend more ETH to contribute.")
        })

        xit("should update contributors", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            await crowdFunding.contribute({ value: minimumContribution })
            expect(await crowdFunding.contributors(deployer.address)).to.equal(
                []
            )
        })

        it("should update numberOfContributors", async () => {
            expect(await crowdFunding.numberOfContributors()).to.equal(0)
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            await crowdFunding.contribute({
                value: minimumContribution,
            })
            expect(await crowdFunding.numberOfContributors()).to.equal(1)
        })

        it("should emit Contribute event", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            await expect(
                crowdFunding.contribute({
                    value: minimumContribution,
                })
            ).to.emit(crowdFunding, "Contribute")
        })
    })

    describe("createSpendingRequest", () => {
        let minimumContribution
        beforeEach(async () => {
            minimumContribution = ethers.utils.parseEther("0.01")
        })
        it("should fail if the deadline has not reach yet", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            await expect(
                crowdFunding.createSpendingRequest(
                    recipient.address,
                    "test",
                    ethers.utils.parseEther("0.001")
                )
            ).to.be.revertedWith("the deadline has not reach yet")
        })
        it("should fail if the campaign has not reach goal", async () => {
            bigGoal = ethers.utils.parseEther("10")
            crowdFunding = await crowdFundingFactory.deploy(deadline, bigGoal)

            await crowdFunding.contribute({
                value: ethers.utils.parseEther("0.1"),
            })

            // time travel
            await network.provider.send("evm_increaseTime", [86400 * 15])
            await network.provider.send("evm_mine")

            await expect(
                crowdFunding.createSpendingRequest(
                    recipient.address,
                    "test",
                    ethers.utils.parseEther("0.001")
                )
            ).to.be.revertedWith("the goal has not reach")
        })
        it("should fail if the recipient is address 0", async () => {
            console.log("deadline ", deadline)
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            await crowdFunding.contribute({
                value: goal,
            })

            // time travel
            await network.provider.send("evm_increaseTime", [86400 * 15])
            await network.provider.send("evm_mine", [])

            await expect(
                crowdFunding.createSpendingRequest(
                    ethers.constants.AddressZero,
                    "test",
                    ethers.utils.parseEther("0.001")
                )
            ).to.be.revertedWith("recipient cannot be address 0")
        })
        it("should fail if spending request amount is more than campaign balance", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)

            await crowdFunding.contribute({
                value: goal,
            })

            // time travel
            await network.provider.send("evm_increaseTime", [86400 * 15])
            await network.provider.send("evm_mine", [])

            await expect(
                crowdFunding.createSpendingRequest(
                    recipient.address,
                    "test",
                    ethers.utils.parseEther("1")
                )
            ).to.be.revertedWith(
                "spending request amount is more than campaign balance"
            )
        })

        it("should add new request to spending request list", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)

            await crowdFunding.contribute({
                value: goal,
            })

            // time travel
            await network.provider.send("evm_increaseTime", [86400 * 15])
            await network.provider.send("evm_mine", [])

            const beforeRequestCount =
                await crowdFunding.getSpendingRequestCount()
            expect(beforeRequestCount).to.equal(0)

            crowdFunding.createSpendingRequest(
                recipient.address,
                "should add new request to spending request list",
                ethers.utils.parseEther("0.01")
            )

            const actualRequestCount =
                await crowdFunding.getSpendingRequestCount()
            const actualRequest = await crowdFunding.getSpendingRequest(0)
            expect(actualRequestCount).to.equal(1)
            expect(actualRequest.recipient).to.equal(recipient.address)
            expect(actualRequest.description).to.equal(
                "should add new request to spending request list"
            )
            expect(actualRequest.value).to.equal(
                ethers.utils.parseEther("0.01")
            )
        })

        it("should emit CreateSpendingRequest event", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)

            await crowdFunding.contribute({
                value: goal,
            })

            // time travel
            await network.provider.send("evm_increaseTime", [86400 * 15])
            await network.provider.send("evm_mine", [])

            const beforeRequestCount =
                await crowdFunding.getSpendingRequestCount()
            expect(beforeRequestCount).to.equal(0)

            await expect(
                crowdFunding.createSpendingRequest(
                    recipient.address,
                    "should add new request to spending request list'",
                    ethers.utils.parseEther("0.01")
                )
            ).to.emit(crowdFunding, "CreateSpendingRequest")
        })

        afterEach(async () => {
            // reset time travel
            const blockNumber = ethers.provider.getBlockNumber()
            const block = await ethers.provider.getBlock(blockNumber)
            const currentTimestamp = Math.floor(new Date().getTime() / 1000)
            const secondsDiff = currentTimestamp - block.timestamp
            await ethers.provider.send("evm_increaseTime", [secondsDiff])
            await ethers.provider.send("evm_mine", [])
        })
    })

    describe("refund", () => {
        it("should fail if the deadline has not reached yet", async () => {
            bigGoal = ethers.utils.parseEther("10")
            crowdFunding = await crowdFundingFactory.deploy(deadline, bigGoal)
            crowdFundingContributor1 = crowdFunding.connect(contributor1)

            await crowdFundingContributor1.contribute({
                value: ethers.utils.parseEther("0.01"),
            })

            await expect(
                crowdFundingContributor1.refund()
            ).to.be.revertedWithCustomError(crowdFunding, "DeadlineNotPassed")
        })
        it("should fail if the goal has reached", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            crowdFundingContributor1 = crowdFunding.connect(contributor1)
            crowdFundingContributor2 = crowdFunding.connect(contributor2)

            await crowdFundingContributor1.contribute({
                value: goal,
            })

            await crowdFundingContributor2.contribute({
                value: goal,
            })

            // time travel
            await network.provider.send("evm_increaseTime", [86400 * 15])
            await network.provider.send("evm_mine", [])

            await expect(crowdFundingContributor1.refund()).to.be.revertedWith(
                "the goal has reached"
            )
        })
        it("the sender must be a contributor", async () => {
            crowdFunding = await crowdFundingFactory.deploy(deadline, goal)
            crowdFundingContributor1 = crowdFunding.connect(contributor1)
            crowdFundingContributor2 = crowdFunding.connect(contributor2)

            await crowdFundingContributor1.contribute({
                value: ethers.utils.parseEther("0.01"),
            })

            // time travel
            await network.provider.send("evm_increaseTime", [86400 * 15])
            await network.provider.send("evm_mine", [])

            await expect(crowdFundingContributor2.refund()).to.be.revertedWith(
                "no contribution"
            )
        })
        xit("the contributor able to call refund only one time", async () => {})
        xit("should update contributors", async () => {})
        xit("should transfer eth to the contributor", async () => {})
        xit("should emit Refund event", async () => {})

        afterEach(async () => {
            // reset time travel
            const blockNumber = ethers.provider.getBlockNumber()
            const block = await ethers.provider.getBlock(blockNumber)
            const currentTimestamp = Math.floor(new Date().getTime() / 1000)
            const secondsDiff = currentTimestamp - block.timestamp
            await ethers.provider.send("evm_increaseTime", [secondsDiff])
            await ethers.provider.send("evm_mine", [])
        })
    })
})
