// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FounderVesting
 * @dev Vesting contract for Arc Token founder allocation (V4 Enhanced)
 * 
 * Allocation: 150M ARC (15% of total supply)
 * Schedule: 6-month cliff, then 42-month linear vesting (4 years total)
 * 
 * This represents 60% of founder's total allocation (250M)
 * The remaining 40% (100M) is unlocked at launch for operations
 */
contract FounderVesting is Ownable, ReentrancyGuard {
    
    IERC20 public immutable arcToken;
    address public immutable founder;
    
    uint256 public constant TOTAL_ALLOCATION = 150_000_000 * 10**18; // 150M ARC
    uint256 public constant CLIFF_DURATION = 180 days; // 6 months
    uint256 public constant VESTING_DURATION = 1460 days; // 4 years total
    uint256 public immutable vestingStart;
    uint256 public immutable cliffEnd;
    uint256 public immutable vestingEnd;
    
    uint256 public released;
    
    event TokensReleased(uint256 amount, uint256 timestamp);
    event VestingStarted(uint256 startTime, address indexed founder);
    
    constructor(
        address _arcToken,
        address _founder
    ) Ownable(msg.sender) {
        require(_arcToken != address(0), "Invalid token address");
        require(_founder != address(0), "Invalid founder address");
        
        arcToken = IERC20(_arcToken);
        founder = _founder;
        
        vestingStart = block.timestamp;
        cliffEnd = vestingStart + CLIFF_DURATION;
        vestingEnd = vestingStart + VESTING_DURATION;
        
        emit VestingStarted(vestingStart, _founder);
    }
    
    /**
     * @dev Get amount of tokens that have vested
     */
    function vestedAmount() public view returns (uint256) {
        if (block.timestamp < cliffEnd) {
            // Before cliff: nothing vested
            return 0;
        } else if (block.timestamp >= vestingEnd) {
            // After vesting period: everything vested
            return TOTAL_ALLOCATION;
        } else {
            // During vesting: linear unlock
            uint256 timeFromStart = block.timestamp - vestingStart;
            return (TOTAL_ALLOCATION * timeFromStart) / VESTING_DURATION;
        }
    }
    
    /**
     * @dev Get amount of tokens that can be released
     */
    function releasableAmount() public view returns (uint256) {
        return vestedAmount() - released;
    }
    
    /**
     * @dev Release vested tokens to founder
     */
    function release() external nonReentrant {
        require(msg.sender == founder || msg.sender == owner(), "Not authorized");
        
        uint256 amount = releasableAmount();
        require(amount > 0, "No tokens to release");
        
        released += amount;
        require(arcToken.transfer(founder, amount), "Transfer failed");
        
        emit TokensReleased(amount, block.timestamp);
    }
    
    /**
     * @dev Get vesting schedule info
     */
    function getVestingInfo() external view returns (
        uint256 _vestingStart,
        uint256 _cliffEnd,
        uint256 _vestingEnd,
        uint256 _totalAllocation,
        uint256 _vestedAmount,
        uint256 _releasedAmount,
        uint256 _releasableAmount,
        uint256 _remainingAmount
    ) {
        return (
            vestingStart,
            cliffEnd,
            vestingEnd,
            TOTAL_ALLOCATION,
            vestedAmount(),
            released,
            releasableAmount(),
            TOTAL_ALLOCATION - released
        );
    }
    
    /**
     * @dev Get current vesting progress (in basis points, 10000 = 100%)
     */
    function getVestingProgress() external view returns (uint256) {
        if (block.timestamp < vestingStart) return 0;
        if (block.timestamp >= vestingEnd) return 10000;
        
        uint256 timeElapsed = block.timestamp - vestingStart;
        return (timeElapsed * 10000) / VESTING_DURATION;
    }
    
    /**
     * @dev Get time until cliff or vesting end
     */
    function getTimeUntilNextMilestone() external view returns (
        string memory milestone,
        uint256 secondsRemaining
    ) {
        if (block.timestamp < cliffEnd) {
            return ("Cliff End", cliffEnd - block.timestamp);
        } else if (block.timestamp < vestingEnd) {
            return ("Vesting End", vestingEnd - block.timestamp);
        } else {
            return ("Fully Vested", 0);
        }
    }
    
    /**
     * @dev Emergency function to recover accidentally sent tokens (not ARC)
     */
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != address(arcToken), "Cannot recover ARC tokens");
        require(IERC20(token).transfer(owner(), amount), "Recovery failed");
    }
}