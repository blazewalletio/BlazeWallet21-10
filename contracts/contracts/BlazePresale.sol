// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Blaze Presale Contract
 * @dev Handles presale with automatic fund distribution
 * 
 * Presale Details:
 * - Target: $500,000
 * - Price: $0.00417 per BLAZE
 * - Tokens: 120M BLAZE
 * - Min contribution: $100 (in BNB)
 * - Max contribution: $10,000 per wallet
 * 
 * Fund Distribution:
 * - 60% → Liquidity (locked)
 * - 40% → Operational Budget (team, dev, marketing)
 */
contract BlazePresale is Ownable, ReentrancyGuard {
    
    // Presale Parameters
    uint256 public constant HARD_CAP = 500000 * 10**18; // $500k in wei equivalent
    uint256 public constant SOFT_CAP = 100000 * 10**18; // $100k minimum
    uint256 public constant MIN_CONTRIBUTION = 100 * 10**18; // $100
    uint256 public constant MAX_CONTRIBUTION = 10000 * 10**18; // $10,000
    uint256 public constant TOKENS_FOR_SALE = 120_000_000 * 10**18; // 120M BLAZE
    uint256 public constant TOKEN_PRICE = 417 * 10**13; // $0.00417 per token
    
    // Presale State
    bool public presaleActive;
    bool public presaleFinalized;
    uint256 public totalRaised;
    uint256 public totalTokensSold;
    uint256 public startTime;
    uint256 public endTime;
    
    // Wallets
    address public liquidityWallet;
    address public operationalWallet;
    address public tokenAddress;
    
    // Participant tracking
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public tokenAllocations;
    mapping(address => bool) public hasClaimed;
    address[] public participants;
    
    // Events
    event PresaleStarted(uint256 startTime, uint256 endTime);
    event ContributionReceived(address indexed contributor, uint256 amount, uint256 tokens);
    event TokensClaimed(address indexed participant, uint256 amount);
    event PresaleFinalized(uint256 totalRaised, uint256 liquidityAmount, uint256 operationalAmount);
    event RefundIssued(address indexed participant, uint256 amount);
    
    constructor(
        address _liquidityWallet,
        address _operationalWallet
    ) Ownable(msg.sender) {
        require(_liquidityWallet != address(0), "Invalid liquidity wallet");
        require(_operationalWallet != address(0), "Invalid operational wallet");
        
        liquidityWallet = _liquidityWallet;
        operationalWallet = _operationalWallet;
    }
    
    /**
     * @dev Set token address (can only be set once)
     */
    function setTokenAddress(address _tokenAddress) external onlyOwner {
        require(tokenAddress == address(0), "Token already set");
        require(_tokenAddress != address(0), "Invalid token address");
        tokenAddress = _tokenAddress;
    }
    
    /**
     * @dev Start the presale
     */
    function startPresale(uint256 durationInDays) external onlyOwner {
        require(!presaleActive, "Presale already active");
        require(tokenAddress != address(0), "Token not set");
        require(durationInDays > 0 && durationInDays <= 90, "Invalid duration");
        
        presaleActive = true;
        startTime = block.timestamp;
        endTime = block.timestamp + (durationInDays * 1 days);
        
        emit PresaleStarted(startTime, endTime);
    }
    
    /**
     * @dev Contribute to presale
     */
    function contribute() external payable nonReentrant {
        require(presaleActive, "Presale not active");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Presale not in progress");
        require(msg.value >= MIN_CONTRIBUTION, "Below minimum contribution");
        require(contributions[msg.sender] + msg.value <= MAX_CONTRIBUTION, "Exceeds maximum contribution");
        require(totalRaised + msg.value <= HARD_CAP, "Hard cap reached");
        
        // Calculate tokens
        uint256 tokens = (msg.value * 10**18) / TOKEN_PRICE;
        require(totalTokensSold + tokens <= TOKENS_FOR_SALE, "Not enough tokens available");
        
        // Track contribution
        if (contributions[msg.sender] == 0) {
            participants.push(msg.sender);
        }
        
        contributions[msg.sender] += msg.value;
        tokenAllocations[msg.sender] += tokens;
        totalRaised += msg.value;
        totalTokensSold += tokens;
        
        emit ContributionReceived(msg.sender, msg.value, tokens);
        
        // Auto-finalize if hard cap reached
        if (totalRaised >= HARD_CAP) {
            _finalize();
        }
    }
    
    /**
     * @dev Finalize presale (owner or auto when hardcap/time reached)
     */
    function finalizePresale() external onlyOwner {
        require(presaleActive, "Presale not active");
        require(block.timestamp > endTime || totalRaised >= HARD_CAP, "Cannot finalize yet");
        _finalize();
    }
    
    /**
     * @dev Internal finalize function
     */
    function _finalize() internal {
        require(!presaleFinalized, "Already finalized");
        require(totalRaised >= SOFT_CAP, "Soft cap not reached");
        
        presaleActive = false;
        presaleFinalized = true;
        
        // Distribute funds
        uint256 liquidityAmount = (totalRaised * 60) / 100;  // 60%
        uint256 operationalAmount = totalRaised - liquidityAmount; // 40%
        
        // Transfer funds
        (bool liquiditySuccess, ) = liquidityWallet.call{value: liquidityAmount}("");
        require(liquiditySuccess, "Liquidity transfer failed");
        
        (bool operationalSuccess, ) = operationalWallet.call{value: operationalAmount}("");
        require(operationalSuccess, "Operational transfer failed");
        
        emit PresaleFinalized(totalRaised, liquidityAmount, operationalAmount);
    }
    
    /**
     * @dev Claim tokens after presale is finalized
     */
    function claimTokens() external nonReentrant {
        require(presaleFinalized, "Presale not finalized");
        require(!hasClaimed[msg.sender], "Already claimed");
        require(tokenAllocations[msg.sender] > 0, "No tokens to claim");
        
        uint256 amount = tokenAllocations[msg.sender];
        hasClaimed[msg.sender] = true;
        
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        emit TokensClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Refund if soft cap not reached
     */
    function claimRefund() external nonReentrant {
        require(!presaleActive, "Presale still active");
        require(block.timestamp > endTime, "Presale not ended");
        require(totalRaised < SOFT_CAP, "Soft cap reached, no refunds");
        require(contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(msg.sender, amount);
    }
    
    /**
     * @dev Emergency end presale (owner only)
     */
    function emergencyEndPresale() external onlyOwner {
        require(presaleActive, "Presale not active");
        presaleActive = false;
    }
    
    /**
     * @dev Get presale info
     */
    function getPresaleInfo() external view returns (
        bool active,
        bool finalized,
        uint256 raised,
        uint256 tokensSold,
        uint256 participantCount,
        uint256 timeRemaining
    ) {
        active = presaleActive;
        finalized = presaleFinalized;
        raised = totalRaised;
        tokensSold = totalTokensSold;
        participantCount = participants.length;
        
        if (block.timestamp >= endTime) {
            timeRemaining = 0;
        } else {
            timeRemaining = endTime - block.timestamp;
        }
    }
    
    /**
     * @dev Get user info
     */
    function getUserInfo(address user) external view returns (
        uint256 contribution,
        uint256 tokenAllocation,
        bool claimed
    ) {
        contribution = contributions[user];
        tokenAllocation = tokenAllocations[user];
        claimed = hasClaimed[user];
    }
    
    /**
     * @dev Get all participants
     */
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    /**
     * @dev Withdraw remaining tokens after presale (if any)
     */
    function withdrawRemainingTokens() external onlyOwner {
        require(presaleFinalized, "Presale not finalized");
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        uint256 allocated = 0;
        
        // Calculate total allocated tokens
        for (uint256 i = 0; i < participants.length; i++) {
            if (!hasClaimed[participants[i]]) {
                allocated += tokenAllocations[participants[i]];
            }
        }
        
        uint256 withdrawable = balance - allocated;
        require(withdrawable > 0, "No tokens to withdraw");
        require(token.transfer(owner(), withdrawable), "Withdrawal failed");
    }
    
    // Receive function to accept BNB
    receive() external payable {
        revert("Use contribute() function");
    }
}

