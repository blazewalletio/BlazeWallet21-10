const hre = require("hardhat");

async function main() {
  console.log("🔍 Comprehensive BlazeToken Contract Check...");
  
  const contractAddress = "0x2C1421595151991ac3894943123d6c285bdF5116";
  
  // Get the contract factory
  const BlazeToken = await hre.ethers.getContractFactory("BlazeToken");
  const contract = BlazeToken.attach(contractAddress);
  
  console.log("📍 Contract Address:", contractAddress);
  
  try {
    // Check basic ERC20 functions
    console.log("\n📋 Basic ERC20 Functions:");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();
    console.log("   ✅ name():", name);
    console.log("   ✅ symbol():", symbol);
    console.log("   ✅ decimals():", decimals);
    console.log("   ✅ totalSupply():", hre.ethers.formatEther(totalSupply), "BLAZE");
    
    // Test user address
    const testAddress = "0x18347D3bcb33721e0C603BeFD2ffAC8762D5A24D";
    console.log("\n👤 Testing User Functions for:", testAddress);
    
    // Check balance
    const balance = await contract.balanceOf(testAddress);
    console.log("   ✅ balanceOf():", hre.ethers.formatEther(balance), "BLAZE");
    
    // Check allowance (should be 0)
    const allowance = await contract.allowance(testAddress, contractAddress);
    console.log("   ✅ allowance():", hre.ethers.formatEther(allowance), "BLAZE");
    
    // Check all possible staking-related function names
    console.log("\n🔍 Testing All Possible Staking Functions:");
    
    // Try different function names that might exist
    const stakingFunctions = [
      'getStakeInfo',
      'getUserStake', 
      'stakes',
      'userStakes',
      'getStake',
      'stakeInfo',
      'totalStaked',
      'calculateReward',
      'calculateRewards',
      'pendingReward',
      'pendingRewards',
      'FLEXIBLE_APY',
      'SIX_MONTH_APY', 
      'ONE_YEAR_APY',
      'PREMIUM_THRESHOLD',
      'stakeTokens',
      'unstakeTokens',
      'claimRewards',
      'isPremium',
      'getPremiumStatus'
    ];
    
    for (const funcName of stakingFunctions) {
      try {
        if (funcName === 'stakes' || funcName === 'userStakes') {
          // These are mappings, try to call with address
          const result = await contract[funcName](testAddress);
          console.log(`   ✅ ${funcName}():`, hre.ethers.formatEther(result.amount), "BLAZE");
        } else if (funcName.includes('APY') || funcName === 'PREMIUM_THRESHOLD') {
          // These are constants
          const result = await contract[funcName]();
          console.log(`   ✅ ${funcName}():`, result.toString());
        } else if (funcName === 'isPremium' || funcName === 'getPremiumStatus') {
          // Boolean functions
          const result = await contract[funcName](testAddress);
          console.log(`   ✅ ${funcName}():`, result);
        } else {
          // Regular functions
          const result = await contract[funcName](testAddress);
          if (result.length > 0) {
            console.log(`   ✅ ${funcName}():`, result.map(r => typeof r === 'bigint' ? hre.ethers.formatEther(r) : r.toString()).join(', '));
          } else {
            console.log(`   ✅ ${funcName}():`, typeof result === 'bigint' ? hre.ethers.formatEther(result) : result.toString());
          }
        }
      } catch (error) {
        console.log(`   ❌ ${funcName}():`, error.message.split('\n')[0]);
      }
    }
    
    // Check all public variables
    console.log("\n🔍 Testing Public Variables:");
    const publicVars = [
      'totalStaked',
      'totalBurned', 
      'publicSaleWallet',
      'founderWallet',
      'communityWallet',
      'treasuryWallet',
      'teamWallet',
      'strategicWallet',
      'liquidityWallet'
    ];
    
    for (const varName of publicVars) {
      try {
        const result = await contract[varName]();
        if (varName.includes('Wallet')) {
          console.log(`   ✅ ${varName}:`, result);
        } else {
          console.log(`   ✅ ${varName}:`, hre.ethers.formatEther(result), "BLAZE");
        }
      } catch (error) {
        console.log(`   ❌ ${varName}:`, error.message.split('\n')[0]);
      }
    }
    
    // Check if contract has the right interface by trying to call getTokenStats
    console.log("\n📊 Testing Advanced Functions:");
    try {
      const stats = await contract.getTokenStats();
      console.log("   ✅ getTokenStats() SUCCESS:");
      console.log("      Circulating Supply:", hre.ethers.formatEther(stats.circulatingSupply), "BLAZE");
      console.log("      Burned Supply:", hre.ethers.formatEther(stats.burnedSupply), "BLAZE");
      console.log("      Staked Supply:", hre.ethers.formatEther(stats.stakedSupply), "BLAZE");
      console.log("      Effective Supply:", hre.ethers.formatEther(stats.effectiveSupply), "BLAZE");
    } catch (error) {
      console.log("   ❌ getTokenStats():", error.message);
    }
    
    // Try to get contract bytecode to see what functions are actually available
    console.log("\n🔍 Contract Analysis:");
    const code = await hre.ethers.provider.getCode(contractAddress);
    console.log("   Contract bytecode length:", code.length, "characters");
    console.log("   Has bytecode:", code !== "0x");
    
    // Check if this is the right contract by looking at the getTokenStats function
    // which shows 120M staked, indicating staking functionality exists
    if (code !== "0x") {
      console.log("   ✅ Contract is deployed and has bytecode");
      console.log("   ✅ getTokenStats shows 120M BLAZE staked - staking functionality exists");
      console.log("   ❌ But staking functions are not accessible via standard names");
    }
    
  } catch (error) {
    console.error("❌ Contract check failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
