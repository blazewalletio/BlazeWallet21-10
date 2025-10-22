// Transak integration for fiat on-ramp
// Docs: https://docs.transak.com/
// Superior fiat-to-crypto solution with automatic wallet delivery

export interface TransakConfig {
  walletAddress: string;
  walletAddresses?: { [key: string]: string }; // Multi-chain wallet addresses
  currencyCode?: string; // e.g., 'ETH', 'SOL', 'MATIC'
  baseCurrencyCode?: string; // e.g., 'EUR', 'USD', 'GBP'
  apiKey?: string; // Partner API key
  environment?: 'STAGING' | 'PRODUCTION';
  themeColor?: string; // Custom theme color
  disableWalletAddressForm?: boolean; // Hide wallet address input
  hideMenu?: boolean; // Hide Transak menu
  isAutoFillUserData?: boolean; // Auto-fill user data
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
  };
}

export class TransakService {
  private static readonly TRANSAK_URL = 'https://global.transak.com';
  private static readonly TRANSAK_STAGING_URL = 'https://global-stg.transak.com';

  // Get supported assets by chain
  static getSupportedAssets(chainId: number): string[] {
    const assetMap: Record<number, string[]> = {
      1: ['ETH', 'USDT', 'USDC', 'DAI', 'WBTC', 'LINK'], // Ethereum
      137: ['MATIC', 'USDT', 'USDC'], // Polygon
      56: ['BNB', 'USDT', 'BUSD'], // BSC
      42161: ['ETH', 'USDT'], // Arbitrum
      10: ['ETH'], // Optimism
      8453: ['ETH'], // Base
      11155111: ['ETH'], // Sepolia
      101: ['SOL', 'USDC', 'USDT'], // Solana
    };

    return assetMap[chainId] || [];
  }

