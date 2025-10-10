const hre = require("hardhat");

async function main() {
  console.log("🔥 Blaze Token - Bootstrap Launch ($500 Budget)\n");
  console.log("=" .repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB\n");

  if (parseFloat(hre.ethers.formatEther(balance)) < 0.1) {
    console.log("⚠️  Warning: Balance might be low for deployment + liquidity");
    console.log("   Recommended: 0.5+ BNB (~$300)\n");
  }

  console.log("🚀 Deploying simplified Blaze Token for bootstrap...\n");

  // For bootstrap: Send everything to deployer initially
  // Then manually distribute after deployment
  const BlazeToken = await hre.ethers.getContractFactory("BlazeToken");
  const blazeToken = await BlazeToken.deploy(
    deployer.address, // publicSale - will receive 100M
    deployer.address, // founder - will receive 100M
    deployer.address, // community - will receive 200M
    deployer.address, // treasury - will receive 150M (main reserve)
    deployer.address, // team - will receive 100M
    deployer.address, // strategic - will receive 50M
    deployer.address  // liquidity - will receive 100M
  );

  await blazeToken.waitForDeployment();
  const tokenAddress = await blazeToken.getAddress();
  
  console.log("✅ Blaze Token deployed to:", tokenAddress);
  console.log("");

  const totalSupply = await blazeToken.totalSupply();
  const deployerBalance = await blazeToken.balanceOf(deployer.address);

  console.log("=" .repeat(60));
  console.log("📊 DEPLOYMENT INFO");
  console.log("=" .repeat(60));
  console.log("Network:       ", hre.network.name);
  console.log("Token Address: ", tokenAddress);
  console.log("Total Supply:  ", hre.ethers.formatEther(totalSupply), "BLAZE");
  console.log("Your Balance:  ", hre.ethers.formatEther(deployerBalance), "BLAZE");
  console.log("");

  console.log("=" .repeat(60));
  console.log("💰 BOOTSTRAP DISTRIBUTION PLAN");
  console.log("=" .repeat(60));
  console.log("Keep in deployer: 850M BLAZE (85%) - Treasury");
  console.log("Prepare for sale: 100M BLAZE (10%) - Public");
  console.log("For liquidity:    50M BLAZE (5%)  - PancakeSwap");
  console.log("");
  console.log("Total in wallet:  1B BLAZE (everything!)");
  console.log("");

  console.log("=" .repeat(60));
  console.log("📋 NEXT STEPS");
  console.log("=" .repeat(60));
  console.log("");
  console.log("1️⃣  Add Contract to BscScan:");
  console.log("   Go to: https://bscscan.com/address/" + tokenAddress);
  console.log("   It will auto-verify if you used standard code");
  console.log("");
  console.log("2️⃣  Add Liquidity on PancakeSwap ($400):");
  console.log("   A. Go to: pancakeswap.finance/add");
  console.log("   B. Select: BNB + Custom Token");
  console.log("   C. Paste BLAZE address:", tokenAddress);
  console.log("   D. Add: 50,000,000 BLAZE + ~$400 worth of BNB");
  console.log("   E. Confirm transaction");
  console.log("");
  console.log("   Price calculation:");
  console.log("   50M BLAZE + $400 BNB = $0.000008 per BLAZE");
  console.log("   Market Cap: ~$400");
  console.log("   FDV: ~$8,000");
  console.log("");
  console.log("3️⃣  Check on Dexscreener (auto-lists):");
  console.log("   https://dexscreener.com/bsc/" + tokenAddress);
  console.log("   (Wait 5-10 minutes after adding liquidity)");
  console.log("");
  console.log("4️⃣  Check on PooCoin:");
  console.log("   https://poocoin.app/tokens/" + tokenAddress);
  console.log("");
  console.log("5️⃣  Announce on Social Media:");
  console.log("   Twitter: 🔥 $BLAZE is LIVE!");
  console.log("   Contract:", tokenAddress);
  console.log("   Buy: pancakeswap.finance");
  console.log("   Chart: dexscreener.com/bsc/" + tokenAddress);
  console.log("");
  console.log("6️⃣  Lock Liquidity (when you have budget):");
  console.log("   Go to: https://www.pinksale.finance/pinklock");
  console.log("   Cost: ~$100");
  console.log("   Duration: 1-2 years");
  console.log("");

  console.log("=" .repeat(60));
  console.log("💡 BOOTSTRAP TIPS");
  console.log("=" .repeat(60));
  console.log("");
  console.log("✅ Start with $400 liquidity (enough!)");
  console.log("✅ No audit yet (add later when you have $)");
  console.log("✅ Focus on community building (free!)");
  console.log("✅ Add more liquidity as price grows");
  console.log("✅ Be transparent about bootstrap approach");
  console.log("");
  console.log("Marketing (Free):");
  console.log("• Twitter/X daily posts");
  console.log("• Reddit: r/CryptoMoonShots, r/BSCGems");
  console.log("• Telegram group (be active!)");
  console.log("• Engage with community");
  console.log("");

  console.log("=" .repeat(60));
  console.log("🌈 LAUNCH COMPLETE!");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Token is live! Now build the community! 🚀");
  console.log("");
  console.log("Remember:");
  console.log("• Start small, grow big");
  console.log("• Community is everything");
  console.log("• Be transparent");
  console.log("• Reinvest profits into project");
  console.log("");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    tokenAddress: tokenAddress,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    links: {
      bscscan: `https://bscscan.com/address/${tokenAddress}`,
      pancakeswap: `https://pancakeswap.finance/swap?outputCurrency=${tokenAddress}`,
      dexscreener: `https://dexscreener.com/bsc/${tokenAddress}`,
      poocoin: `https://poocoin.app/tokens/${tokenAddress}`,
    },
    bootstrap: {
      totalSupply: "1,000,000,000 BLAZE",
      deployerBalance: "1,000,000,000 BLAZE",
      recommendedLiquidity: "50M BLAZE + $400 BNB",
      initialPrice: "$0.000008 per BLAZE",
      initialMarketCap: "$400",
      initialFDV: "$8,000",
    }
  };

  const filename = `deployment-bootstrap-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment saved to: ${filename}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

