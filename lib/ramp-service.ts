// Ramp Network integration for fiat on-ramp
// Docs: https://docs.ramp.network/

export interface RampConfig {
  hostAppName: string;
  hostLogoUrl?: string;
  swapAsset?: string; // e.g., 'ETH', 'USDT_ETHEREUM'
  userAddress: string;
  hostApiKey?: string; // Optional: for revenue share
}

export class RampService {
  private static readonly RAMP_HOST_APP_NAME = 'Arc Wallet';
  private static readonly RAMP_WIDGET_URL = 'https://app.ramp.network';

  // Get supported assets by chain
  static getSupportedAssets(chainId: number): string[] {
    const assetMap: Record<number, string[]> = {
      1: ['ETH', 'USDT_ETHEREUM', 'USDC_ETHEREUM', 'DAI_ETHEREUM'], // Ethereum
      137: ['MATIC_POLYGON', 'USDT_POLYGON', 'USDC_POLYGON'], // Polygon
      56: ['BNB_BSC', 'USDT_BSC', 'BUSD_BSC'], // BSC
      42161: ['ETH_ARBITRUM', 'USDT_ARBITRUM'], // Arbitrum
      8453: ['ETH_BASE'], // Base
      11155111: ['ETH'], // Sepolia (testnet)
    };

    return assetMap[chainId] || [];
  }

  // Open Ramp widget - works without registration!
  static openWidget(config: RampConfig) {
    const params = new URLSearchParams({
      userAddress: config.userAddress,
      ...(config.swapAsset && { swapAsset: config.swapAsset }),
      // Add hostAppName for branding (works even without registration)
      hostAppName: config.hostAppName,
      // Optional: Add API key if you have one (for revenue share)
      ...(config.hostApiKey && { hostApiKey: config.hostApiKey }),
    });

    const url = `${this.RAMP_WIDGET_URL}?${params.toString()}`;
    
    // Open in new tab - most reliable method
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}