  // Open Transak widget in new window
  static openWidget(config: TransakConfig) {
    const baseUrl = config.environment === 'PRODUCTION' 
      ? this.TRANSAK_URL 
      : this.TRANSAK_STAGING_URL;

    const apiKey = config.apiKey || process.env.NEXT_PUBLIC_TRANSAK_API_KEY || '55950bec-d22c-4d0a-937e-7bff2cb26296';
    
    // DEBUG: Log all configuration details
    console.log('🔥 TRANSAK DEBUG INFO:');
    console.log('Environment:', config.environment || 'PRODUCTION');
    console.log('Base URL:', baseUrl);
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');
    console.log('Wallet Address:', config.walletAddress);
    console.log('Currency Code:', config.currencyCode);
    console.log('Base Currency:', config.baseCurrencyCode);
    console.log('Theme Color:', config.themeColor);
    console.log('Network:', this.getTransakNetwork(config.currencyCode));

    const params = new URLSearchParams({
      apiKey: apiKey,
      walletAddress: config.walletAddress,
      ...(config.currencyCode && { cryptoCurrencyCode: config.currencyCode }),
      ...(config.baseCurrencyCode && { fiatCurrency: config.baseCurrencyCode }),
      ...(config.themeColor && { themeColor: config.themeColor.replace('#', '') }),
      ...(config.disableWalletAddressForm && { disableWalletAddressForm: 'true' }),
      ...(config.hideMenu && { hideMenu: 'true' }),
      ...(config.isAutoFillUserData && { isAutoFillUserData: 'true' }),
      ...(config.userData?.firstName && { userData: JSON.stringify(config.userData) }),
      // Multi-chain wallet addresses
      ...(config.walletAddresses && { walletAddresses: JSON.stringify(config.walletAddresses) }),
      // Additional Transak parameters
      exchangeScreenTitle: 'Buy Crypto with Blaze Wallet',
      defaultCryptoCurrency: config.currencyCode || 'ETH',
      defaultFiatCurrency: config.baseCurrencyCode || 'EUR',
      network: this.getTransakNetwork(config.currencyCode),
    });

    const url = `${baseUrl}?${params.toString()}`;
    
    // DEBUG: Log the final URL (without API key for security)
    console.log('Final Transak URL:', url.replace(apiKey, '***API_KEY***'));
    console.log('Opening Transak widget...');

    // Open in new tab - most reliable method
    const width = 500;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      url,
      'transak',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    // DEBUG: Check if popup opened successfully
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      console.error('❌ TRANSAK ERROR: Popup blocked! Please allow popups for this site.');
    } else {
      console.log('✅ TRANSAK SUCCESS: Popup opened successfully');
    }
  }

  // Get currency code from chain and token symbol
  static getCurrencyCode(chainId: number, symbol: string): string {
    // Map common tokens to Transak currency codes
    const codeMap: Record<string, string> = {
      // Ethereum
      'ETH': 'ETH',
      'USDT': 'USDT',
      'USDC': 'USDC',
      'DAI': 'DAI',
      'WBTC': 'WBTC',
      'LINK': 'LINK',
      // Polygon
      'MATIC': 'MATIC',
      // BSC
      'BNB': 'BNB',
      'BUSD': 'BUSD',
      // Solana
      'SOL': 'SOL',
    };

    // For native currencies
    if (chainId === 1 && symbol === 'ETH') return 'ETH';
    if (chainId === 137 && symbol === 'MATIC') return 'MATIC';
    if (chainId === 56 && symbol === 'BNB') return 'BNB';
    if (chainId === 42161 && symbol === 'ETH') return 'ETH';
    if (chainId === 10 && symbol === 'ETH') return 'ETH';
    if (chainId === 8453 && symbol === 'ETH') return 'ETH';
    if (chainId === 101 && symbol === 'SOL') return 'SOL';

    return codeMap[symbol] || 'ETH';
  }

  // Get display name for currency code
  static getDisplayName(currencyCode: string): string {
    const nameMap: Record<string, string> = {
      'ETH': 'Ethereum',
      'USDT': 'USDT',
      'USDC': 'USDC',
      'DAI': 'DAI',
      'MATIC': 'Polygon',
      'BNB': 'BNB',
      'BUSD': 'BUSD',
      'SOL': 'Solana',
      'WBTC': 'Wrapped Bitcoin',
      'LINK': 'Chainlink',
    };

    return nameMap[currencyCode] || currencyCode;
  }

  // Get chain ID from currency code
  static getChainId(currencyCode: string): number {
    const chainMap: Record<string, number> = {
      'ETH': 1,
      'USDT': 1,
      'USDC': 1,
      'DAI': 1,
      'WBTC': 1,
      'LINK': 1,
      'MATIC': 137,
      'BNB': 56,
      'BUSD': 56,
      'SOL': 101,
    };

    return chainMap[currencyCode] || 1;
  }

  // Create multi-chain wallet addresses object
  static createWalletAddresses(primaryAddress: string, chainId: number): { [key: string]: string } {
    const addresses: { [key: string]: string } = {};
    
    // Add primary address for current chain
    const currencyCode = this.getCurrencyCode(chainId, 'ETH'); // Default to ETH for EVM chains
    addresses[currencyCode] = primaryAddress;
    
    // For Solana, we need to handle differently
    if (chainId === 101) {
      addresses['SOL'] = primaryAddress;
    }
    
    return addresses;
  }

  // Get Transak network parameter
  static getTransakNetwork(currencyCode?: string): string {
    if (!currencyCode) return 'ethereum';
    
    const networkMap: Record<string, string> = {
      'ETH': 'ethereum',
      'USDT': 'ethereum',
      'USDC': 'ethereum',
      'DAI': 'ethereum',
      'WBTC': 'ethereum',
      'LINK': 'ethereum',
      'MATIC': 'polygon',
      'BNB': 'bsc',
      'BUSD': 'bsc',
      'SOL': 'solana',
    };

    return networkMap[currencyCode] || 'ethereum';
  }

  // Validate wallet address format
  static validateWalletAddress(address: string, currencyCode: string): boolean {
    switch (currencyCode) {
      case 'ETH':
      case 'USDT':
      case 'USDC':
      case 'DAI':
      case 'MATIC':
      case 'BNB':
        // Ethereum format: 0x followed by 40 hex characters
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'SOL':
        // Solana format: base58, typically 32-44 characters
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      default:
        return true; // Unknown format, assume valid
    }
  }
}
