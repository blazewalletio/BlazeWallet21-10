// Ramp Network integration for fiat on-ramp using official SDK
// Docs: https://docs.ramp.network/

import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

export interface RampConfig {
  hostAppName: string;
  hostLogoUrl?: string;
  swapAsset?: string; // e.g., 'ETH', 'USDT_ETHEREUM'
  userAddress: string;
  hostApiKey?: string; // Optional: for revenue share
}

export class RampService {
  private static readonly RAMP_HOST_APP_NAME = 'Arc Wallet';

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

  // Open Ramp widget using official SDK
  static openWidget(config: RampConfig) {
    const widget = new RampInstantSDK({
      hostAppName: config.hostAppName,
      hostLogoUrl: config.hostLogoUrl || 'https://arcwallet.vercel.app/icon-512.png',
      userAddress: config.userAddress,
      swapAsset: config.swapAsset,
      variant: 'auto', // Automatically adapts to mobile/desktop
      // Optional: Add revenue share API key
      ...(config.hostApiKey && { hostApiKey: config.hostApiKey }),
    });

    // Show the widget
    widget.show();
    
    return widget;
  }
}