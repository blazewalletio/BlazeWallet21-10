const hre = require("hardhat");

async function main() {
  const presaleAddress = "0xf1898f9d831e3bEbC137e006914205810cD09935";
  
  console.log("\n🔧 FIXING PRESALE...\n");
  
  const Presale = await hre.ethers.getContractFactory("BlazePresale");
  const presale = Presale.attach(presaleAddress);
  
  // Check current state
  console.log("📊 CURRENT STATE:");
  console.log("- Presale Active:", await presale.presaleActive());
  console.log("- Presale Finalized:", await presale.presaleFinalized());
  console.log("- Start Time:", await presale.startTime());
  console.log("- End Time:", await presale.endTime());
  console.log("- Total Raised:", hre.ethers.formatEther(await presale.totalRaised()), "BNB");
  
  const currentTime = Math.floor(Date.now() / 1000);
  const endTime = Number(await presale.endTime());
  
  console.log("\n⏰ TIME CHECK:");
  console.log("- Current Time:", currentTime);
  console.log("- End Time:", endTime);
  console.log("- Time Diff:", endTime - currentTime, "seconds");
  
  if (endTime < currentTime || endTime === 0) {
    console.log("\n🔄 Restarting presale...");
    
    // Start presale for 30 days
    const tx = await presale.startPresale(30 * 24 * 60 * 60); // 30 days in seconds
    await tx.wait();
    
    console.log("✅ Presale restarted!");
    
    // Check new state
    console.log("\n📊 NEW STATE:");
    console.log("- Start Time:", await presale.startTime());
    console.log("- End Time:", await presale.endTime());
    console.log("- Presale Active:", await presale.presaleActive());
  } else {
    console.log("✅ Presale is already active!");
  }
}

main();
