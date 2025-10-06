import { NextResponse } from 'next/server';

interface HistoryPoint {
  timestamp: number;
  value: number;
}

// In-memory cache voor development (in productie zou dit Vercel KV zijn)
// Voor nu gebruiken we een simpele server-side storage die werkt op alle platforms
const historyCache = new Map<string, HistoryPoint[]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const timeframe = searchParams.get('timeframe') || '1D';

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    // Haal history op voor dit wallet address
    const history = historyCache.get(address.toLowerCase()) || [];
    
    // Filter op timeframe
    const now = Date.now();
    let startTime: number;
    
    switch (timeframe) {
      case '1D':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case '1W':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '1M':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '1Y':
        startTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
      case 'ALL':
        startTime = 0;
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }
    
    const filteredHistory = history.filter(p => p.timestamp >= startTime);
    
    return NextResponse.json({
      address,
      timeframe,
      history: filteredHistory,
      count: filteredHistory.length
    });
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, value } = body;

    if (!address || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Address and value required' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const key = address.toLowerCase();
    
    // Haal bestaande history op
    let history = historyCache.get(key) || [];
    
    // Voorkom te veel data points (max 1 per 5 minuten)
    const lastPoint = history[history.length - 1];
    if (lastPoint && now - lastPoint.timestamp < 5 * 60 * 1000) {
      // Update laatste point
      lastPoint.value = value;
      lastPoint.timestamp = now;
    } else {
      // Voeg nieuwe point toe
      history.push({ timestamp: now, value });
    }
    
    // Beperk tot max 2 jaar data
    const twoYearsAgo = now - (365 * 2 * 24 * 60 * 60 * 1000);
    history = history.filter(p => p.timestamp > twoYearsAgo);
    
    // Bewaar terug
    historyCache.set(key, history);
    
    return NextResponse.json({
      success: true,
      address,
      value,
      timestamp: now,
      totalPoints: history.length
    });
  } catch (error) {
    console.error('Error saving portfolio history:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}
