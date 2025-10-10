const hre = require("hardhat");

async function main() {
  const presaleAddress = "0x8321C862B49C4Ad9132e55c3B24Cb72772B30fdd";
  
  console.log("\n🚀 STARTING PRESALE...\n");
  console.log("Contract:", presaleAddress);
  
  const Presale = await hre.ethers.getContractFactory("BlazePresale");
  const presale = Presale.attach(presaleAddress);
  
  console.log("Starting presale for 30 days...");
  const tx = await presale.startPresale(30);
  await tx.wait();
  
  console.log("✅ Presale started!\n");
  
  const active = await presale.presaleActive();
  const startTime = await presale.startTime();
  const endTime = await presale.endTime();
  
  console.log("📊 PRESALE STATUS:");
  console.log("- Active:", active);
  console.log("- Start Time:", new Date(Number(startTime) * 1000).toISOString());
  console.log("- End Time:", new Date(Number(endTime) * 1000).toISOString());
  console.log("- Current Time:", new Date().toISOString());
  
  console.log("\n🎉 Presale is LIVE!\n");
}

main();

