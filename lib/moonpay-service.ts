// MoonPay integration for fiat on-ramp
// Docs: https://docs.moonpay.com/

export interface MoonPayConfig {
  walletAddress: string;
  currencyCode?: string; // e.g., 'eth', 'usdt', 'matic'
  baseCurrencyCode?: string; // e.g., 'eur', 'usd', 'gbp'
  apiKey?: string; // Optional: for partner revenue share
}

export class MoonPayService {
  private static readonly MOONPAY_URL = 'https://buy.moonpay.com';

  // Get supported assets by chain
  static getSupportedAssets(chainId: number): string[] {
    const assetMap: Record<number, string[]> = {
      1: ['eth', 'usdt', 'usdc', 'dai', 'wbtc', 'link'], // Ethereum
      137: ['matic', 'usdt_polygon', 'usdc_polygon'], // Polygon
      56: ['bnb_bsc', 'usdt_bsc', 'busd'], // BSC
      42161: ['eth_arbitrum', 'usdt_arbitrum'], // Arbitrum
      10: ['eth_optimism'], // Optimism
      8453: ['eth_base'], // Base
      11155111: ['eth'], // Sepolia
      // Solana support
      101: ['sol', 'usdc_sol', 'usdt_sol'], // Solana
    };

    return assetMap[chainId] || [];
  }

  // Open MoonPay widget in new window
  static openWidget(config: MoonPayConfig) {
    // Convert wallet address format based on currency
    let walletAddress = config.walletAddress;
    
    // For Solana, we need to ensure the address is in the correct format
    if (config.currencyCode === 'sol' || config.currencyCode === 'usdc_sol' || config.currencyCode === 'usdt_sol') {
      // MoonPay expects Solana addresses in base58 format
      // If the address is an Ethereum address, we need to convert it or use a different approach
      console.warn('⚠️ Solana purchase detected with Ethereum wallet address. This may cause delivery issues.');
      console.warn('Consider implementing proper Solana wallet address generation for MoonPay integration.');
    }

    const params = new URLSearchParams({
      walletAddress: walletAddress,
      ...(config.currencyCode && { currencyCode: config.currencyCode }),
      ...(config.baseCurrencyCode && { baseCurrencyCode: config.baseCurrencyCode }),
      ...(config.apiKey && { apiKey: config.apiKey }),
      // Customize appearance
      colorCode: '%23F97316', // BLAZE orange
      theme: 'dark',
      language: 'en', // English
    });

    const url = `${this.MOONPAY_URL}?${params.toString()}`;

    // Open in new tab - most reliable method
    const width = 500;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url,
      'moonpay',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  // Get currency code from chain and token symbol
  static getCurrencyCode(chainId: number, symbol: string): string {
    // Map common tokens to MoonPay currency codes
    const codeMap: Record<string, string> = {
      // Ethereum
      'ETH': 'eth',
      'USDT': 'usdt',
      'USDC': 'usdc',
      'DAI': 'dai',
      'WBTC': 'wbtc',
      'LINK': 'link',
      // Polygon
      'MATIC': 'matic',
      'USDT_POLYGON': 'usdt_polygon',
      'USDC_POLYGON': 'usdc_polygon',
      // BSC
      'BNB': 'bnb_bsc',
      'USDT_BSC': 'usdt_bsc',
      'BUSD': 'busd',
      // Arbitrum
      'ETH_ARBITRUM': 'eth_arbitrum',
      'USDT_ARBITRUM': 'usdt_arbitrum',
      // Optimism
      'ETH_OPTIMISM': 'eth_optimism',
      // Base
      'ETH_BASE': 'eth_base',
      // Solana
      'SOL': 'sol',
      'USDC_SOL': 'usdc_sol',
      'USDT_SOL': 'usdt_sol',
    };

    // For native currencies
    if (chainId === 1 && symbol === 'ETH') return 'eth';
    if (chainId === 137 && symbol === 'MATIC') return 'matic';
    if (chainId === 56 && symbol === 'BNB') return 'bnb_bsc';
    if (chainId === 42161 && symbol === 'ETH') return 'eth_arbitrum';
    if (chainId === 10 && symbol === 'ETH') return 'eth_optimism';
    if (chainId === 8453 && symbol === 'ETH') return 'eth_base';
    if (chainId === 101 && symbol === 'SOL') return 'sol';

    return codeMap[symbol] || 'eth';
  }

  // Get display name for currency code
  static getDisplayName(currencyCode: string): string {
    const nameMap: Record<string, string> = {
      'eth': 'Ethereum',
      'usdt': 'USDT',
      'usdc': 'USDC',
      'dai': 'DAI',
      'matic': 'Polygon',
      'bnb_bsc': 'BNB',
      'usdt_bsc': 'USDT (BSC)',
      'busd': 'BUSD',
      'sol': 'Solana',
      'usdc_sol': 'USDC (Solana)',
      'usdt_sol': 'USDT (Solana)',
    };

    return nameMap[currencyCode] || currencyCode.toUpperCase();
  }
}
