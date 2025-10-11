// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Blaze Governance
 * @dev Decentralized governance for Blaze ecosystem
 * 
 * Features:
 * - Create proposals (requires 10k BLAZE)
 * - Vote on proposals (1 token = 1 vote)
 * - Execute approved proposals
 * - 7-day voting period
 * - 51% quorum required
 */
contract BlazeGovernance is Ownable, ReentrancyGuard {
    
    IERC20 public blazeToken;
    
    enum ProposalState {
        Pending,
        Active,
        Defeated,
        Succeeded,
        Executed,
        Cancelled
    }
    
    enum ProposalType {
        TextProposal,      // General discussion
        TreasurySpending,  // Spend from treasury
        ParameterChange,   // Change protocol parameters
        Partnership        // New partnership/integration
    }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes;
    }
    
    // Governance parameters
    uint256 public constant PROPOSAL_THRESHOLD = 10_000 * 10**18; // 10k BLAZE to create proposal
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM_PERCENTAGE = 51; // 51% majority needed
    uint256 public constant EXECUTION_DELAY = 2 days; // After success, wait 2 days before execution
    
    // Storage
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) public userProposals;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    
    constructor(address _blazeToken) Ownable(msg.sender) {
        require(_blazeToken != address(0), "Invalid token address");
        blazeToken = IERC20(_blazeToken);
    }
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _proposalType
    ) external nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(
            blazeToken.balanceOf(msg.sender) >= PROPOSAL_THRESHOLD,
            "Insufficient BLAZE balance"
        );
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.proposalType = _proposalType;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_PERIOD;
        newProposal.executed = false;
        newProposal.cancelled = false;
        
        userProposals[msg.sender].push(proposalId);
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            _title,
            _proposalType,
            newProposal.startTime,
            newProposal.endTime
        );
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 _proposalId, bool _support) external nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        uint256 votes = blazeToken.balanceOf(msg.sender);
        require(votes > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = votes;
        
        if (_support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, votes);
    }
    
    /**
     * @dev Execute a successful proposal
     */
    function executeProposal(uint256 _proposalId) external nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        ProposalState state = getProposalState(_proposalId);
        require(state == ProposalState.Succeeded, "Proposal not successful");
        
        // Additional execution delay for security
        require(
            block.timestamp >= proposal.endTime + EXECUTION_DELAY,
            "Execution delay not passed"
        );
        
        proposal.executed = true;
        
        emit ProposalExecuted(_proposalId);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or owner)
     */
    function cancelProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Already cancelled");
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(_proposalId);
    }
    
    /**
     * @dev Get proposal state
     */
    function getProposalState(uint256 _proposalId) public view returns (ProposalState) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.cancelled) {
            return ProposalState.Cancelled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }
        
        // Voting ended, check results
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        
        if (totalVotes == 0) {
            return ProposalState.Defeated;
        }
        
        uint256 forPercentage = (proposal.forVotes * 100) / totalVotes;
        
        if (forPercentage >= QUORUM_PERCENTAGE) {
            return ProposalState.Succeeded;
        } else {
            return ProposalState.Defeated;
        }
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        ProposalType proposalType,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        bool cancelled,
        ProposalState state
    ) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[_proposalId];
        
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.proposalType,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.cancelled,
            getProposalState(_proposalId)
        );
    }
    
    /**
     * @dev Check if user has voted
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
    
    /**
     * @dev Get user's vote on proposal
     */
    function getUserVote(uint256 _proposalId, address _voter) external view returns (uint256) {
        return proposals[_proposalId].votes[_voter];
    }
    
    /**
     * @dev Get all proposals by a user
     */
    function getUserProposals(address _user) external view returns (uint256[] memory) {
        return userProposals[_user];
    }
    
    /**
     * @dev Get voting power of an address
     */
    function getVotingPower(address _voter) external view returns (uint256) {
        return blazeToken.balanceOf(_voter);
    }
}

