import { NextResponse } from 'next/server';

// Try 1inch first (with API key if available), fallback to 0x API
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ZEROX_API_KEY = process.env.ZEROX_API_KEY || 'public';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const chainId = searchParams.get('chainId');
  const src = searchParams.get('src');
  const dst = searchParams.get('dst');
  const amount = searchParams.get('amount');
  const from = searchParams.get('from');
  const slippage = searchParams.get('slippage') || '1';

  if (!chainId || !src || !dst || !amount || !from) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  // Try 1inch if API key is available
  if (ONEINCH_API_KEY) {
    try {
      const url = `https://api.1inch.dev/swap/v6.0/${chainId}/swap?src=${src}&dst=${dst}&amount=${amount}&from=${from}&slippage=${slippage}&disableEstimate=true`;
      
      console.log('Trying 1inch swap API with key...');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ONEINCH_API_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('1inch swap success!');
        return NextResponse.json(data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.log('1inch swap failed, trying fallback...');
    }
  }

  // Fallback to 0x API
  try {
    // Convert native token address for 0x
    const buyToken = dst === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? 'ETH' : dst;
    const sellToken = src === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? 'ETH' : src;
    
    const slippagePercentage = parseFloat(slippage) / 100; // Convert to decimal
    
    const url = `https://api.0x.org/swap/v1/quote?chainId=${chainId}&sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${amount}&takerAddress=${from}&slippagePercentage=${slippagePercentage}`;
    
    console.log('Trying 0x swap API (fallback)...');

    const response = await fetch(url, {
      headers: {
        '0x-api-key': ZEROX_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('0x swap success!');
      
      // Format response to match 1inch structure
      return NextResponse.json({
        tx: {
          from: data.from || from,
          to: data.to,
          data: data.data,
          value: data.value || '0',
          gas: data.gas || data.estimatedGas || '200000',
          gasPrice: data.gasPrice,
        }
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const errorText = await response.text();
    console.error('0x swap API error:', response.status, errorText);
  } catch (error) {
    console.error('0x swap API failed:', error);
  }

  // If all fails
  return NextResponse.json(
    { error: 'Swap service temporarily unavailable' },
    { status: 503 }
  );
}
