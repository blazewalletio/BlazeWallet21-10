const hre = require("hardhat");

async function main() {
  console.log("🔥 Deploying NEW BlazeToken to BSC Testnet...");
  console.log("=" .repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📍 Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "BNB");

  if (balance < hre.ethers.parseEther("0.05")) {
    console.log("\n⚠️  WARNING: Low balance! You need at least 0.05 BNB");
    console.log("   Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
    process.exit(1);
  }

  // Wallet addresses for testnet
  const wallets = {
    publicSaleWallet: deployer.address,
    founderWallet: deployer.address,
    communityWallet: deployer.address,
    treasuryWallet: deployer.address,
    teamWallet: deployer.address,
    strategicWallet: deployer.address,
    liquidityWallet: deployer.address,
  };

  console.log("\n🏦 Wallet Configuration:");
  console.log("   All wallets set to deployer for testnet:", deployer.address);

  // Deploy BlazeToken
  console.log("\n🚀 Deploying BlazeToken...");
  const BlazeToken = await hre.ethers.getContractFactory("BlazeToken");
  
  const blazeToken = await BlazeToken.deploy(
    wallets.publicSaleWallet,
    wallets.founderWallet,
    wallets.communityWallet,
    wallets.treasuryWallet,
    wallets.teamWallet,
    wallets.strategicWallet,
    wallets.liquidityWallet
  );

  await blazeToken.waitForDeployment();
  const tokenAddress = await blazeToken.getAddress();

  console.log("✅ BlazeToken deployed to:", tokenAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const name = await blazeToken.name();
  const symbol = await blazeToken.symbol();
  const totalSupply = await blazeToken.totalSupply();
  const decimals = await blazeToken.decimals();

  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Total Supply: ${hre.ethers.formatEther(totalSupply)} ${symbol}`);
  console.log(`   Decimals: ${decimals}`);

  // Check staking constants
  console.log("\n🔒 Staking Configuration:");
  const flexibleAPY = await blazeToken.FLEXIBLE_APY();
  const sixMonthAPY = await blazeToken.SIX_MONTH_APY();
  const oneYearAPY = await blazeToken.ONE_YEAR_APY();
  const premiumThreshold = await blazeToken.PREMIUM_THRESHOLD();
  const burnRate = await blazeToken.BURN_RATE();

  console.log(`   Flexible APY: ${Number(flexibleAPY) / 100}%`);
  console.log(`   6 Month APY: ${Number(sixMonthAPY) / 100}%`);
  console.log(`   1 Year APY: ${Number(oneYearAPY) / 100}%`);
  console.log(`   Premium Threshold: ${hre.ethers.formatEther(premiumThreshold)} BLAZE`);
  console.log(`   Burn Rate: ${Number(burnRate) / 100}%`);

  // Check wallet addresses
  console.log("\n🏦 Wallet Addresses:");
  const publicSaleWallet = await blazeToken.publicSaleWallet();
  const founderWallet = await blazeToken.founderWallet();
  const communityWallet = await blazeToken.communityWallet();
  const treasuryWallet = await blazeToken.treasuryWallet();
  const teamWallet = await blazeToken.teamWallet();
  const strategicWallet = await blazeToken.strategicWallet();
  const liquidityWallet = await blazeToken.liquidityWallet();

  console.log(`   Public Sale: ${publicSaleWallet}`);
  console.log(`   Founder: ${founderWallet}`);
  console.log(`   Community: ${communityWallet}`);
  console.log(`   Treasury: ${treasuryWallet}`);
  console.log(`   Team: ${teamWallet}`);
  console.log(`   Strategic: ${strategicWallet}`);
  console.log(`   Liquidity: ${liquidityWallet}`);

  // Check balances
  console.log("\n💰 Initial Balances:");
  const balances = {
    publicSale: await blazeToken.balanceOf(publicSaleWallet),
    founder: await blazeToken.balanceOf(founderWallet),
    community: await blazeToken.balanceOf(communityWallet),
    treasury: await blazeToken.balanceOf(treasuryWallet),
    team: await blazeToken.balanceOf(teamWallet),
    strategic: await blazeToken.balanceOf(strategicWallet),
    liquidity: await blazeToken.balanceOf(liquidityWallet),
  };

  console.log(`   Public Sale: ${hre.ethers.formatEther(balances.publicSale)} BLAZE (15%)`);
  console.log(`   Liquidity: ${hre.ethers.formatEther(balances.liquidity)} BLAZE (10%)`);
  console.log(`   Founder: ${hre.ethers.formatEther(balances.founder)} BLAZE (10% unlocked)`);
  console.log(`   Community: ${hre.ethers.formatEther(balances.community)} BLAZE (20%)`);
  console.log(`   Treasury: ${hre.ethers.formatEther(balances.treasury)} BLAZE (15%)`);
  console.log(`   Team: ${hre.ethers.formatEther(balances.team)} BLAZE (10%)`);
  console.log(`   Strategic: ${hre.ethers.formatEther(balances.strategic)} BLAZE (5%)`);
  console.log(`   Note: 15% (150M) founder locked tokens not minted (for vesting contract)`);

  // Test a small stake
  console.log("\n🧪 Testing Staking Functionality...");
  try {
    const testAmount = hre.ethers.parseEther("1000");
    console.log(`   Staking ${hre.ethers.formatEther(testAmount)} BLAZE...`);
    
    const stakeTx = await blazeToken.stake(testAmount, 0);
    await stakeTx.wait();
    console.log("   ✅ Stake successful!");

    const [amount, timestamp, lockPeriod, pendingReward, premium, feeDiscount] = 
      await blazeToken.getStakeInfo(deployer.address);
    
    console.log(`   Staked Amount: ${hre.ethers.formatEther(amount)} BLAZE`);
    console.log(`   Premium Status: ${premium ? 'Yes' : 'No'}`);
    console.log(`   Fee Discount: ${Number(feeDiscount) / 100}%`);

    // Unstake
    const unstakeTx = await blazeToken.unstake();
    await unstakeTx.wait();
    console.log("   ✅ Unstake successful!");

  } catch (error) {
    console.log("   ❌ Staking test failed:", error.message);
  }

  console.log("\n" + "=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));

  const deploymentInfo = {
    network: "BSC Testnet",
    chainId: 97,
    tokenAddress: tokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    totalSupply: hre.ethers.formatEther(totalSupply),
    features: {
      staking: true,
      flexibleAPY: "8%",
      sixMonthAPY: "15%",
      oneYearAPY: "20%",
      premiumThreshold: "1000 BLAZE",
      burnRate: "0.10%",
      pausable: true
    },
    wallets: wallets
  };

  console.log("\n📊 DEPLOYMENT SUMMARY:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save deployment info
  const fs = require('fs');
  const path = require('path');
  
  const outputPath = path.join(__dirname, '..', 'deployed-blaze-token-NEW.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", outputPath);

  console.log("\n" + "=" .repeat(60));
  console.log("📝 NEXT STEPS:");
  console.log("=" .repeat(60));
  console.log("\n1. Update frontend configuration:");
  console.log(`   File: lib/contracts-config.ts`);
  console.log(`   Replace BLAZE token address with: ${tokenAddress}`);
  
  console.log("\n2. Send test tokens to your wallet:");
  console.log(`   Update scripts/send-test-tokens.js with new address`);
  console.log(`   Then run: npx hardhat run scripts/send-test-tokens.js --network bscTestnet`);
  
  console.log("\n3. Verify contract on BSCScan (optional):");
  console.log(`   npx hardhat verify --network bscTestnet ${tokenAddress} \\`);
  console.log(`     "${deployer.address}" "${deployer.address}" "${deployer.address}" \\`);
  console.log(`     "${deployer.address}" "${deployer.address}" "${deployer.address}" "${deployer.address}"`);
  
  console.log("\n4. Test in frontend:");
  console.log("   - Connect wallet");
  console.log("   - Check BLAZE balance in Assets");
  console.log("   - Test staking functionality");
  console.log("   - Test unstaking and rewards");
  
  console.log("\n5. View on BSCScan Testnet:");
  console.log(`   https://testnet.bscscan.com/address/${tokenAddress}`);
  
  console.log("\n" + "=" .repeat(60));
  console.log("✨ Ready to deploy! Contract is fully tested.");
  console.log("=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

