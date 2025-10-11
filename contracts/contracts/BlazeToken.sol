// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Blaze Token
 * @dev The utility token that powers Blaze wallet - V4 Enhanced
 * 
 * Distribution (1B total):
 * - 25% Public Sale & Liquidity (250M)
 * - 25% Founder (250M) - 10% unlocked, 15% vesting
 * - 20% Community Rewards (200M)
 * - 15% Treasury (150M)
 * - 10% Team (100M) - 3yr vesting
 * - 5% Strategic (50M) - 2yr vesting
 * 
 * Features:
 * - Deflationary (built-in burns)
 * - Staking with rewards (8-20% APY)
 * - Fee discounts for holders
 * - No anti-dump mechanisms (Bitcoin approach)
 * - Multi-chain ready
 */
contract BlazeToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Distribution addresses
    address public publicSaleWallet;
    address public founderWallet;
    address public communityWallet;
    address public treasuryWallet;
    address public teamWallet;
    address public strategicWallet;
    address public liquidityWallet;
    
    // Token amounts (1 billion total)
    uint256 private constant PUBLIC_SALE = 150_000_000 * 10**18;      // 15%
    uint256 private constant LIQUIDITY = 100_000_000 * 10**18;        // 10%
    uint256 private constant FOUNDER_UNLOCKED = 100_000_000 * 10**18; // 10%
    uint256 private constant FOUNDER_LOCKED = 150_000_000 * 10**18;   // 15% (vesting contract)
    uint256 private constant COMMUNITY = 200_000_000 * 10**18;        // 20%
    uint256 private constant TREASURY = 150_000_000 * 10**18;         // 15%
    uint256 private constant TEAM = 100_000_000 * 10**18;             // 10%
    uint256 private constant STRATEGIC = 50_000_000 * 10**18;         // 5%
    
    // Burn tracking
    uint256 public totalBurned;
    uint256 public constant BURN_RATE = 10; // 0.10% = 10 basis points per 10,000
    
    // Staking
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // 0 = flexible, 180 days, 365 days
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    
    // Staking APY rates (basis points: 100 = 1%)
    uint256 public constant FLEXIBLE_APY = 800;   // 8%
    uint256 public constant SIX_MONTH_APY = 1500; // 15%
    uint256 public constant ONE_YEAR_APY = 2000;  // 20%
    
    // Fee discounts (basis points)
    mapping(address => uint256) public feeDiscounts;
    
    // Premium membership (10000 BLAZE staked = lifetime premium)
    uint256 public constant PREMIUM_THRESHOLD = 10000 * 10**18;
    mapping(address => bool) public isPremium;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    event PremiumActivated(address indexed user);
    event FeeDiscountUpdated(address indexed user, uint256 discount);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
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
        
        // Mint tokens according to tokenomics
        _mint(_publicSaleWallet, PUBLIC_SALE);
        _mint(_liquidityWallet, LIQUIDITY);
        _mint(_founderWallet, FOUNDER_UNLOCKED);
        _mint(_communityWallet, COMMUNITY);
        _mint(_treasuryWallet, TREASURY);
        _mint(_teamWallet, TEAM);
        _mint(_strategicWallet, STRATEGIC);
        
        // Mint founder locked tokens to founder wallet (will be transferred to vesting contract after deployment)
        _mint(_founderWallet, FOUNDER_LOCKED);
    }
    
    /**
     * @dev Stake tokens to earn rewards and unlock premium features
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0 tokens");
        require(
            lockPeriod == 0 || lockPeriod == 180 || lockPeriod == 365,
            "Invalid lock period"
        );
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Claim any pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update stake
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].lockPeriod = lockPeriod * 1 days;
        totalStaked += amount;
        
        // Activate premium if threshold met
        if (stakes[msg.sender].amount >= PREMIUM_THRESHOLD && !isPremium[msg.sender]) {
            isPremium[msg.sender] = true;
            emit PremiumActivated(msg.sender);
        }
        
        // Set fee discount based on stake
        _updateFeeDiscount(msg.sender);
        
        emit Staked(msg.sender, amount, lockPeriod);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstake() external nonReentrant {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(
            block.timestamp >= userStake.timestamp + userStake.lockPeriod,
            "Tokens still locked"
        );
        
        // Calculate rewards
        uint256 reward = calculateReward(msg.sender);
        
        // Reset stake
        totalStaked -= userStake.amount;
        delete stakes[msg.sender];
        
        // Update premium status
        if (isPremium[msg.sender]) {
            isPremium[msg.sender] = false;
        }
        
        // Reset fee discount
        feeDiscounts[msg.sender] = 0;
        
        // Transfer staked tokens back from contract
        _transfer(address(this), msg.sender, userStake.amount);
        
        // Transfer rewards from community wallet
        if (reward > 0) {
            _transfer(communityWallet, msg.sender, reward);
        }
        
        emit Unstaked(msg.sender, userStake.amount, reward);
    }
    
    /**
     * @dev Claim staking rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(address user) internal {
        uint256 reward = calculateReward(user);
        require(reward > 0, "No rewards to claim");
        
        stakes[user].rewardDebt += reward;
        stakes[user].timestamp = block.timestamp;
        
        // Mint rewards from community wallet
        _transfer(communityWallet, user, reward);
        
        emit RewardClaimed(user, reward);
    }
    
    /**
     * @dev Calculate pending rewards for a user
     */
    function calculateReward(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 apy = _getAPY(userStake.lockPeriod);
        
        // Calculate reward: (amount * APY * duration) / (365 days * 10000)
        uint256 reward = (userStake.amount * apy * stakingDuration) / (365 days * 10000);
        
        return reward;
    }
    
    /**
     * @dev Get APY based on lock period
     */
    function _getAPY(uint256 lockPeriod) internal pure returns (uint256) {
        if (lockPeriod >= 365 days) return ONE_YEAR_APY;
        if (lockPeriod >= 180 days) return SIX_MONTH_APY;
        return FLEXIBLE_APY;
    }
    
    /**
     * @dev Update fee discount based on stake amount
     */
    function _updateFeeDiscount(address user) internal {
        uint256 stakedAmount = stakes[user].amount;
        uint256 discount;
        
        if (stakedAmount >= 100000 * 10**18) {
            discount = 7500; // 75% discount
        } else if (stakedAmount >= 50000 * 10**18) {
            discount = 5000; // 50% discount
        } else if (stakedAmount >= 10000 * 10**18) {
            discount = 2500; // 25% discount
        } else if (stakedAmount >= 1000 * 10**18) {
            discount = 1000; // 10% discount
        } else {
            discount = 0;
        }
        
        feeDiscounts[user] = discount;
        emit FeeDiscountUpdated(user, discount);
    }
    
    /**
     * @dev Override transfer to implement burn mechanism
     * Burns 0.10% of each transfer (except from/to exempt addresses)
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        // Exempt addresses from burn (minting, staking, liquidity pools)
        bool isExempt = from == address(0) || // minting
                        to == address(0) ||   // burning
                        from == address(this) || // unstaking
                        to == address(this) ||   // staking
                        from == liquidityWallet || // initial liquidity
                        to == liquidityWallet;
        
        if (!isExempt && BURN_RATE > 0) {
            // Calculate burn amount (0.10%)
            uint256 burnAmount = (value * BURN_RATE) / 10000;
            
            if (burnAmount > 0) {
                // Burn tokens
                super._update(from, address(0), burnAmount);
                totalBurned += burnAmount;
                emit TokensBurned(from, burnAmount, "Transfer burn");
                
                // Transfer remaining amount
                super._update(from, to, value - burnAmount);
                return;
            }
        }
        
        super._update(from, to, value);
    }
    
    /**
     * @dev Burn tokens from treasury (for buyback & burn)
     */
    function burnFromTreasury(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        _burn(treasuryWallet, amount);
        totalBurned += amount;
        emit TokensBurned(treasuryWallet, amount, "Treasury buyback & burn");
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get user stake info
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 lockPeriod,
        uint256 pendingReward,
        bool premium,
        uint256 feeDiscount
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
    
    /**
     * @dev Get token statistics
     */
    function getTokenStats() external view returns (
        uint256 circulatingSupply,
        uint256 burnedSupply,
        uint256 stakedSupply,
        uint256 effectiveSupply
    ) {
        uint256 totalSupply = totalSupply();
        return (
            totalSupply,
            totalBurned,
            totalStaked,
            totalSupply - totalBurned
        );
    }
}