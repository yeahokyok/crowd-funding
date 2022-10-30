// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.14;

error CrowdFunding__DeadlinePassed();

contract CrowdFunding {
    uint256 public constant MINIMUM_CONTRIBUTION = 0.01 ether;
    address public immutable i_owner;
    uint256 public goal;
    uint32 public deadline;

    mapping(address => uint256) contributors;

    // Spending request
    struct Request {
        address payable recipient;
        string description;
        uint256 value;
        bool completed;
        uint256 numberOfApproved;
    }
    Request[] public spendingRequests;

    // contributor approved spending request
    // spendingRequests index => contributor => bool
    mapping(uint256 => mapping(address => bool)) private isApproved;

    // Modifiers
    modifier notPassedDeadline() {
        if (block.timestamp > deadline) revert CrowdFunding__DeadlinePassed();
        _;
    }

    constructor(uint32 _deadline) {
        i_owner = msg.sender;
        deadline = _deadline;
    }

    function contribute() external payable notPassedDeadline {
        if (msg.value < MINIMUM_CONTRIBUTION)
            revert("You need to spend more ETH to contribute.");
    }
}
