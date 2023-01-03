// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

contract CrowdFunding {
    uint256 public constant MINIMUM_CONTRIBUTION = 0.01 ether;
    address public immutable owner;
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
        mapping(address => bool) approvers;
    }
    Request[] private spendingRequests;

    // Errors
    error DeadlinePassed();
    error DeadlineNotPassed();
    error NotContributor();

    // Events
    event Contribute(address indexed contributor, uint256 value);
    event CreateSpendingRequest(
        address indexed recipient,
        string description,
        uint256 value
    );
    event Refund(address indexed contributor, uint256 value);
    event Approve(uint256 reqestId, address approver);
    event Spend(
        uint256 indexed reqestId,
        address indexed recipient,
        uint256 value
    );

    // Modifiers
    modifier notPassedDeadline() {
        if (block.timestamp > deadline) revert DeadlinePassed();
        _;
    }

    modifier deadlinePassed() {
        if (block.timestamp < deadline) revert DeadlineNotPassed();
        _;
    }

    modifier onlyContributor() {
        if (contributors[msg.sender] == 0) revert NotContributor();
        _;
    }

    constructor(uint32 _deadline, uint256 _goal) {
        owner = msg.sender;
        deadline = _deadline;
        goal = _goal;
    }

    function contribute() external payable notPassedDeadline {
        require(
            msg.value >= MINIMUM_CONTRIBUTION,
            "You need to spend more ETH to contribute."
        );

        contributors[msg.sender] += msg.value;
        numberOfContributors += 1;

        emit Contribute(msg.sender, msg.value);
    }

    function getContributeValue(address _address)
        external
        view
        returns (uint256)
    {
        return contributors[_address];
    }

    // TODO deadline?
    // TODO lock fund?
    function createSpendingRequest(
        address payable _recipient,
        string calldata _description,
        uint256 _value
    ) external {
        require(_recipient != address(0), "recipient cannot be address 0");
        require(deadline <= block.timestamp, "the deadline has not reach yet");
        require(goal <= address(this).balance, "the goal has not reach");
        require(
            _value <= address(this).balance,
            "spending request amount is more than campaign balance"
        );

        Request storage newRequest = spendingRequests.push();
        newRequest.recipient = _recipient;
        newRequest.description = _description;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.numberOfApproved = 0;

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
        Request storage request = spendingRequests[_index];
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

    function refund() external payable deadlinePassed onlyContributor {
        require(goal > address(this).balance, "the goal has reached");

        uint256 contributionValue = contributors[msg.sender];
        contributors[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: contributionValue}("");
        require(sent, "fail to refund");

        emit Refund(msg.sender, contributionValue);
    }

    function approve(uint256 _id) external onlyContributor {
        require(spendingRequests.length > _id, "no spending request");

        Request storage request = spendingRequests[_id];
        require(
            !request.approvers[msg.sender],
            "You have already approved the request"
        );

        request.approvers[msg.sender] = true;
        request.numberOfApproved += 1;

        emit Approve(_id, msg.sender);
    }

    function isApproved(uint256 _requestId, address _contributor)
        external
        view
        returns (bool)
    {
        return spendingRequests[_requestId].approvers[_contributor];
    }

    function executeRequest(uint256 _requestId) external {
        require(
            spendingRequests.length > _requestId,
            "the request does not exist"
        );
        require(
            !spendingRequests[_requestId].completed,
            "the request has already completed"
        );
        require(owner == msg.sender, "Only owner");

        uint256 approvalPercent = (spendingRequests[_requestId]
            .numberOfApproved * 100) / numberOfContributors;

        require(approvalPercent >= 50, "disappoved");

        spendingRequests[_requestId].completed = true;
        (bool sent, ) = spendingRequests[_requestId].recipient.call{
            value: spendingRequests[_requestId].value
        }("");
        require(sent, "Faild to sent eth");
        emit Spend(
            _requestId,
            spendingRequests[_requestId].recipient,
            spendingRequests[_requestId].value
        );
    }
}
