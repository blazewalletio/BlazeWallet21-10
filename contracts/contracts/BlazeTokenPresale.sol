// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Blaze Token - Presale Edition
 * @dev Ultimate utility token for Blaze Wallet with optimized presale tokenomics
 * 
 * Total Supply: 1,000,000,000 BLAZE
 * 
 * Distribution:
 * - 12% Presale (120M) - $0.008333 per BLAZE
 * - 18% Liquidity (180M)
 * - 8% Founder Immediate (80M)
 * - 12% Founder Vesting (120M) - 6 months lock
 * - 20% Community Rewards (200M)
 * - 15% Treasury (150M)
 * - 10% Team (100M)
 * - 5% Strategic Partners (50M)
 */
contract BlazeTokenPresale is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Distribution Wallets
    address public presaleContract;
    address public liquidityWallet;
    address public founderImmediateWallet;
    address public founderVestingWallet;
    address public communityWallet;
    address public treasuryWallet;
    address public teamWallet;
    address public strategicWallet;
    
    // Token Amounts (1 Billion Total)
    uint256 private constant PRESALE = 120_000_000 * 10**18;          // 12%
    uint256 private constant LIQUIDITY = 180_000_000 * 10**18;        // 18%
    uint256 private constant FOUNDER_IMMEDIATE = 80_000_000 * 10**18; // 8%
    uint256 private constant FOUNDER_VESTING = 120_000_000 * 10**18;  // 12%
    uint256 private constant COMMUNITY = 200_000_000 * 10**18;        // 20%
    uint256 private constant TREASURY = 150_000_000 * 10**18;         // 15%
    uint256 private constant TEAM = 100_000_000 * 10**18;             // 10%
    uint256 private constant STRATEGIC = 50_000_000 * 10**18;         // 5%
    
    // Burning Mechanism
    uint256 public totalBurned;
    uint256 public constant BURN_RATE_TRANSFER = 10; // 0.10%
    uint256 public constant BURN_RATE_SWAP = 50;     // 0.50%
    
    // Vesting
    uint256 public vestingStartTime;
    uint256 public constant VESTING_DURATION = 180 days; // 6 months
    uint256 public vestedAmount;
    
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event VestingReleased(address indexed beneficiary, uint256 amount);
    
    constructor(
        address _presaleContract,
        address _liquidityWallet,
        address _founderImmediateWallet,
        address _founderVestingWallet,
        address _communityWallet,
        address _treasuryWallet,
        address _teamWallet,
        address _strategicWallet
    ) ERC20("Blaze Token", "BLAZE") Ownable(msg.sender) {
        require(_presaleContract != address(0), "Invalid presale contract");
        require(_liquidityWallet != address(0), "Invalid liquidity wallet");
        require(_founderImmediateWallet != address(0), "Invalid founder immediate wallet");
        require(_founderVestingWallet != address(0), "Invalid founder vesting wallet");
        require(_communityWallet != address(0), "Invalid community wallet");
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_strategicWallet != address(0), "Invalid strategic wallet");
        
        presaleContract = _presaleContract;
        liquidityWallet = _liquidityWallet;
        founderImmediateWallet = _founderImmediateWallet;
        founderVestingWallet = _founderVestingWallet;
        communityWallet = _communityWallet;
        treasuryWallet = _treasuryWallet;
        teamWallet = _teamWallet;
        strategicWallet = _strategicWallet;
        
        // Mint tokens according to tokenomics
        _mint(_presaleContract, PRESALE);
        _mint(_liquidityWallet, LIQUIDITY);
        _mint(_founderImmediateWallet, FOUNDER_IMMEDIATE);
        _mint(address(this), FOUNDER_VESTING); // Vested tokens held by contract
        _mint(_communityWallet, COMMUNITY);
        _mint(_treasuryWallet, TREASURY);
        _mint(_teamWallet, TEAM);
        _mint(_strategicWallet, STRATEGIC);
        
        vestingStartTime = block.timestamp;
    }
    
    /**
     * @dev Release vested tokens to founder
     */
    function releaseVesting() external nonReentrant {
        require(msg.sender == founderVestingWallet || msg.sender == owner(), "Not authorized");
        
        uint256 releasable = calculateReleasableAmount();
        require(releasable > 0, "No tokens to release");
        
        vestedAmount += releasable;
        _transfer(address(this), founderVestingWallet, releasable);
        
        emit VestingReleased(founderVestingWallet, releasable);
    }
    
    /**
     * @dev Calculate how many tokens can be released
     */
    function calculateReleasableAmount() public view returns (uint256) {
        if (block.timestamp < vestingStartTime) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - vestingStartTime;
        uint256 totalVestable = FOUNDER_VESTING;
        
        if (elapsed >= VESTING_DURATION) {
            // Full vesting period passed
            return totalVestable - vestedAmount;
        }
        
        // Linear vesting
        uint256 vested = (totalVestable * elapsed) / VESTING_DURATION;
        return vested - vestedAmount;
    }
    
    /**
     * @dev Get vesting info
     */
    function getVestingInfo() external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 releasableAmount,
        uint256 remainingTime
    ) {
        totalAmount = FOUNDER_VESTING;
        releasedAmount = vestedAmount;
        releasableAmount = calculateReleasableAmount();
        
        if (block.timestamp >= vestingStartTime + VESTING_DURATION) {
            remainingTime = 0;
        } else {
            remainingTime = (vestingStartTime + VESTING_DURATION) - block.timestamp;
        }
    }
    
    /**
     * @dev Override transfer to implement burn mechanism
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        // Exempt addresses from burn
        bool isExempt = from == address(0) || 
                        to == address(0) ||
                        from == address(this) ||
                        from == liquidityWallet ||
                        to == liquidityWallet ||
                        from == treasuryWallet ||
                        to == treasuryWallet ||
                        from == communityWallet ||
                        to == communityWallet ||
                        from == presaleContract ||
                        to == presaleContract;
        
        // Apply burn on transfers
        if (!isExempt && BURN_RATE_TRANSFER > 0) {
            uint256 burnAmount = (value * BURN_RATE_TRANSFER) / 10000;
            if (burnAmount > 0) {
                super._update(from, address(0), burnAmount);
                totalBurned += burnAmount;
                emit TokensBurned(from, burnAmount, "Transfer burn");
                value -= burnAmount;
            }
        }
        
        super._update(from, to, value);
    }
    
    /**
     * @dev Burn tokens from treasury (buyback & burn)
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
     * @dev Get token statistics
     */
    function getTokenStats() external view returns (
        uint256 circulatingSupply,
        uint256 burnedSupply,
        uint256 vestedSupply,
        uint256 effectiveSupply
    ) {
        uint256 totalSupply = totalSupply();
        circulatingSupply = totalSupply;
        burnedSupply = totalBurned;
        vestedSupply = FOUNDER_VESTING - vestedAmount;
        effectiveSupply = totalSupply - totalBurned - vestedSupply;
    }
}

