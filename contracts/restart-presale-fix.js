const hre = require("hardhat");

async function main() {
  const presaleAddress = "0xf1898f9d831e3bEbC137e006914205810cD09935";
  
  console.log("\n🔄 RESTARTING PRESALE WITH FIX...\n");
  
  const Presale = await hre.ethers.getContractFactory("BlazePresale");
  const presale = Presale.attach(presaleAddress);
  
  // Check current state first
  console.log("📊 CURRENT STATE:");
  console.log("- Presale Active:", await presale.presaleActive());
  console.log("- Presale Finalized:", await presale.presaleFinalized());
  console.log("- Start Time:", await presale.startTime());
  console.log("- End Time:", await presale.endTime());
  console.log("- Total Raised:", hre.ethers.formatEther(await presale.totalRaised()), "BNB");
  
  const currentTime = Math.floor(Date.now() / 1000);
  const endTime = Number(await presale.endTime());
  
  console.log("\n⏰ TIME ANALYSIS:");
  console.log("- Current Time:", currentTime);
  console.log("- End Time:", endTime);
  console.log("- Time Diff:", endTime - currentTime, "seconds");
  console.log("- Time Diff (days):", (endTime - currentTime) / (24 * 60 * 60));
  
  // Force restart presale for 30 days
  console.log("\n🚀 FORCE RESTARTING PRESALE...");
  
  try {
    // Start presale for 30 days (30 * 24 * 60 * 60 = 2,592,000 seconds)
    const tx = await presale.startPresale(2592000);
    await tx.wait();
    
    console.log("✅ Presale restarted successfully!");
    
    // Check new state
    console.log("\n📊 NEW STATE:");
    console.log("- Presale Active:", await presale.presaleActive());
    console.log("- Start Time:", await presale.startTime());
    console.log("- End Time:", await presale.endTime());
    console.log("- Time Remaining:", Number(await presale.endTime()) - currentTime, "seconds");
    console.log("- Time Remaining (days):", (Number(await presale.endTime()) - currentTime) / (24 * 60 * 60));
    
  } catch (error) {
    console.error("❌ Error restarting presale:", error.message);
  }
}

main();
