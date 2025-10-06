import { NextResponse } from 'next/server';

// Try 1inch first (with API key if available), fallback to 0x API
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ZEROX_API_KEY = process.env.ZEROX_API_KEY || 'public'; // 0x has generous free tier

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

  // Try 1inch if API key is available
  if (ONEINCH_API_KEY) {
    try {
      const url = `https://api.1inch.dev/swap/v6.0/${chainId}/quote?src=${src}&dst=${dst}&amount=${amount}`;
      
      console.log('Trying 1inch API with key...');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ONEINCH_API_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('1inch success!');
        return NextResponse.json(data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.log('1inch failed, trying fallback...');
    }
  }

  // Fallback to 0x API (free, no key needed for basic usage)
  try {
    // Convert native token address for 0x
    const buyToken = dst === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? 'ETH' : dst;
    const sellToken = src === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? 'ETH' : src;
    
    const url = `https://api.0x.org/swap/v1/quote?chainId=${chainId}&sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${amount}`;
    
    console.log('Trying 0x API (fallback):', url);

    const response = await fetch(url, {
      headers: {
        '0x-api-key': ZEROX_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('0x API success!');
      
      // Format response to match 1inch structure
      return NextResponse.json({
        toTokenAmount: data.buyAmount || '0',
        estimatedGas: data.estimatedGas || '200000',
        protocols: [['0x']],
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const errorText = await response.text();
    console.error('0x API error:', response.status, errorText);
  } catch (error) {
    console.error('0x API failed:', error);
  }

  // If all fails, return graceful error
  return NextResponse.json({
    toTokenAmount: '0',
    estimatedGas: '200000',
    error: 'Swap currently unavailable. Try again later.'
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
