import { NextResponse } from 'next/server';

// 1inch API proxy using public endpoints (no API key needed)
const ONEINCH_API_URL = 'https://api.1inch.io/v5.0';

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

  try {
    // Use public API endpoint (v5.0 via .io domain - no auth needed)
    const url = `${ONEINCH_API_URL}/${chainId}/swap?fromTokenAddress=${src}&toTokenAddress=${dst}&amount=${amount}&fromAddress=${from}&slippage=${slippage}&disableEstimate=true`;
    
    console.log('Proxying 1inch swap transaction:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch swap API error:', response.status, errorText);
      return NextResponse.json(
        { error: `1inch API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying 1inch swap request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
