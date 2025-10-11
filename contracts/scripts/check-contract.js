const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking BlazeToken contract on BSC Testnet...");
  
  const contractAddress = "0x2C1421595151991ac3894943123d6c285bdF5116";
  
  // Get the contract factory
  const BlazeToken = await hre.ethers.getContractFactory("BlazeToken");
  const contract = BlazeToken.attach(contractAddress);
  
  console.log("📍 Contract Address:", contractAddress);
  
  try {
    // Check basic contract info
    console.log("\n📋 Basic Contract Info:");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Decimals:", decimals);
    
    // Check total supply
    const totalSupply = await contract.totalSupply();
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "BLAZE");
    
    // Check staking variables
    console.log("\n🔒 Staking Variables:");
    try {
      const totalStaked = await contract.totalStaked();
      console.log("   ✅ totalStaked:", hre.ethers.formatEther(totalStaked), "BLAZE");
    } catch (error) {
      console.log("   ❌ totalStaked ERROR:", error.message);
    }
    
    // Check APY constants
    try {
      const flexibleAPY = await contract.FLEXIBLE_APY();
      const sixMonthAPY = await contract.SIX_MONTH_APY();
      const oneYearAPY = await contract.ONE_YEAR_APY();
      console.log("   ✅ FLEXIBLE_APY:", flexibleAPY.toString());
      console.log("   ✅ SIX_MONTH_APY:", sixMonthAPY.toString());
      console.log("   ✅ ONE_YEAR_APY:", oneYearAPY.toString());
    } catch (error) {
      console.log("   ❌ APY constants ERROR:", error.message);
    }
    
    // Test address
    const testAddress = "0x18347D3bcb33721e0C603BeFD2ffAC8762D5A24D";
    console.log("\n👤 Testing User Address:", testAddress);
    
    // Check user balance
    try {
      const balance = await contract.balanceOf(testAddress);
      console.log("   ✅ Balance:", hre.ethers.formatEther(balance), "BLAZE");
    } catch (error) {
      console.log("   ❌ Balance ERROR:", error.message);
    }
    
    // Check getStakeInfo
    console.log("\n🔍 Testing getStakeInfo function:");
    try {
      const stakeInfo = await contract.getStakeInfo(testAddress);
      console.log("   ✅ getStakeInfo SUCCESS:");
      console.log("      Amount:", hre.ethers.formatEther(stakeInfo.amount), "BLAZE");
      console.log("      Timestamp:", new Date(Number(stakeInfo.timestamp) * 1000).toISOString());
      console.log("      Lock Period:", Number(stakeInfo.lockPeriod), "seconds");
      console.log("      Pending Reward:", hre.ethers.formatEther(stakeInfo.pendingReward), "BLAZE");
      console.log("      Premium:", stakeInfo.premium);
      console.log("      Fee Discount:", Number(stakeInfo.feeDiscount), "basis points");
    } catch (error) {
      console.log("   ❌ getStakeInfo ERROR:", error.message);
      console.log("   ❌ Error code:", error.code);
      console.log("   ❌ Error data:", error.data);
    }
    
    // Check calculateReward
    console.log("\n💰 Testing calculateReward function:");
    try {
      const reward = await contract.calculateReward(testAddress);
      console.log("   ✅ calculateReward SUCCESS:", hre.ethers.formatEther(reward), "BLAZE");
    } catch (error) {
      console.log("   ❌ calculateReward ERROR:", error.message);
    }
    
    // Check getTokenStats
    console.log("\n📊 Testing getTokenStats function:");
    try {
      const stats = await contract.getTokenStats();
      console.log("   ✅ getTokenStats SUCCESS:");
      console.log("      Circulating Supply:", hre.ethers.formatEther(stats.circulatingSupply), "BLAZE");
      console.log("      Burned Supply:", hre.ethers.formatEther(stats.burnedSupply), "BLAZE");
      console.log("      Staked Supply:", hre.ethers.formatEther(stats.stakedSupply), "BLAZE");
      console.log("      Effective Supply:", hre.ethers.formatEther(stats.effectiveSupply), "BLAZE");
    } catch (error) {
      console.log("   ❌ getTokenStats ERROR:", error.message);
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
