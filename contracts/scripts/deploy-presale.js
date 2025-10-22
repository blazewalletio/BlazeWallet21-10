const hre = require("hardhat");

async function main() {
  console.log("\n🔥 BLAZE TOKEN PRESALE DEPLOYMENT\n");
  console.log("=" + "=".repeat(50));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB\n");

  // CONFIGURATION
  const config = {
    // Liquidity wallet - will receive 60% of presale funds
    liquidityWallet: deployer.address, // Change to liquidity wallet address
    
    // Operational wallet - will receive 40% of presale funds
    operationalWallet: deployer.address, // Change to operational wallet address
    
    // USDT wallet - will receive all USDT presale funds
    usdtWallet: "0x4d8eE58154eA6AFCdb52cB1B955A6dabf0A6E289", // USDT presale funds wallet
    
    // Wallets for token distribution
    presaleContract: "0x0000000000000000000000000000000000000000", // Will be set after presale deployment
    founderImmediateWallet: deployer.address,
    founderVestingWallet: deployer.address, // Contract holds tokens, releases to this address
    communityWallet: deployer.address,
    treasuryWallet: deployer.address,
    teamWallet: deployer.address,
    strategicWallet: deployer.address,
  };

  console.log("📋 WALLET CONFIGURATION:");
  console.log("- Liquidity Wallet:", config.liquidityWallet);
  console.log("- Operational Wallet:", config.operationalWallet);
  console.log("- USDT Wallet:", config.usdtWallet);
  console.log("- Founder Immediate:", config.founderImmediateWallet);
  console.log("- Founder Vesting:", config.founderVestingWallet);
  console.log("\n");

  // Step 1: Deploy Presale Contract
  console.log("Step 1: Deploying Presale Contract...");
  const BlazePresale = await hre.ethers.getContractFactory("BlazePresale");
  const presale = await BlazePresale.deploy(
    config.liquidityWallet,
    config.operationalWallet,
    config.usdtWallet
  );
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("✅ Presale Contract deployed to:", presaleAddress);

  // Update config with presale address
  config.presaleContract = presaleAddress;

  // Step 2: Deploy Token Contract
  console.log("\nStep 2: Deploying BLAZE Token...");
  const BlazeToken = await hre.ethers.getContractFactory("BlazeTokenPresale");
  const token = await BlazeToken.deploy(
    config.presaleContract,
    config.liquidityWallet,
    config.founderImmediateWallet,
    config.founderVestingWallet,
    config.communityWallet,
    config.treasuryWallet,
    config.teamWallet,
    config.strategicWallet
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ BLAZE Token deployed to:", tokenAddress);

  // Step 3: Link Token to Presale
  console.log("\nStep 3: Linking Token to Presale...");
  const setTokenTx = await presale.setTokenAddress(tokenAddress);
  await setTokenTx.wait();
  console.log("✅ Token linked to presale");

  // Step 4: Start Presale (optional - can be done later via UI)
  const shouldStartNow = false; // Set to true to start immediately
  
  if (shouldStartNow) {
    console.log("\nStep 4: Starting Presale...");
    const durationInDays = 30; // 30 days
    const startTx = await presale.startPresale(durationInDays);
    await startTx.wait();
    console.log(`✅ Presale started for ${durationInDays} days`);
  } else {
    console.log("\nℹ️  Presale NOT started yet. Start it manually when ready.");
  }

  // Display Summary
  console.log("\n");
  console.log("=" + "=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" + "=".repeat(50));
  console.log("\n📝 CONTRACT ADDRESSES:");
  console.log("  BLAZE Token:", tokenAddress);
  console.log("  Presale Contract:", presaleAddress);
  
  console.log("\n💰 TOKENOMICS (1 Billion BLAZE):");
  console.log("  - 12% Presale (120M) → In presale contract");
  console.log("  - 18% Liquidity (180M) → Liquidity wallet");
  console.log("  - 8% Founder Immediate (80M) → Your wallet");
  console.log("  - 12% Founder Vesting (120M) → Locked in token contract");
  console.log("  - 20% Community (200M) → Community wallet");
  console.log("  - 15% Treasury (150M) → Treasury wallet");
  console.log("  - 10% Team (100M) → Team wallet");
  console.log("  - 5% Strategic (50M) → Strategic wallet");

  console.log("\n🚀 PRESALE DETAILS:");
  console.log("  - Target: $1,000,000");
  console.log("  - Tokens for sale: 120M BLAZE");
  console.log("  - Price: $0.008333 per BLAZE");
  console.log("  - Launch Price: $0.02 per BLAZE");
  console.log("  - Min: $100 | Max: $10,000 per wallet");
  
  console.log("\n💸 FUND DISTRIBUTION:");
  console.log("  - 60% → Liquidity (Locked)");
  console.log("  - 40% → Operational Budget");

  console.log("\n🔐 VESTING:");
  console.log("  - Duration: 6 months (180 days)");
  console.log("  - Type: Linear vesting");
  console.log("  - Daily unlock: ~666,666 BLAZE");

  console.log("\n📌 NEXT STEPS:");
  console.log("  1. Verify contracts on BscScan");
  console.log("  2. Start presale: presale.startPresale(30)");
  console.log("  3. Update frontend with contract addresses");
  console.log("  4. Test contribution flow");
  console.log("  5. Monitor presale progress");
  
  console.log("\n💻 VERIFY COMMAND:");
  console.log(`  npx hardhat verify --network bsc ${tokenAddress} ${config.presaleContract} ${config.liquidityWallet} ${config.founderImmediateWallet} ${config.founderVestingWallet} ${config.communityWallet} ${config.treasuryWallet} ${config.teamWallet} ${config.strategicWallet}`);
  console.log(`  npx hardhat verify --network bsc ${presaleAddress} ${config.liquidityWallet} ${config.operationalWallet} ${config.usdtWallet}`);
  
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

