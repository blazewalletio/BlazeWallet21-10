const hre = require("hardhat");

async function main() {
  const presaleAddress = "0xf1898f9d831e3bEbC137e006914205810cD09935";
  
  console.log("\n🔄 RESTARTING PRESALE...\n");
  
  const Presale = await hre.ethers.getContractFactory("BlazePresale");
  const presale = Presale.attach(presaleAddress);
  
  // Start presale for 30 days (30 * 24 * 60 * 60 = 2,592,000 seconds)
  console.log("Starting presale for 30 days...");
  const tx = await presale.startPresale(2592000);
  await tx.wait();
  
  console.log("✅ Presale restarted!\n");
  
  // Get basic info
  const info = await presale.getPresaleInfo();
  console.log("📊 PRESALE STATUS:");
  console.log("- Active:", info.active);
  console.log("- Participants:", info.participantCount.toString());
  console.log("- Raised:", hre.ethers.formatEther(info.raised), "BNB");
  
  console.log("\n🎉 Presale is LIVE again!");
  console.log("Test it at: https://my.blazewallet.io\n");
}

main();
