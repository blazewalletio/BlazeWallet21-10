const hre = require("hardhat");

async function main() {
  const address = "0x18347D3bcb33721e0C603BeFD2ffAC8762D5A24D";
  
  console.log("\n💰 DETAILED BALANCE CHECK\n");
  console.log("Address:", address);
  console.log("Network: BSC Testnet (Chain ID 97)");
  
  try {
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceEther = hre.ethers.formatEther(balance);
    
    console.log("\n✅ BALANCE FOUND:");
    console.log("- Wei:", balance.toString());
    console.log("- BNB:", balanceEther);
    
    if (parseFloat(balanceEther) > 0) {
      console.log("✅ You have BNB on BSC Testnet!");
    } else {
      console.log("❌ No BNB found. Try the faucet again:");
      console.log("   https://testnet.bnbchain.org/faucet-smart");
    }
    
    // Also check recent transactions
    console.log("\n🔍 Checking recent transactions...");
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("Current block:", blockNumber);
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main();
