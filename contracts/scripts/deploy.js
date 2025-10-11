const hre = require("hardhat");

async function main() {
  console.log("🌈 Deploying Arc Token - V4 Enhanced\n");
  console.log("=" .repeat(60));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Set up wallet addresses (REPLACE WITH REAL ADDRESSES FOR PRODUCTION)
  const wallets = {
    publicSale: process.env.PUBLIC_SALE_WALLET || deployer.address,
    founder: process.env.FOUNDER_WALLET || deployer.address,
    community: process.env.COMMUNITY_WALLET || deployer.address,
    treasury: process.env.TREASURY_WALLET || deployer.address,
    team: process.env.TEAM_WALLET || deployer.address,
    strategic: process.env.STRATEGIC_WALLET || deployer.address,
    liquidity: process.env.LIQUIDITY_WALLET || deployer.address,
  };

  console.log("📋 Wallet Configuration:");
  console.log("-".repeat(60));
  console.log("Public Sale:    ", wallets.publicSale);
  console.log("Founder:        ", wallets.founder);
  console.log("Community:      ", wallets.community);
  console.log("Treasury:       ", wallets.treasury);
  console.log("Team:           ", wallets.team);
  console.log("Strategic:      ", wallets.strategic);
  console.log("Liquidity:      ", wallets.liquidity);
  console.log("");

  console.log("🚀 Step 1: Deploying Arc Token Contract...\n");

  // Deploy token
  const ArcToken = await hre.ethers.getContractFactory("ArcToken");
  const arcToken = await ArcToken.deploy(
    wallets.publicSale,
    wallets.founder,
    wallets.community,
    wallets.treasury,
    wallets.team,
    wallets.strategic,
    wallets.liquidity
  );

  await arcToken.waitForDeployment();
  const tokenAddress = await arcToken.getAddress();
  console.log("✅ Arc Token deployed to:", tokenAddress);
  console.log("");

  console.log("🔒 Step 2: Deploying Founder Vesting Contract...\n");

  // Deploy Founder Vesting Contract
  const FounderVesting = await hre.ethers.getContractFactory("FounderVesting");
  const founderVesting = await FounderVesting.deploy(
    tokenAddress,
    wallets.founder
  );
  
  await founderVesting.waitForDeployment();
  const vestingAddress = await founderVesting.getAddress();
  console.log("✅ Founder Vesting deployed to:", vestingAddress);
  console.log("");

  // Display token info
  const name = await arcToken.name();
  const symbol = await arcToken.symbol();
  const totalSupply = await arcToken.totalSupply();
  const decimals = await arcToken.decimals();

  console.log("=" .repeat(60));
  console.log("📊 TOKEN INFORMATION");
  console.log("=" .repeat(60));
  console.log("Name:          ", name);
  console.log("Symbol:        ", symbol);
  console.log("Decimals:      ", decimals.toString());
  console.log("Total Supply:  ", hre.ethers.formatEther(totalSupply), symbol, "(1 Billion)");
  console.log("");

  // Display distribution
  const publicSaleBalance = await arcToken.balanceOf(wallets.publicSale);
  const liquidityBalance = await arcToken.balanceOf(wallets.liquidity);
  const founderBalance = await arcToken.balanceOf(wallets.founder);
  const communityBalance = await arcToken.balanceOf(wallets.community);
  const treasuryBalance = await arcToken.balanceOf(wallets.treasury);
  const teamBalance = await arcToken.balanceOf(wallets.team);
  const strategicBalance = await arcToken.balanceOf(wallets.strategic);

  console.log("=" .repeat(60));
  console.log("💰 TOKEN DISTRIBUTION (V4 Enhanced)");
  console.log("=" .repeat(60));
  console.log("Public Sale:     ", hre.ethers.formatEther(publicSaleBalance), symbol, "(15%)");
  console.log("Liquidity:       ", hre.ethers.formatEther(liquidityBalance), symbol, "(10%)");
  console.log("Founder (Unlock):", hre.ethers.formatEther(founderBalance), symbol, "(10%)");
  console.log("Founder (Vesting): 150,000,000", symbol, "(15%) → Send to vesting contract!");
  console.log("Community:       ", hre.ethers.formatEther(communityBalance), symbol, "(20%)");
  console.log("Treasury:        ", hre.ethers.formatEther(treasuryBalance), symbol, "(15%)");
  console.log("Team:            ", hre.ethers.formatEther(teamBalance), symbol, "(10%)");
  console.log("Strategic:       ", hre.ethers.formatEther(strategicBalance), symbol, "(5%)");
  console.log("");

  console.log("=" .repeat(60));
  console.log("🔥 SPECIAL FEATURES");
  console.log("=" .repeat(60));
  console.log("✅ Built-in Burns: 0.10% per transaction");
  console.log("✅ Staking Rewards: 8-20% APY");
  console.log("✅ Fee Discounts: Up to 75% for holders");
  console.log("✅ Premium Features: Unlock at 1000 ARC");
  console.log("✅ No Anti-Dump: Bitcoin approach (free market)");
  console.log("✅ Deflationary: Supply decreases over time");
  console.log("");

  console.log("=" .repeat(60));
  console.log("📈 CIRCULATING SUPPLY ANALYSIS");
  console.log("=" .repeat(60));
  const publicSale = parseFloat(hre.ethers.formatEther(publicSaleBalance));
  const liquidity = parseFloat(hre.ethers.formatEther(liquidityBalance));
  const founderUnlocked = parseFloat(hre.ethers.formatEther(founderBalance));
  const circulatingSupply = publicSale + liquidity + (founderUnlocked * 0.5); // Assume 50% founder sells
  const circulatingPercent = (circulatingSupply / 1000000000 * 100).toFixed(1);
  
  console.log("Public Sale:     ", publicSale.toFixed(0), "M");
  console.log("Liquidity:       ", liquidity.toFixed(0), "M");
  console.log("Founder (est 50%):", (founderUnlocked * 0.5).toFixed(0), "M");
  console.log("-".repeat(60));
  console.log("Est. Circulating:", circulatingSupply.toFixed(0), "M", `(${circulatingPercent}%)`);
  console.log("");
  console.log("🎯 Target: 30-35% for exchange listings");
  console.log("✅ Binance requires: 30%+");
  console.log("✅ KuCoin requires: 25%+");
  console.log("");

  console.log("=" .repeat(60));
  console.log("⚠️  IMPORTANT NEXT STEPS");
  console.log("=" .repeat(60));
  console.log("");
  console.log("1️⃣  Fund Founder Vesting Contract:");
  console.log("   Transfer 150M ARC to vesting contract:");
  console.log("   Contract address:", vestingAddress);
  console.log("   Amount: 150,000,000 ARC");
  console.log("");
  console.log("2️⃣  Verify Contracts on Etherscan:");
  console.log("   Token:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${tokenAddress} \\`);
  console.log(`     "${wallets.publicSale}" "${wallets.founder}" "${wallets.community}" \\`);
  console.log(`     "${wallets.treasury}" "${wallets.team}" "${wallets.strategic}" "${wallets.liquidity}"`);
  console.log("");
  console.log("   Vesting:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${vestingAddress} \\`);
  console.log(`     "${tokenAddress}" "${wallets.founder}"`);
  console.log("");
  console.log("3️⃣  Add Liquidity on DEXes:");
  console.log("   • Uniswap: 50M ARC + $500k ETH");
  console.log("   • PancakeSwap: 30M ARC + $200k BNB");
  console.log("   • QuickSwap: 20M ARC + $100k MATIC");
  console.log("   Total: 100M ARC + $800k");
  console.log("");
  console.log("4️⃣  Lock Liquidity:");
  console.log("   Use Unicrypt.network to lock LP tokens for 2 years");
  console.log("");
  console.log("5️⃣  Submit to Tracking Sites:");
  console.log("   • CoinGecko: coingecko.com/request-form");
  console.log("   • CoinMarketCap: coinmarketcap.com/request");
  console.log("");
  console.log("6️⃣  Apply to Exchanges:");
  console.log("   • Gate.io ($10-20k)");
  console.log("   • MEXC ($20-30k)");
  console.log("   • KuCoin ($50k)");
  console.log("   • Binance (requires metrics)");
  console.log("");

  console.log("=" .repeat(60));
  console.log("🌈 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Token Address:   ", tokenAddress);
  console.log("Vesting Address: ", vestingAddress);
  console.log("");
  console.log("🚀 Arc Token V4 Enhanced is ready to bend money!");
  console.log("");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      token: tokenAddress,
      vesting: vestingAddress,
    },
    wallets: wallets,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    tokenomics: {
      totalSupply: "1,000,000,000",
      distribution: {
        publicSale: "150M (15%)",
        liquidity: "100M (10%)",
        founderUnlocked: "100M (10%)",
        founderLocked: "150M (15%)",
        community: "200M (20%)",
        treasury: "150M (15%)",
        team: "100M (10%)",
        strategic: "50M (5%)",
      },
      features: {
        burnRate: "0.10% per transaction",
        stakingAPY: "8-20%",
        feeDiscounts: "Up to 75%",
        premiumThreshold: "1000 ARC",
      }
    }
  };

  const filename = `deployment-${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    filename,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`📄 Deployment info saved to: ${filename}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });



