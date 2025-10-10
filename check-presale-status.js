const hre = require("hardhat");

async function main() {
  const presaleAddress = "0xf1898f9d831e3bEbC137e006914205810cD09935";
  
  console.log("\n🔍 CHECKING PRESALE STATUS...\n");
  
  const Presale = await hre.ethers.getContractFactory("BlazePresale");
  const presale = Presale.attach(presaleAddress);
  
  const info = await presale.getPresaleInfo();
  
  console.log("📊 PRESALE INFO:");
  console.log("- Active:", info.active);
  console.log("- Started:", info.startTime.toString());
  console.log("- Duration:", info.duration.toString(), "seconds");
  console.log("- End time:", info.endTime.toString());
  console.log("- Current time:", Math.floor(Date.now() / 1000));
  console.log("- Time remaining:", Number(info.timeRemaining), "seconds");
  console.log("- Time remaining (days):", Number(info.timeRemaining) / (24 * 60 * 60));
  
  const currentTime = Math.floor(Date.now() / 1000);
  const endTime = Number(info.endTime);
  
  console.log("\n⏰ TIME ANALYSIS:");
  console.log("- Current:", new Date(currentTime * 1000).toLocaleString());
  console.log("- End time:", new Date(endTime * 1000).toLocaleString());
  
  if (currentTime > endTime) {
    console.log("❌ Presale has ended!");
  } else {
    console.log("✅ Presale is still active!");
  }
}

main();
