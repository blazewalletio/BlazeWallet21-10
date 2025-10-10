// Test script to simulate frontend presale data fetching
const { ethers } = require('ethers');

async function testPresaleData() {
  console.log('\n🧪 TESTING PRESALE DATA FETCHING...\n');
  
  // BSC Testnet RPC
  const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
  
  // Presale contract address
  const presaleAddress = '0xf1898f9d831e3bEbC137e006914205810cD09935';
  
  // Presale ABI (simplified)
  const presaleABI = [
    'function getPresaleInfo() external view returns (bool active, bool finalized, uint256 raised, uint256 tokensSold, uint256 participantCount, uint256 timeRemaining)'
  ];
  
  try {
    const presaleContract = new ethers.Contract(presaleAddress, presaleABI, provider);
    
    console.log('📡 Fetching data from contract...');
    const info = await presaleContract.getPresaleInfo();
    
    console.log('📊 RAW CONTRACT DATA:');
    console.log('- Active:', info.active);
    console.log('- Finalized:', info.finalized);
    console.log('- Raised (wei):', info.raised.toString());
    console.log('- Raised (BNB):', ethers.formatEther(info.raised));
    console.log('- Tokens Sold (wei):', info.tokensSold.toString());
    console.log('- Tokens Sold (BLAZE):', ethers.formatUnits(info.tokensSold, 18));
    console.log('- Participants:', info.participantCount.toString());
    console.log('- Time Remaining (seconds):', info.timeRemaining.toString());
    console.log('- Time Remaining (days):', Number(info.timeRemaining) / (24 * 60 * 60));
    console.log('- Time Remaining (ms):', Number(info.timeRemaining) * 1000);
    
    // Test time formatting
    const timeRemainingMs = Number(info.timeRemaining) * 1000;
    const days = Math.floor(timeRemainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const formattedTime = `${days}d ${hours}h`;
    
    console.log('\n⏰ TIME FORMATTING TEST:');
    console.log('- Input (ms):', timeRemainingMs);
    console.log('- Days:', days);
    console.log('- Hours:', hours);
    console.log('- Formatted:', formattedTime);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPresaleData();
