import { NextResponse } from 'next/server';

// 1inch API proxy using public endpoints (no API key needed)
const ONEINCH_API_URL = 'https://api.1inch.io/v5.0';

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
    // Use public API endpoint (v5.0 via .io domain - no auth needed)
    const url = `${ONEINCH_API_URL}/${chainId}/quote?fromTokenAddress=${src}&toTokenAddress=${dst}&amount=${amount}`;
    
    console.log('Proxying 1inch request:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch API error:', response.status, errorText);
      
      // Return empty response instead of error to prevent UI break
      return NextResponse.json({
        toTokenAmount: '0',
        estimatedGas: '200000',
        error: 'Quote unavailable'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying 1inch request:', error);
    return NextResponse.json({
      toTokenAmount: '0',
      estimatedGas: '200000',
      error: 'Service unavailable'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
