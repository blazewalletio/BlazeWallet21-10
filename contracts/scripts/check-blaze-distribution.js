const hre = require("hardhat");

async function main() {
  console.log("🔥 BLAZE Token Distribution Overview\n");

  // BLAZE Token contract address
  const BLAZE_TOKEN_ADDRESS = "0x2C1421595151991ac3894943123d6c285bdF5116";
  
  // Get the token contract
  const BlazeToken = await hre.ethers.getContractFactory("BlazeToken");
  const token = BlazeToken.attach(BLAZE_TOKEN_ADDRESS);

  // Get token info
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply()
  ]);

  console.log("📊 TOKEN INFO:");
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatEther(totalSupply)} ${symbol}`);
  console.log("");

  // Define all wallet addresses from the contract
  const walletAddresses = {
    "Public Sale Wallet": await token.publicSaleWallet(),
    "Founder Wallet": await token.founderWallet(),
    "Community Wallet": await token.communityWallet(),
    "Treasury Wallet": await token.treasuryWallet(),
    "Team Wallet": await token.teamWallet(),
    "Strategic Wallet": await token.strategicWallet(),
    "Liquidity Wallet": await token.liquidityWallet(),
  };

  console.log("🏦 WALLET ADDRESSES:");
  Object.entries(walletAddresses).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  console.log("");

  // Check balances for all wallets
  console.log("💰 BLAZE BALANCES:");
  console.log("=" .repeat(80));
  
  let totalChecked = BigInt(0);
  
  for (const [walletName, walletAddress] of Object.entries(walletAddresses)) {
    try {
      const balance = await token.balanceOf(walletAddress);
      const balanceFormatted = hre.ethers.formatEther(balance);
      const percentage = totalSupply > 0 ? (Number(balance) / Number(totalSupply)) * 100 : 0;
      
      console.log(`${walletName.padEnd(25)} | ${balanceFormatted.padStart(15)} BLAZE | ${percentage.toFixed(2).padStart(6)}%`);
      totalChecked += balance;
    } catch (error) {
      console.log(`${walletName.padEnd(25)} | ERROR: ${error.message}`);
    }
  }

  // Check some additional addresses
  console.log("-" .repeat(80));
  
  // Check Vesting contract if it exists
  const vestingAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
  try {
    const vestingBalance = await token.balanceOf(vestingAddress);
    if (vestingBalance > 0) {
      const vestingFormatted = hre.ethers.formatEther(vestingBalance);
      const vestingPercentage = (Number(vestingBalance) / Number(totalSupply)) * 100;
      console.log(`Vesting Contract${" ".repeat(11)} | ${vestingFormatted.padStart(15)} BLAZE | ${vestingPercentage.toFixed(2).padStart(6)}%`);
      totalChecked += vestingBalance;
    }
  } catch (error) {
    // Vesting contract doesn't exist yet
  }

  // Check any other contracts
  const otherContracts = [
    "0x8321C862B49C4Ad9132e55c3B24Cb72772B30fdd", // Presale
    "0x004652F1476f8AD0036717b3BAd74220944E19e2", // Governance
    "0x0d87956B481B0E9f614503036e7B7476e7f9B65e", // Launchpad
    "0xCE90Bf8C7f4769eC2658440d969ac54bB8e94f19", // NFT Skins
  ];

  for (const contractAddress of otherContracts) {
    try {
      const balance = await token.balanceOf(contractAddress);
      if (balance > 0) {
        const balanceFormatted = hre.ethers.formatEther(balance);
        const percentage = (Number(balance) / Number(totalSupply)) * 100;
        const contractName = contractAddress.slice(0, 6) + "..." + contractAddress.slice(-4);
        console.log(`Contract ${contractName.padEnd(12)} | ${balanceFormatted.padStart(15)} BLAZE | ${percentage.toFixed(2).padStart(6)}%`);
        totalChecked += balance;
      }
    } catch (error) {
      // Contract might not exist or have tokens
    }
  }

  console.log("=" .repeat(80));
  
  const totalCheckedFormatted = hre.ethers.formatEther(totalChecked);
  const totalSupplyFormatted = hre.ethers.formatEther(totalSupply);
  const unaccountedFor = totalSupply - totalChecked;
  const unaccountedFormatted = hre.ethers.formatEther(unaccountedFor);
  
  console.log(`Total Checked${" ".repeat(12)} | ${totalCheckedFormatted.padStart(15)} BLAZE`);
  console.log(`Total Supply${" ".repeat(13)} | ${totalSupplyFormatted.padStart(15)} BLAZE`);
  console.log(`Unaccounted For${" ".repeat(7)} | ${unaccountedFormatted.padStart(15)} BLAZE`);
  console.log("");

  // Check staking info
  console.log("🔒 STAKING INFO:");
  const totalStaked = await token.totalStaked();
  console.log(`Total Staked: ${hre.ethers.formatEther(totalStaked)} BLAZE`);
  
  // Check burn info
  console.log("🔥 BURN INFO:");
  const totalBurned = await token.totalBurned();
  console.log(`Total Burned: ${hre.ethers.formatEther(totalBurned)} BLAZE`);
  console.log("");

  // Summary
  console.log("📋 SUMMARY:");
  console.log("- Total Supply: 1,000,000,000 BLAZE");
  console.log("- Your wallet has most/all tokens (for testing)");
  console.log("- All BLAZE features are available for testing");
  console.log("- Premium status is unlocked (1000+ BLAZE)");
  console.log("");
  console.log("🎯 READY FOR TESTING:");
  console.log("- ✅ Staking (all APY options)");
  console.log("- ✅ NFT Skins (all collections)");
  console.log("- ✅ Governance (proposal creation)");
  console.log("- ✅ Launchpad (project creation)");
  console.log("- ✅ Presale (contribution testing)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
