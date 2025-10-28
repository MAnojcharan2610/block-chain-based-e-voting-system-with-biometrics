// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EVoting {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        string aadhaarHash;
        uint256 age;
        uint256 votedCandidateId;
    }

    struct Candidate {
        string name;
        string description;
        uint256 voteCount;
        bool isActive;
    }

    address public admin;
    mapping(address => Voter) public voters;
    mapping(string => bool) public aadhaarRegistered;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;
    uint256 public voterCount;

    event VoterRegistered(address indexed voter, string aadhaarHash);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function registerVoter(string calldata aadhaarHash, uint256 age) external {
        // Remove the wallet registration check for prototype
        // require(!voters[msg.sender].isRegistered, "Voter already registered");
        require(!aadhaarRegistered[aadhaarHash], "Aadhaar already registered");
        require(age >= 18, "Must be 18 or older");

        voters[msg.sender] = Voter({
            isRegistered: true,
            hasVoted: false,
            aadhaarHash: aadhaarHash,
            age: age,
            votedCandidateId: 0
        });

        aadhaarRegistered[aadhaarHash] = true;
        voterCount++;

        emit VoterRegistered(msg.sender, aadhaarHash);
    }

    function addCandidate(string calldata name, string calldata description) 
        external 
        onlyAdmin 
    {
        require(bytes(name).length > 0, "Name cannot be empty");
        candidateCount++;
        candidates[candidateCount] = Candidate({
            name: name,
            description: description,
            voteCount: 0,
            isActive: true
        });

        emit CandidateAdded(candidateCount, name);
    }

    function vote(uint256 candidateId) external {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate");
        require(candidates[candidateId].isActive, "Candidate not active");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = candidateId;
        candidates[candidateId].voteCount++;

        emit VoteCast(msg.sender, candidateId);
    }

    // View functions
    function isRegistered(address account) external view returns (bool) {
        return voters[account].isRegistered;
    }

    function hasUserVoted(address account) external view returns (bool) {
        return voters[account].hasVoted;
    }

    function getCandidate(uint256 id) external view returns (
        string memory name,
        string memory description,
        uint256 voteCount,
        bool isActive
    ) {
        Candidate memory c = candidates[id];
        return (c.name, c.description, c.voteCount, c.isActive);
    }
}