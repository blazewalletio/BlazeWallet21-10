// Uniswap Universal Router - Fully Decentralized Swaps
// No API key needed, direct on-chain routing

import { ethers } from 'ethers';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { AlphaRouter } from '@uniswap/smart-order-router';

// Supported chains for Uniswap
const UNISWAP_CHAINS: Record<number, { name: string; weth: string }> = {
  1: { name: 'mainnet', weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  137: { name: 'polygon', weth: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' },
  42161: { name: 'arbitrum', weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
  10: { name: 'optimism', weth: '0x4200000000000000000000000000000000000006' },
  8453: { name: 'base', weth: '0x4200000000000000000000000000000000000006' },
};

export interface UniswapQuote {
  outputAmount: string;
  outputAmountFormatted: string;
  priceImpact: string;
  gasEstimate: string;
  route: any;
}

export class UniswapService {
  private chainId: number;
  private provider: ethers.JsonRpcProvider;
  private router: AlphaRouter | null = null;

  constructor(chainId: number, rpcUrl: string) {
    this.chainId = chainId;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  private async initRouter() {
    if (this.router) return this.router;

    const chainConfig = UNISWAP_CHAINS[this.chainId];
    if (!chainConfig) {
      throw new Error(`Uniswap not supported on chain ${this.chainId}`);
    }

    this.router = new AlphaRouter({
      chainId: this.chainId,
      provider: this.provider as any,
    });

    return this.router;
  }

  // Get swap quote
  async getQuote(
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    decimalsIn: number = 18,
    decimalsOut: number = 18,
  ): Promise<UniswapQuote | null> {
    try {
      const router = await this.initRouter();

      // Create token instances
      const tokenIn = new Token(
        this.chainId,
        tokenInAddress,
        decimalsIn,
        'TOKEN_IN',
        'Token In'
      );

      const tokenOut = new Token(
        this.chainId,
        tokenOutAddress,
        decimalsOut,
        'TOKEN_OUT',
        'Token Out'
      );

      // Create amount
      const amount = CurrencyAmount.fromRawAmount(tokenIn, amountIn);

      // Get route
      const route = await router.route(
        amount,
        tokenOut,
        TradeType.EXACT_INPUT,
        {
          recipient: '0x0000000000000000000000000000000000000000', // Dummy for quote
          slippageTolerance: new Percent(50, 10_000), // 0.5%
          deadline: Math.floor(Date.now() / 1000 + 1800), // 30 minutes
        }
      );

      if (!route) {
        console.error('No route found');
        return null;
      }

      const outputAmount = route.quote.quotient.toString();
      const outputAmountFormatted = ethers.formatUnits(outputAmount, decimalsOut);
      const priceImpact = route.estimatedGasUsedQuoteToken.toFixed(2);
      const gasEstimate = route.estimatedGasUsed.toString();

      console.log('Uniswap quote:', {
        outputAmount,
        outputAmountFormatted,
        priceImpact,
        gasEstimate,
      });

      return {
        outputAmount,
        outputAmountFormatted,
        priceImpact,
        gasEstimate,
        route,
      };
    } catch (error) {
      console.error('Uniswap quote error:', error);
      return null;
    }
  }

  // Execute swap
  async executeSwap(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    minAmountOut: string,
    decimalsIn: number = 18,
    decimalsOut: number = 18,
  ): Promise<string> {
    try {
      const router = await this.initRouter();
      const signer = wallet.connect(this.provider);

      // Create token instances
      const tokenIn = new Token(
        this.chainId,
        tokenInAddress,
        decimalsIn,
        'TOKEN_IN',
        'Token In'
      );

      const tokenOut = new Token(
        this.chainId,
        tokenOutAddress,
        decimalsOut,
        'TOKEN_OUT',
        'Token Out'
      );

      // Create amount
      const amount = CurrencyAmount.fromRawAmount(tokenIn, amountIn);

      // Get route with actual recipient
      const route = await router.route(
        amount,
        tokenOut,
        TradeType.EXACT_INPUT,
        {
          recipient: wallet.address,
          slippageTolerance: new Percent(50, 10_000), // 0.5%
          deadline: Math.floor(Date.now() / 1000 + 1800), // 30 minutes
        }
      );

      if (!route || !route.methodParameters) {
        throw new Error('No route found for swap');
      }

      // Check if token approval is needed (for ERC-20 tokens)
      if (tokenInAddress !== ethers.ZeroAddress) {
        const tokenContract = new ethers.Contract(
          tokenInAddress,
          ['function allowance(address,address) view returns (uint256)', 'function approve(address,uint256) returns (bool)'],
          signer
        );

        const allowance = await tokenContract.allowance(
          wallet.address,
          route.methodParameters.to
        );

        if (allowance < BigInt(amountIn)) {
          console.log('Approving token...');
          const approveTx = await tokenContract.approve(
            route.methodParameters.to,
            ethers.MaxUint256
          );
          await approveTx.wait();
          console.log('Token approved');
        }
      }

      // Execute swap
      const tx = await signer.sendTransaction({
        to: route.methodParameters.to,
        data: route.methodParameters.calldata,
        value: route.methodParameters.value,
        gasLimit: route.estimatedGasUsed.toString(),
      });

      console.log('Uniswap swap tx:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Uniswap swap error:', error);
      throw error;
    }
  }

  // Check if Uniswap is supported on this chain
  static isSupported(chainId: number): boolean {
    return chainId in UNISWAP_CHAINS;
  }

  // Get WETH address for native token wrapping
  static getWETHAddress(chainId: number): string | null {
    return UNISWAP_CHAINS[chainId]?.weth || null;
  }
}
