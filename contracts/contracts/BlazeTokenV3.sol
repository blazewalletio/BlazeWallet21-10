// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Blaze Token V3
 * @dev Ultimate utility token with staking, governance, referrals, cashback, and more!
 * 
 * NEW FEATURES:
 * - Cashback system (earn BLAZE on transactions)
 * - Premium membership (10k BLAZE = lifetime benefits)
 * - Governance/DAO voting
 * - Referral rewards
 * - Automatic burns on every action
 * - Launchpad whitelist
 */
contract BlazeTokenV3 is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    // Distribution addresses
    address public publicSaleWallet;
    address public founderWallet;
    address public communityWallet;
    address public treasuryWallet;
    address public teamWallet;
    address public strategicWallet;
    address public liquidityWallet;
    
    // Token amounts (1 billion total)
    uint256 private constant PUBLIC_SALE = 150_000_000 * 10**18;
    uint256 private constant LIQUIDITY = 100_000_000 * 10**18;
    uint256 private constant FOUNDER_UNLOCKED = 100_000_000 * 10**18;
    uint256 private constant COMMUNITY = 200_000_000 * 10**18;
    uint256 private constant TREASURY = 150_000_000 * 10**18;
    uint256 private constant TEAM = 100_000_000 * 10**18;
    uint256 private constant STRATEGIC = 50_000_000 * 10**18;
    
    // ============ STAKING ============
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod;
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    
    uint256 public constant FLEXIBLE_APY = 800;   // 8%
    uint256 public constant SIX_MONTH_APY = 1500; // 15%
    uint256 public constant ONE_YEAR_APY = 2500;  // 25%
    
    // ============ PREMIUM MEMBERSHIP ============
    
    uint256 public constant PREMIUM_THRESHOLD = 10_000 * 10**18; // 10k BLAZE
    mapping(address => bool) public isPremium;
    mapping(address => uint256) public premiumSince;
    
    // ============ GOVERNANCE ============
    
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant MIN_VOTE_TOKENS = 1000 * 10**18; // Need 1000 BLAZE to vote
    
    // ============ REFERRAL SYSTEM ============
    
    mapping(address => address) public referredBy;
    mapping(address => uint256) public referralCount;
    mapping(address => uint256) public referralEarnings;
    
    uint256 public constant REFERRAL_REWARD = 50 * 10**18; // 50 BLAZE per referral
    uint256 public constant REFERRAL_FEE_SHARE = 1000; // 10% of fees go to referrer
    
    // ============ CASHBACK SYSTEM ============
    
    mapping(address => uint256) public totalCashbackEarned;
    uint256 public constant CASHBACK_RATE = 200; // 2% cashback
    uint256 public totalCashbackDistributed;
    
    // ============ BURNING ============
    
    uint256 public totalBurned;
    uint256 public constant BURN_RATE = 10; // 0.10% on transfers
    uint256 public constant SWAP_BURN_RATE = 50; // 0.50% on swaps
    
    // ============ LAUNCHPAD ============
    
    mapping(address => bool) public isWhitelistedForLaunchpad;
    uint256 public constant LAUNCHPAD_THRESHOLD = 5_000 * 10**18; // 5k BLAZE
    
    // ============ FEE SYSTEM ============
    
    uint256 public swapFeeRate = 50; // 0.5% default
    mapping(address => uint256) public feeDiscounts; // Premium gets 100% discount
    
    // ============ EVENTS ============
    
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    event PremiumActivated(address indexed user);
    event PremiumRevoked(address indexed user);
    
    event ProposalCreated(uint256 indexed proposalId, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    
    event ReferralRegistered(address indexed referee, address indexed referrer);
    event ReferralRewardPaid(address indexed referrer, address indexed referee, uint256 amount);
    
    event CashbackPaid(address indexed user, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    event SwapFeePaid(address indexed user, uint256 amount);
    event LaunchpadWhitelistUpdated(address indexed user, bool status);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _publicSaleWallet,
        address _founderWallet,
        address _communityWallet,
        address _treasuryWallet,
        address _teamWallet,
        address _strategicWallet,
        address _liquidityWallet
    ) ERC20("Blaze Token", "BLAZE") Ownable(msg.sender) {
        require(_publicSaleWallet != address(0), "Invalid public sale wallet");
        require(_founderWallet != address(0), "Invalid founder wallet");
        require(_communityWallet != address(0), "Invalid community wallet");
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_strategicWallet != address(0), "Invalid strategic wallet");
        require(_liquidityWallet != address(0), "Invalid liquidity wallet");
        
        publicSaleWallet = _publicSaleWallet;
        founderWallet = _founderWallet;
        communityWallet = _communityWallet;
        treasuryWallet = _treasuryWallet;
        teamWallet = _teamWallet;
        strategicWallet = _strategicWallet;
        liquidityWallet = _liquidityWallet;
        
        // Mint tokens
        _mint(_publicSaleWallet, PUBLIC_SALE);
        _mint(_liquidityWallet, LIQUIDITY);
        _mint(_founderWallet, FOUNDER_UNLOCKED);
        _mint(_communityWallet, COMMUNITY);
        _mint(_treasuryWallet, TREASURY);
        _mint(_teamWallet, TEAM);
        _mint(_strategicWallet, STRATEGIC);
    }
    
    // ============ STAKING FUNCTIONS ============
    
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(lockPeriod == 0 || lockPeriod == 180 || lockPeriod == 365, "Invalid lock period");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        if (stakes[msg.sender].amount > 0) {
            _claimRewards(msg.sender);
        }
        
        _transfer(msg.sender, address(this), amount);
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].lockPeriod = lockPeriod * 1 days;
        totalStaked += amount;
        
        _updatePremiumStatus(msg.sender);
        _updateLaunchpadWhitelist(msg.sender);
        
        emit Staked(msg.sender, amount, lockPeriod);
    }
    
    function unstake() external nonReentrant {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.timestamp + userStake.lockPeriod, "Still locked");
        
        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;
        
        totalStaked -= userStake.amount;
        delete stakes[msg.sender];
        
        _updatePremiumStatus(msg.sender);
        _updateLaunchpadWhitelist(msg.sender);
        
        _transfer(address(this), msg.sender, totalAmount);
        
        emit Unstaked(msg.sender, userStake.amount, reward);
    }
    
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    function _claimRewards(address user) internal {
        uint256 reward = calculateReward(user);
        require(reward > 0, "No rewards");
        
        stakes[user].rewardDebt += reward;
        stakes[user].timestamp = block.timestamp;
        
        _transfer(communityWallet, user, reward);
        
        emit RewardClaimed(user, reward);
    }
    
    function calculateReward(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 duration = block.timestamp - userStake.timestamp;
        uint256 apy = _getAPY(userStake.lockPeriod);
        
        return (userStake.amount * apy * duration) / (365 days * 10000);
    }
    
    function _getAPY(uint256 lockPeriod) internal pure returns (uint256) {
        if (lockPeriod >= 365 days) return ONE_YEAR_APY;
        if (lockPeriod >= 180 days) return SIX_MONTH_APY;
        return FLEXIBLE_APY;
    }
    
    // ============ PREMIUM MEMBERSHIP ============
    
    function _updatePremiumStatus(address user) internal {
        uint256 totalHoldings = balanceOf(user) + stakes[user].amount;
        bool shouldBePremium = totalHoldings >= PREMIUM_THRESHOLD;
        
        if (shouldBePremium && !isPremium[user]) {
            isPremium[user] = true;
            premiumSince[user] = block.timestamp;
            feeDiscounts[user] = 10000; // 100% discount
            emit PremiumActivated(user);
        } else if (!shouldBePremium && isPremium[user]) {
            isPremium[user] = false;
            premiumSince[user] = 0;
            feeDiscounts[user] = 0;
            emit PremiumRevoked(user);
        }
    }
    
    // ============ GOVERNANCE ============
    
    function createProposal(string memory description) external returns (uint256) {
        require(balanceOf(msg.sender) >= MIN_VOTE_TOKENS, "Need tokens to propose");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        
        emit ProposalCreated(proposalId, description);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(balanceOf(msg.sender) >= MIN_VOTE_TOKENS, "Need tokens to vote");
        
        uint256 weight = balanceOf(msg.sender) + stakes[msg.sender].amount;
        
        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        proposal.hasVoted[msg.sender] = true;
        
        emit Voted(proposalId, msg.sender, support, weight);
    }
    
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    // ============ REFERRAL SYSTEM ============
    
    function registerReferral(address referrer) external {
        require(referredBy[msg.sender] == address(0), "Already referred");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(referrer != address(0), "Invalid referrer");
        
        referredBy[msg.sender] = referrer;
        referralCount[referrer]++;
        
        // Pay referral reward
        uint256 reward = REFERRAL_REWARD;
        _transfer(communityWallet, referrer, reward);
        referralEarnings[referrer] += reward;
        
        emit ReferralRegistered(msg.sender, referrer);
        emit ReferralRewardPaid(referrer, msg.sender, reward);
    }
    
    function payReferralFeeShare(address user, uint256 feeAmount) external onlyOwner {
        address referrer = referredBy[user];
        if (referrer != address(0)) {
            uint256 referrerShare = (feeAmount * REFERRAL_FEE_SHARE) / 10000;
            _transfer(treasuryWallet, referrer, referrerShare);
            referralEarnings[referrer] += referrerShare;
        }
    }
    
    // ============ CASHBACK SYSTEM ============
    
    function payCashback(address user, uint256 transactionAmount) external onlyOwner {
        uint256 cashback = (transactionAmount * CASHBACK_RATE) / 10000;
        _transfer(communityWallet, user, cashback);
        totalCashbackEarned[user] += cashback;
        totalCashbackDistributed += cashback;
        
        emit CashbackPaid(user, cashback);
    }
    
    // ============ BURNING ============
    
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        // Exempt addresses from burn
        bool isExempt = from == address(0) || 
                        to == address(0) ||
                        from == address(this) ||
                        to == address(this) ||
                        from == liquidityWallet ||
                        to == liquidityWallet;
        
        if (!isExempt && BURN_RATE > 0) {
            uint256 burnAmount = (value * BURN_RATE) / 10000;
            
            if (burnAmount > 0) {
                super._update(from, address(0), burnAmount);
                totalBurned += burnAmount;
                emit TokensBurned(from, burnAmount, "Transfer burn");
                
                super._update(from, to, value - burnAmount);
                return;
            }
        }
        
        super._update(from, to, value);
    }
    
    function burnFromTreasury(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        _burn(treasuryWallet, amount);
        totalBurned += amount;
        emit TokensBurned(treasuryWallet, amount, "Treasury buyback & burn");
    }
    
    // ============ LAUNCHPAD ============
    
    function _updateLaunchpadWhitelist(address user) internal {
        uint256 totalHoldings = balanceOf(user) + stakes[user].amount;
        bool shouldBeWhitelisted = totalHoldings >= LAUNCHPAD_THRESHOLD;
        
        if (shouldBeWhitelisted != isWhitelistedForLaunchpad[user]) {
            isWhitelistedForLaunchpad[user] = shouldBeWhitelisted;
            emit LaunchpadWhitelistUpdated(user, shouldBeWhitelisted);
        }
    }
    
    // ============ FEE MANAGEMENT ============
    
    function processSwapFee(address user, uint256 swapAmount) external onlyOwner returns (uint256) {
        uint256 fee = (swapAmount * swapFeeRate) / 10000;
        uint256 discount = (fee * feeDiscounts[user]) / 10000;
        uint256 actualFee = fee - discount;
        
        if (actualFee > 0) {
            _transfer(user, treasuryWallet, actualFee);
            
            // Burn a portion
            uint256 burnAmount = (actualFee * SWAP_BURN_RATE) / 10000;
            if (burnAmount > 0) {
                _burn(treasuryWallet, burnAmount);
                totalBurned += burnAmount;
                emit TokensBurned(treasuryWallet, burnAmount, "Swap fee burn");
            }
            
            emit SwapFeePaid(user, actualFee);
        }
        
        return actualFee;
    }
    
    function setSwapFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 100, "Fee too high"); // Max 1%
        swapFeeRate = newRate;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 lockPeriod,
        uint256 pendingReward,
        bool premium,
        uint256 discount
    ) {
        Stake memory userStake = stakes[user];
        return (
            userStake.amount,
            userStake.timestamp,
            userStake.lockPeriod,
            calculateReward(user),
            isPremium[user],
            feeDiscounts[user]
        );
    }
    
    function getUserStats(address user) external view returns (
        uint256 totalHoldings,
        bool premium,
        bool launchpadWhitelisted,
        uint256 referrals,
        uint256 referralEarned,
        uint256 cashbackEarned
    ) {
        return (
            balanceOf(user) + stakes[user].amount,
            isPremium[user],
            isWhitelistedForLaunchpad[user],
            referralCount[user],
            referralEarnings[user],
            totalCashbackEarned[user]
        );
    }
    
    function getTokenStats() external view returns (
        uint256 circulatingSupply,
        uint256 burnedSupply,
        uint256 stakedSupply,
        uint256 cashbackDistributed
    ) {
        return (
            totalSupply(),
            totalBurned,
            totalStaked,
            totalCashbackDistributed
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
