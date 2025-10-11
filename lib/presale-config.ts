export const PRESALE_CONFIG = {
  // BSC TESTNET (voor testen)
  testnet: {
    chainId: 97,
    presaleAddress: '0x8321C862B49C4Ad9132e55c3B24Cb72772B30fdd',
    tokenAddress: '0x2C1421595151991ac3894943123d6c285bdF5116',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
  },
  
  // BSC MAINNET (voor echte launch)
  mainnet: {
    chainId: 56,
    presaleAddress: '', // Fill in after deployment
    tokenAddress: '', // Fill in after deployment
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com',
  },
};

// Current environment - CHANGE THIS WHEN GOING TO MAINNET!
export const CURRENT_PRESALE = PRESALE_CONFIG.testnet; // Change to .mainnet for production

// Presale constants
export const PRESALE_CONSTANTS = {
  hardCap: 500000, // $500k
  softCap: 100000, // $100k
  minContribution: 100, // $100
  maxContribution: 10000, // $10,000
  tokenPrice: 0.00417, // $0.00417 per BLAZE
  launchPrice: 0.01, // $0.01 per BLAZE (2.4x gain)
  tokensForSale: 120000000, // 120M BLAZE
};





