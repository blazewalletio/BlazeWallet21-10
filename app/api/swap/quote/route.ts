import { NextResponse } from 'next/server';

// CoinGecko proxy for price data
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Token address to CoinGecko ID mapping
const TOKEN_TO_COINGECKO: Record<string, string> = {
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ethereum', // ETH
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'tether', // USDT
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'usd-coin', // USDC
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'dai', // DAI
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'wrapped-bitcoin', // WBTC
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const chainId = searchParams.get('chainId');
  const src = searchParams.get('src');
  const dst = searchParams.get('dst');
  const amount = searchParams.get('amount');

  if (!chainId || !src || !dst || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Get CoinGecko IDs for both tokens
    const srcId = TOKEN_TO_COINGECKO[src];
    const dstId = TOKEN_TO_COINGECKO[dst];

    if (!srcId || !dstId) {
      console.error('Token not supported:', { src, dst });
      return NextResponse.json({
        toTokenAmount: '0',
        estimatedGas: '200000',
        error: 'Token pair not supported'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // Fetch prices from CoinGecko
    const priceUrl = `${COINGECKO_API_URL}/simple/price?ids=${srcId},${dstId}&vs_currencies=usd`;
    console.log('Fetching prices from CoinGecko:', priceUrl);

    const priceResponse = await fetch(priceUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API error: ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();
    console.log('Price data:', priceData);

    const srcPrice = priceData[srcId]?.usd;
    const dstPrice = priceData[dstId]?.usd;

    if (!srcPrice || !dstPrice) {
      throw new Error('Price data unavailable');
    }

    // Calculate output amount
    // amount is in wei (18 decimals for ETH)
    const amountInEth = Number(amount) / 1e18;
    const valueInUsd = amountInEth * srcPrice;
    const outputAmount = valueInUsd / dstPrice;
    
    // Convert to token decimals (USDT = 6 decimals, others = 18)
    const dstDecimals = dst === '0xdAC17F958D2ee523a2206206994597C13D831ec7' ? 6 : 18;
    const outputAmountWei = Math.floor(outputAmount * (10 ** dstDecimals));

    // Apply 0.3% fee to simulate DEX fees
    const outputWithFee = Math.floor(outputAmountWei * 0.997);

    console.log('Swap calculation:', {
      amountInEth,
      srcPrice,
      dstPrice,
      valueInUsd,
      outputAmount,
      outputWithFee,
    });

    return NextResponse.json({
      toTokenAmount: outputWithFee.toString(),
      fromTokenAmount: amount,
      estimatedGas: '180000',
      protocols: [['Price-based estimate']],
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error calculating swap quote:', error);
    
    return NextResponse.json({
      toTokenAmount: '0',
      estimatedGas: '200000',
      error: 'Unable to calculate swap quote'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
