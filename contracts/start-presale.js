const hre = require("hardhat");

async function main() {
  const presaleAddress = "0xf1898f9d831e3bEbC137e006914205810cD09935";
  
  console.log("\n🚀 STARTING PRESALE...\n");
  
  const Presale = await hre.ethers.getContractFactory("BlazePresale");
  const presale = Presale.attach(presaleAddress);
  
  console.log("Starting presale for 30 days...");
  const tx = await presale.startPresale(30);
  await tx.wait();
  
  console.log("✅ Presale started!\n");
  
  const info = await presale.getPresaleInfo();
  console.log("📊 PRESALE STATUS:");
  console.log("- Active:", info.active);
  console.log("- Participants:", info.participantCount.toString());
  console.log("- Raised:", hre.ethers.formatEther(info.raised), "BNB");
  console.log("- Time remaining:", Number(info.timeRemaining) / (24 * 60 * 60), "days\n");
  
  console.log("🎉 Presale is LIVE on testnet!");
  console.log("Test it at: https://my.blazewallet.io\n");
}

main();
