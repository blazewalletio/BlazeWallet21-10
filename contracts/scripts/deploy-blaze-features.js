const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting BLAZE Features Deployment to BSC Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "BNB\n");

  if (balance < hre.ethers.parseEther("0.1")) {
    console.log("⚠️  WARNING: Low balance! Get testnet BNB from:");
    console.log("   https://testnet.bnbchain.org/faucet-smart\n");
  }

  // Existing BLAZE token address on testnet
  const BLAZE_TOKEN_ADDRESS = "0x2C1421595151991ac3894943123d6c285bdF5116";
  console.log("🔥 Using existing BLAZE Token:", BLAZE_TOKEN_ADDRESS, "\n");

  // Treasury wallet (where fees go)
  const TREASURY_WALLET = deployer.address; // Can change this later
  console.log("💼 Treasury Wallet:", TREASURY_WALLET, "\n");

  const deployedContracts = {
    network: "BSC Testnet (97)",
    blazeToken: BLAZE_TOKEN_ADDRESS,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  // ============================================
  // 1. Deploy BlazeGovernance
  // ============================================
  console.log("📜 Deploying BlazeGovernance...");
  const BlazeGovernance = await hre.ethers.getContractFactory("BlazeGovernance");
  const governance = await BlazeGovernance.deploy(BLAZE_TOKEN_ADDRESS);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  
  console.log("✅ BlazeGovernance deployed:", governanceAddress);
  deployedContracts.governance = governanceAddress;
  
  // Verify basic info
  const proposalThreshold = await governance.PROPOSAL_THRESHOLD();
  console.log("   - Proposal Threshold:", hre.ethers.formatEther(proposalThreshold), "BLAZE");
  console.log("   - Voting Period: 7 days");
  console.log("   - Quorum: 51%\n");

  // ============================================
  // 2. Deploy BlazeChainLaunchpad
  // ============================================
  console.log("🚀 Deploying BlazeChainLaunchpad...");
  const BlazeChainLaunchpad = await hre.ethers.getContractFactory("BlazeChainLaunchpad");
  const launchpad = await BlazeChainLaunchpad.deploy(BLAZE_TOKEN_ADDRESS, TREASURY_WALLET);
  await launchpad.waitForDeployment();
  const launchpadAddress = await launchpad.getAddress();
  
  console.log("✅ BlazeChainLaunchpad deployed:", launchpadAddress);
  deployedContracts.launchpad = launchpadAddress;
  
  // Verify basic info
  const platformFee = await launchpad.PLATFORM_FEE();
  const earlyAccessThreshold = await launchpad.EARLY_ACCESS_THRESHOLD();
  console.log("   - Platform Fee:", Number(platformFee) / 100, "%");
  console.log("   - Early Access:", hre.ethers.formatEther(earlyAccessThreshold), "BLAZE");
  console.log("   - Early Access Duration: 1 hour\n");

  // ============================================
  // 3. Deploy BlazeWalletSkins (NFT)
  // ============================================
  console.log("🎨 Deploying BlazeWalletSkins...");
  const BlazeWalletSkins = await hre.ethers.getContractFactory("BlazeWalletSkins");
  const skins = await BlazeWalletSkins.deploy(BLAZE_TOKEN_ADDRESS, TREASURY_WALLET);
  await skins.waitForDeployment();
  const skinsAddress = await skins.getAddress();
  
  console.log("✅ BlazeWalletSkins deployed:", skinsAddress);
  deployedContracts.skins = skinsAddress;
  
  // Verify basic info
  const premiumThreshold = await skins.PREMIUM_THRESHOLD();
  const premiumDiscount = await skins.PREMIUM_DISCOUNT();
  console.log("   - Name:", await skins.name());
  console.log("   - Symbol:", await skins.symbol());
  console.log("   - Premium Threshold:", hre.ethers.formatEther(premiumThreshold), "BLAZE");
  console.log("   - Premium Discount:", Number(premiumDiscount), "%\n");

  // ============================================
  // 4. Create Initial NFT Collections (Optional)
  // ============================================
  console.log("🎨 Creating initial NFT collections...");
  
  try {
    // Collection 1: Neon Dreams (Common)
    const tx1 = await skins.createCollection(
      "Neon Dreams",
      "Vibrant neon-themed wallet interface",
      0, // SkinRarity.Common
      hre.ethers.parseEther("100"), // 100 BLAZE
      100, // Max supply
      "ipfs://QmNeonDreams" // Replace with real IPFS hash
    );
    await tx1.wait();
    console.log("   ✅ Collection 1: Neon Dreams (100 BLAZE)");

    // Collection 2: Galaxy Wave (Rare)
    const tx2 = await skins.createCollection(
      "Galaxy Wave",
      "Cosmic galaxy-themed wallet design",
      1, // SkinRarity.Rare
      hre.ethers.parseEther("500"), // 500 BLAZE
      50, // Max supply
      "ipfs://QmGalaxyWave"
    );
    await tx2.wait();
    console.log("   ✅ Collection 2: Galaxy Wave (500 BLAZE)");

    // Collection 3: Diamond Elite (Legendary)
    const tx3 = await skins.createCollection(
      "Diamond Elite",
      "Ultra-premium diamond-themed interface",
      3, // SkinRarity.Legendary
      hre.ethers.parseEther("2000"), // 2000 BLAZE
      10, // Max supply (limited!)
      "ipfs://QmDiamondElite"
    );
    await tx3.wait();
    console.log("   ✅ Collection 3: Diamond Elite (2000 BLAZE)\n");
  } catch (error) {
    console.log("   ⚠️  Could not create collections (may need to do manually)");
    console.log("   Error:", error.message, "\n");
  }

  // ============================================
  // Summary
  // ============================================
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📊 DEPLOYED CONTRACT ADDRESSES:\n");
  console.log("Network:         BSC Testnet (Chain ID: 97)");
  console.log("BLAZE Token:     " + BLAZE_TOKEN_ADDRESS);
  console.log("Governance:      " + governanceAddress);
  console.log("Launchpad:       " + launchpadAddress);
  console.log("NFT Skins:       " + skinsAddress);
  console.log("Treasury:        " + TREASURY_WALLET);
  console.log("\n" + "=".repeat(60));

  // Save to file
  const outputPath = path.join(__dirname, '../deployed-addresses.json');
  fs.writeFileSync(outputPath, JSON.stringify(deployedContracts, null, 2));
  console.log("\n💾 Addresses saved to:", outputPath);

  // ============================================
  // Next Steps
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("📝 NEXT STEPS:");
  console.log("=".repeat(60));
  console.log("\n1. Verify contracts on BSCScan:");
  console.log("   npx hardhat verify --network bscTestnet", governanceAddress, BLAZE_TOKEN_ADDRESS);
  console.log("   npx hardhat verify --network bscTestnet", launchpadAddress, BLAZE_TOKEN_ADDRESS, TREASURY_WALLET);
  console.log("   npx hardhat verify --network bscTestnet", skinsAddress, BLAZE_TOKEN_ADDRESS, TREASURY_WALLET);
  
  console.log("\n2. Update frontend config files:");
  console.log("   - Add addresses to lib/contracts-config.ts");
  console.log("   - Update .env with new addresses");
  
  console.log("\n3. Test contracts:");
  console.log("   - Create a test proposal in Governance");
  console.log("   - Create a test project in Launchpad");
  console.log("   - Mint a test NFT skin");
  
  console.log("\n4. View on BSCScan Testnet:");
  console.log("   https://testnet.bscscan.com/address/" + governanceAddress);
  console.log("   https://testnet.bscscan.com/address/" + launchpadAddress);
  console.log("   https://testnet.bscscan.com/address/" + skinsAddress);
  
  console.log("\n" + "=".repeat(60));
  console.log("✨ All features are now live on testnet!");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  });

