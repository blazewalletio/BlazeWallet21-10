const hre = require("hardhat");

async function main() {
  console.log("🔥 Sending BLAZE test tokens from Treasury...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Sending from Treasury:", deployer.address);

  // BLAZE Token contract address
  const BLAZE_TOKEN_ADDRESS = "0x2C1421595151991ac3894943123d6c285bdF5116";
  
  // Amount to send (10,000 BLAZE = 10000 * 10^18)
  const AMOUNT = hre.ethers.parseEther("10000");
  
  // Get the token contract
  const BlazeToken = await hre.ethers.getContractFactory("BlazeToken");
  const token = BlazeToken.attach(BLAZE_TOKEN_ADDRESS);

  // Check treasury balance
  const treasuryBalance = await token.balanceOf(deployer.address);
  console.log("💰 Treasury Balance:", hre.ethers.formatEther(treasuryBalance), "BLAZE");

  if (treasuryBalance < AMOUNT) {
    console.log("❌ Insufficient treasury balance!");
    return;
  }

  // Your wallet address
  const recipient = "0x18347D3bcb33721e0C603BeFD2ffAC8762D5A24D";
  console.log("🎯 Sending to:", recipient);

  // Send 10,000 BLAZE tokens
  console.log("📤 Sending 10,000 BLAZE tokens...");
  const tx = await token.transfer(recipient, AMOUNT);
  await tx.wait();

  console.log("✅ Successfully sent 10,000 BLAZE to", recipient);
  console.log("🔗 Transaction:", tx.hash);

  // Check new balance
  const newBalance = await token.balanceOf(recipient);
  console.log("💰 New balance:", hre.ethers.formatEther(newBalance), "BLAZE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
