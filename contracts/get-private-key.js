const { ethers } = require('ethers');

// Your recovery phrase
const mnemonic = "minimum account stool aim donor cloud cliff swift ill aspect enable globe";

// Derive wallet from mnemonic
const wallet = ethers.Wallet.fromPhrase(mnemonic);

console.log('\n🔑 YOUR WALLET INFO:\n');
console.log('Address:', wallet.address);
console.log('\n⚠️  PRIVATE KEY (keep this SECRET!):\n');
console.log(wallet.privateKey.slice(2)); // Remove 0x prefix
console.log('\n📋 Copy the private key above (WITHOUT 0x) and paste in .env file!\n');
