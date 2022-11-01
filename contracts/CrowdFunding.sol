// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.14;

import "hardhat/console.sol";

error CrowdFunding__DeadlinePassed();

contract CrowdFunding {
    uint256 public constant MINIMUM_CONTRIBUTION = 0.01 ether;
    address public immutable i_owner;
    uint256 public goal;
    uint32 public deadline;
    uint256 public numberOfContributors;

    mapping(address => uint256) public contributors;

    // Spending request
    struct Request {
        address payable recipient;
        string description;
        uint256 value;
        bool completed;
        uint256 numberOfApproved;
    }
    Request[] private spendingRequests;

    // contributor approved spending request
    // spendingRequests index => contributor => bool
    mapping(uint256 => mapping(address => bool)) private isApproved;

    // Errors
    error DeadlinePassed();
    error DeadlineNotPassed();

    // Events
    event Contribute(address indexed contributor, uint256 value);
    event CreateSpendingRequest(
        address indexed recipient,
        string description,
        uint256 value
    );
    event Refund(address indexed contributor, uint256 value);

    // Modifiers
    modifier notPassedDeadline() {
        if (block.timestamp > deadline) revert DeadlinePassed();
        _;
    }

    modifier deadlinePassed() {
        if (block.timestamp < deadline) revert DeadlineNotPassed();
        _;
    }

    constructor(uint32 _deadline, uint256 _goal) {
        i_owner = msg.sender;
        deadline = _deadline;
        goal = _goal;
    }

    function contribute() external payable notPassedDeadline {
        if (msg.value < MINIMUM_CONTRIBUTION)
            revert("You need to spend more ETH to contribute.");
        contributors[msg.sender] += msg.value;
        numberOfContributors += 1;

        emit Contribute(msg.sender, msg.value);
    }

    function createSpendingRequest(
        address payable _recipient,
        string calldata _description,
        uint256 _value
    ) external {
        if (_recipient == address(0)) revert("recipient cannot be address 0");
        if (deadline > block.timestamp)
            revert("the deadline has not reach yet");
        if (goal > address(this).balance) revert("the goal has not reach");
        if (_value > address(this).balance)
            revert("spending request amount is more than campaign balance");
        spendingRequests.push(
            Request({
                recipient: _recipient,
                description: _description,
                value: _value,
                completed: false,
                numberOfApproved: 0
            })
        );
        emit CreateSpendingRequest(_recipient, _description, _value);
    }

    function getSpendingRequest(uint256 _index)
        external
        view
        returns (
            address recipient,
            string memory description,
            uint256 value,
            bool completed,
            uint256 numberOfApproved
        )
    {
        Request memory request = spendingRequests[_index];
        return (
            request.recipient,
            request.description,
            request.value,
            request.completed,
            request.numberOfApproved
        );
    }

    function getSpendingRequestCount() external view returns (uint256 count) {
        return spendingRequests.length;
    }

    function refund() external payable deadlinePassed {
        if (goal <= address(this).balance) revert("the goal has reached");
        if (contributors[msg.sender] == 0) revert("no contribution");

        uint256 contributionValue = contributors[msg.sender];
        contributors[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: contributionValue}("");
        if (!sent) revert("fail to refund");

        emit Refund(msg.sender, contributionValue);
    }
}
