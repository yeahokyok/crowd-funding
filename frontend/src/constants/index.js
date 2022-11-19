const contractAddresses = require('./contractAddresses.json')
const abi = require('./abi.json')

const crowdFundingContract = {
    address: contractAddresses[process.env.REACT_APP_CHAIN_ID],
    abi: abi,
}

module.exports = {
    crowdFundingContract,
}
