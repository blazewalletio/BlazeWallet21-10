// 1inch DEX Aggregator integration for best swap rates
// Docs: https://docs.1inch.io/docs/aggregation-protocol/api/swagger

import { ethers } from 'ethers';

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  protocols: string[];
  tx?: any; // Transaction data for execution
}

export class SwapService {
  private baseUrl = 'https://api.1inch.dev/swap/v6.0';

  // Get supported chains
  private chainEndpoints: Record<number, number> = {
    1: 1, // Ethereum
    56: 56, // BSC
    137: 137, // Polygon
    42161: 42161, // Arbitrum
    10: 10, // Optimism
    8453: 8453, // Base
  };

  constructor(private chainId: number) {}

  // Get swap quote (using public API endpoint)
  async getQuote(
    fromToken: string, // Token address or '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' for native
    toToken: string,
    amount: string, // Amount in wei
  ): Promise<SwapQuote | null> {
    try {
      const chain = this.chainEndpoints[this.chainId];
      if (!chain) {
        console.error('Chain not supported by 1inch');
        return null;
      }

      // Use public API endpoint (v5.2 is more stable)
      const url = `https://api.1inch.dev/swap/v5.2/${chain}/quote`;
      const params = new URLSearchParams({
        src: fromToken,
        dst: toToken,
        amount: amount,
      });

      console.log('Fetching 1inch quote:', `${url}?${params.toString()}`);

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('1inch API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('1inch quote response:', data);

      return {
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: data.toTokenAmount || data.dstAmount || data.toAmount || '0',
        estimatedGas: data.estimatedGas || data.gas || '200000',
        protocols: data.protocols || [],
      };
    } catch (error) {
      console.error('Error fetching swap quote:', error);
      return null;
    }
  }

  // Get swap transaction data (for executing the swap)
  async getSwapTransaction(
    fromToken: string,
    toToken: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1, // 1% slippage
  ): Promise<any> {
    try {
      const chain = this.chainEndpoints[this.chainId];
      if (!chain) {
        throw new Error('Chain not supported');
      }

      // Use v5.2 for better stability
      const url = `https://api.1inch.dev/swap/v5.2/${chain}/swap`;
      const params = new URLSearchParams({
        src: fromToken,
        dst: toToken,
        amount: amount,
        from: fromAddress,
        slippage: slippage.toString(),
        disableEstimate: 'true',
      });

      console.log('Fetching 1inch swap tx:', `${url}?${params.toString()}`);

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('1inch swap API error:', response.status, errorText);
        throw new Error(`1inch API error: ${response.status}`);
      }

      const data = await response.json();
      return data.tx || data;
    } catch (error) {
      console.error('Error fetching swap transaction:', error);
      throw error;
    }
  }

  // Helper: Get native token address for 1inch
  static getNativeTokenAddress(): string {
    return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  }

  // Helper: Check if address is native token
  static isNativeToken(address: string): boolean {
    return address.toLowerCase() === this.getNativeTokenAddress().toLowerCase();
  }

  // Calculate price impact
  calculatePriceImpact(
    fromAmount: string,
    toAmount: string,
    fromPrice: number,
    toPrice: number
  ): number {
    try {
      const fromValue = parseFloat(ethers.formatEther(fromAmount)) * fromPrice;
      const toValue = parseFloat(ethers.formatEther(toAmount)) * toPrice;
      
      if (fromValue === 0) return 0;
      
      const impact = ((toValue - fromValue) / fromValue) * 100;
      return Math.abs(impact);
    } catch {
      return 0;
    }
  }
}
