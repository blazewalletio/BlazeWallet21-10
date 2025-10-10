import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const address = searchParams.get('address');
    const limit = searchParams.get('limit') || '10';

    if (!chainId || !address) {
      return NextResponse.json(
        { error: 'Missing chainId or address parameter' },
        { status: 400 }
      );
    }

    // Use Etherscan V2 Multichain API for all supported chains
    const getApiKey = (chain: string): string => {
      return process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
    };

    // Etherscan V2 Multichain API - one endpoint for all chains
    const apiConfig: Record<string, { url: string; v2: boolean }> = {
      '1': { url: 'https://api.etherscan.io/v2/api', v2: true }, // Ethereum Mainnet
      '11155111': { url: 'https://api.etherscan.io/v2/api', v2: true }, // Sepolia
      '56': { url: 'https://api.etherscan.io/v2/api', v2: true }, // BSC Mainnet
      '97': { url: 'https://api.etherscan.io/v2/api', v2: true }, // BSC Testnet
      '137': { url: 'https://api.etherscan.io/v2/api', v2: true }, // Polygon
      '42161': { url: 'https://api.etherscan.io/v2/api', v2: true }, // Arbitrum
      '10': { url: 'https://api.etherscan.io/v2/api', v2: true }, // Optimism
      '8453': { url: 'https://api.etherscan.io/v2/api', v2: true }, // Base
    };

    const config = apiConfig[chainId];
    const apiKey = getApiKey(chainId);

    if (!config) {
      return NextResponse.json(
        { error: `Unsupported chain: ${chainId}` },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'No API key configured',
          message: 'Add NEXT_PUBLIC_ETHERSCAN_API_KEY to environment variables'
        },
        { status: 503 }
      );
    }

    // Build API URL
    let apiUrl: string;
    if (config.v2) {
      // Etherscan V2 format
      apiUrl = `${config.url}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`;
    } else {
      // V1 format for other chains
      apiUrl = `${config.url}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`;
    }

    console.log(`🔍 Fetching transactions for chain ${chainId} via server proxy...`);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Block explorer API returned ${response.status}`);
    }

    const data = await response.json();

    // Add CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });

  } catch (error: any) {
    console.error('Transaction proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
