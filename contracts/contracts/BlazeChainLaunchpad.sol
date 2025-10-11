// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BlazeChain Launchpad
 * @dev Platform for launching new tokens via presales
 * 
 * Features:
 * - Multi-project support
 * - Early access for BLAZE stakers
 * - Platform fees (2% of raised amount)
 * - Soft cap / Hard cap support
 * - Refunds if soft cap not reached
 */
contract BlazeChainLaunchpad is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public blazeToken;
    
    enum ProjectState {
        Pending,
        Active,
        Failed,
        Successful,
        Finalized,
        Cancelled
    }
    
    struct LaunchProject {
        uint256 id;
        address creator;
        address tokenAddress;
        string name;
        string description;
        string logoUrl;
        uint256 tokenPrice;        // Price in wei (BNB)
        uint256 tokensForSale;
        uint256 softCap;           // Minimum to raise (wei)
        uint256 hardCap;           // Maximum to raise (wei)
        uint256 minContribution;
        uint256 maxContribution;
        uint256 raised;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
        bool cancelled;
    }
    
    struct Contribution {
        uint256 amount;
        bool claimed;
        bool refunded;
    }
    
    // Constants
    uint256 public constant PLATFORM_FEE = 200; // 2% in basis points (200/10000)
    uint256 public constant EARLY_ACCESS_THRESHOLD = 5000 * 10**18; // 5k BLAZE for early access
    uint256 public constant EARLY_ACCESS_DURATION = 1 hours; // 1 hour early access
    
    // Storage
    uint256 public projectCount;
    mapping(uint256 => LaunchProject) public projects;
    mapping(uint256 => mapping(address => Contribution)) public contributions;
    mapping(uint256 => address[]) public projectContributors;
    
    address public treasuryWallet;
    
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        address tokenAddress,
        string name,
        uint256 startTime,
        uint256 endTime
    );
    
    event ContributionMade(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );
    
    event TokensClaimed(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );
    
    event RefundClaimed(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );
    
    event ProjectFinalized(
        uint256 indexed projectId,
        uint256 totalRaised,
        uint256 platformFee
    );
    
    event ProjectCancelled(uint256 indexed projectId);
    
    constructor(address _blazeToken, address _treasuryWallet) Ownable(msg.sender) {
        require(_blazeToken != address(0), "Invalid BLAZE token");
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        
        blazeToken = IERC20(_blazeToken);
        treasuryWallet = _treasuryWallet;
    }
    
    /**
     * @dev Create a new launch project
     */
    function createProject(
        address _tokenAddress,
        string memory _name,
        string memory _description,
        string memory _logoUrl,
        uint256 _tokenPrice,
        uint256 _tokensForSale,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _startTime,
        uint256 _duration
    ) external nonReentrant returns (uint256) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(bytes(_name).length > 0, "Name required");
        require(_tokensForSale > 0, "Tokens for sale required");
        require(_softCap > 0 && _hardCap > _softCap, "Invalid caps");
        require(_minContribution > 0, "Min contribution required");
        require(_maxContribution >= _minContribution, "Invalid max contribution");
        require(_startTime >= block.timestamp, "Invalid start time");
        require(_duration >= 1 days, "Duration too short");
        
        // Transfer tokens to contract
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _tokensForSale);
        
        projectCount++;
        uint256 projectId = projectCount;
        
        LaunchProject storage project = projects[projectId];
        project.id = projectId;
        project.creator = msg.sender;
        project.tokenAddress = _tokenAddress;
        project.name = _name;
        project.description = _description;
        project.logoUrl = _logoUrl;
        project.tokenPrice = _tokenPrice;
        project.tokensForSale = _tokensForSale;
        project.softCap = _softCap;
        project.hardCap = _hardCap;
        project.minContribution = _minContribution;
        project.maxContribution = _maxContribution;
        project.raised = 0;
        project.startTime = _startTime;
        project.endTime = _startTime + _duration;
        project.finalized = false;
        project.cancelled = false;
        
        emit ProjectCreated(
            projectId,
            msg.sender,
            _tokenAddress,
            _name,
            project.startTime,
            project.endTime
        );
        
        return projectId;
    }
    
    /**
     * @dev Contribute to a project
     */
    function contribute(uint256 _projectId) external payable nonReentrant {
        LaunchProject storage project = projects[_projectId];
        
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project");
        require(!project.cancelled, "Project cancelled");
        require(block.timestamp >= project.startTime, "Not started");
        require(block.timestamp <= project.endTime, "Already ended");
        require(msg.value >= project.minContribution, "Below minimum");
        require(msg.value <= project.maxContribution, "Above maximum");
        
        // Check early access
        if (block.timestamp < project.startTime + EARLY_ACCESS_DURATION) {
            require(
                blazeToken.balanceOf(msg.sender) >= EARLY_ACCESS_THRESHOLD,
                "Early access requires 5k BLAZE"
            );
        }
        
        uint256 currentContribution = contributions[_projectId][msg.sender].amount;
        require(
            currentContribution + msg.value <= project.maxContribution,
            "Exceeds max contribution"
        );
        
        require(
            project.raised + msg.value <= project.hardCap,
            "Exceeds hard cap"
        );
        
        // First time contributor
        if (currentContribution == 0) {
            projectContributors[_projectId].push(msg.sender);
        }
        
        contributions[_projectId][msg.sender].amount += msg.value;
        project.raised += msg.value;
        
        emit ContributionMade(_projectId, msg.sender, msg.value);
    }
    
    /**
     * @dev Finalize project (after end time)
     */
    function finalizeProject(uint256 _projectId) external nonReentrant {
        LaunchProject storage project = projects[_projectId];
        
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project");
        require(block.timestamp > project.endTime, "Not ended yet");
        require(!project.finalized, "Already finalized");
        require(!project.cancelled, "Project cancelled");
        
        project.finalized = true;
        
        if (project.raised >= project.softCap) {
            // Success - calculate platform fee
            uint256 platformFee = (project.raised * PLATFORM_FEE) / 10000;
            uint256 creatorAmount = project.raised - platformFee;
            
            // Transfer BNB to creator and treasury
            payable(project.creator).transfer(creatorAmount);
            payable(treasuryWallet).transfer(platformFee);
            
            emit ProjectFinalized(_projectId, project.raised, platformFee);
        }
        // If failed (< soft cap), users can claim refunds
    }
    
    /**
     * @dev Claim tokens after successful sale
     */
    function claimTokens(uint256 _projectId) external nonReentrant {
        LaunchProject storage project = projects[_projectId];
        Contribution storage contribution = contributions[_projectId][msg.sender];
        
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project");
        require(project.finalized, "Not finalized");
        require(project.raised >= project.softCap, "Sale failed");
        require(contribution.amount > 0, "No contribution");
        require(!contribution.claimed, "Already claimed");
        
        contribution.claimed = true;
        
        // Calculate tokens to receive
        uint256 tokensToReceive = (contribution.amount * 10**18) / project.tokenPrice;
        
        IERC20(project.tokenAddress).safeTransfer(msg.sender, tokensToReceive);
        
        emit TokensClaimed(_projectId, msg.sender, tokensToReceive);
    }
    
    /**
     * @dev Claim refund if project failed
     */
    function claimRefund(uint256 _projectId) external nonReentrant {
        LaunchProject storage project = projects[_projectId];
        Contribution storage contribution = contributions[_projectId][msg.sender];
        
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project");
        require(
            (project.finalized && project.raised < project.softCap) || project.cancelled,
            "Cannot refund"
        );
        require(contribution.amount > 0, "No contribution");
        require(!contribution.refunded, "Already refunded");
        
        contribution.refunded = true;
        
        payable(msg.sender).transfer(contribution.amount);
        
        emit RefundClaimed(_projectId, msg.sender, contribution.amount);
    }
    
    /**
     * @dev Cancel project (only creator or owner)
     */
    function cancelProject(uint256 _projectId) external {
        LaunchProject storage project = projects[_projectId];
        
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project");
        require(
            msg.sender == project.creator || msg.sender == owner(),
            "Not authorized"
        );
        require(!project.finalized, "Already finalized");
        require(!project.cancelled, "Already cancelled");
        
        project.cancelled = true;
        
        // Return tokens to creator
        if (project.tokensForSale > 0) {
            IERC20(project.tokenAddress).safeTransfer(
                project.creator,
                project.tokensForSale
            );
        }
        
        emit ProjectCancelled(_projectId);
    }
    
    /**
     * @dev Get project state
     */
    function getProjectState(uint256 _projectId) public view returns (ProjectState) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project");
        
        LaunchProject storage project = projects[_projectId];
        
        if (project.cancelled) {
            return ProjectState.Cancelled;
        }
        
        if (project.finalized) {
            return project.raised >= project.softCap ? ProjectState.Successful : ProjectState.Failed;
        }
        
        if (block.timestamp < project.startTime) {
            return ProjectState.Pending;
        }
        
        if (block.timestamp <= project.endTime) {
            return ProjectState.Active;
        }
        
        // Ended but not finalized
        return project.raised >= project.softCap ? ProjectState.Successful : ProjectState.Failed;
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 _projectId) external view returns (
        uint256 id,
        address creator,
        address tokenAddress,
        string memory name,
        string memory description,
        uint256 raised,
        uint256 softCap,
        uint256 hardCap,
        uint256 startTime,
        uint256 endTime,
        ProjectState state
    ) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project");
        
        LaunchProject storage project = projects[_projectId];
        
        return (
            project.id,
            project.creator,
            project.tokenAddress,
            project.name,
            project.description,
            project.raised,
            project.softCap,
            project.hardCap,
            project.startTime,
            project.endTime,
            getProjectState(_projectId)
        );
    }
    
    /**
     * @dev Get user contribution
     */
    function getUserContribution(uint256 _projectId, address _user) 
        external 
        view 
        returns (uint256 amount, bool claimed, bool refunded) 
    {
        Contribution storage contribution = contributions[_projectId][_user];
        return (contribution.amount, contribution.claimed, contribution.refunded);
    }
    
    /**
     * @dev Get all contributors for a project
     */
    function getProjectContributors(uint256 _projectId) external view returns (address[] memory) {
        return projectContributors[_projectId];
    }
    
    /**
     * @dev Update treasury wallet
     */
    function setTreasuryWallet(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        treasuryWallet = _newTreasury;
    }
}

