export const PRESALE_CONFIG = {
  // BSC TESTNET (voor testen)
  testnet: {
    chainId: 97,
    presaleAddress: '0xf1898f9d831e3bEbC137e006914205810cD09935',
    tokenAddress: '0x336063dE7E7FB365C40dd3f9Cc7FDa52B75b8Cad',
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

