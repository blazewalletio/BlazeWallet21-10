const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log('\n💰 YOUR TESTNET BALANCE:\n');
  console.log('Address:', deployer.address);
  console.log('Balance:', hre.ethers.formatEther(balance), 'BNB\n');
  
  if (parseFloat(hre.ethers.formatEther(balance)) < 0.01) {
    console.log('❌ Not enough BNB! Get testnet BNB from:');
    console.log('   https://testnet.bnbchain.org/faucet-smart\n');
  } else {
    console.log('✅ You have enough BNB to deploy!\n');
  }
}

main();
