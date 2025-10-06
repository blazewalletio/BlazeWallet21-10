// Ramp Network integration for fiat on-ramp
// Docs: https://docs.ramp.network/

export interface RampConfig {
  hostAppName: string;
  hostLogoUrl: string;
  swapAsset?: string; // e.g., 'ETH', 'USDT_ETHEREUM'
  userAddress: string;
  hostApiKey?: string; // Optional: for revenue share
}

export class RampService {
  private static readonly RAMP_HOST_APP_NAME = 'Arc Wallet';
  private static readonly RAMP_WIDGET_URL = 'https://buy.ramp.network';

  // Get supported assets by chain
  static getSupportedAssets(chainId: number): string[] {
    const assetMap: Record<number, string[]> = {
      1: ['ETH', 'USDT_ETHEREUM', 'USDC_ETHEREUM', 'DAI_ETHEREUM'], // Ethereum
      137: ['MATIC_POLYGON', 'USDT_POLYGON', 'USDC_POLYGON'], // Polygon
      56: ['BNB_BSC', 'USDT_BSC', 'BUSD_BSC'], // BSC
      42161: ['ETH_ARBITRUM', 'USDT_ARBITRUM'], // Arbitrum
      8453: ['ETH_BASE'], // Base
    };

    return assetMap[chainId] || [];
  }

  // Open Ramp widget
  static openWidget(config: RampConfig) {
    const params = new URLSearchParams({
      hostAppName: config.hostAppName,
      userAddress: config.userAddress,
      ...(config.swapAsset && { swapAsset: config.swapAsset }),
      ...(config.hostLogoUrl && { hostLogoUrl: config.hostLogoUrl }),
      // Customize appearance
      variant: 'auto', // auto, mobile, desktop
      // Optional: Add revenue share
      ...(config.hostApiKey && { hostApiKey: config.hostApiKey }),
    });

    const url = `${this.RAMP_WIDGET_URL}?${params.toString()}`;
    
    // Open in new window for better UX
    const width = 420;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url,
      'ramp',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  // Alternative: Embed widget in iframe (for modal)
  static getEmbedUrl(config: RampConfig): string {
    const params = new URLSearchParams({
      hostAppName: config.hostAppName,
      userAddress: config.userAddress,
      ...(config.swapAsset && { swapAsset: config.swapAsset }),
      variant: 'embedded-mobile',
    });

    return `${this.RAMP_WIDGET_URL}?${params.toString()}`;
  }
}
