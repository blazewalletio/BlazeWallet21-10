// Live crypto price service using CoinGecko API
export class PriceService {
  private cache: Map<string, { price: number; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute cache
  private apiUrl = 'https://api.coingecko.com/api/v3';

  // Symbol to CoinGecko ID mapping
  private symbolToId: Record<string, string> = {
    ETH: 'ethereum',
    MATIC: 'matic-network',
    BNB: 'binancecoin',
    USDT: 'tether',
    USDC: 'usd-coin',
    BUSD: 'binance-usd',
    WBTC: 'wrapped-bitcoin',
    LINK: 'chainlink',
    ARB: 'arbitrum',
    BASE: 'base',
  };

  async getPrice(symbol: string): Promise<number> {
    const cached = this.cache.get(symbol);
    const now = Date.now();

    // Return cached price if still valid
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    try {
      // Get CoinGecko ID from symbol
      const coinId = this.symbolToId[symbol.toUpperCase()];
      
      if (!coinId) {
        console.warn(`No CoinGecko ID for symbol: ${symbol}`);
        return 0;
      }

      // Fetch live price from CoinGecko (free, no API key needed)
      const response = await fetch(
        `${this.apiUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[coinId]?.usd || 0;

      // Cache the result
      this.cache.set(symbol, { price, timestamp: now });
      
      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      
      // Return cached price if available, otherwise 0
      return cached?.price || 0;
    }
  }

  async getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    try {
      // Get all CoinGecko IDs
      const coinIds = symbols
        .map(s => this.symbolToId[s.toUpperCase()])
        .filter(Boolean);

      if (coinIds.length === 0) {
        return {};
      }

      // Fetch all prices in one request (more efficient)
      const response = await fetch(
        `${this.apiUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const now = Date.now();

      // Map back to symbols and cache
      const result: Record<string, number> = {};
      symbols.forEach(symbol => {
        const coinId = this.symbolToId[symbol.toUpperCase()];
        if (coinId && data[coinId]) {
          const price = data[coinId].usd;
          result[symbol] = price;
          this.cache.set(symbol, { price, timestamp: now });
        }
      });

      return result;
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      
      // Fallback to individual cached prices
      const result: Record<string, number> = {};
      symbols.forEach(symbol => {
        const cached = this.cache.get(symbol);
        if (cached) {
          result[symbol] = cached.price;
        }
      });
      return result;
    }
  }

  async get24hChange(symbol: string): Promise<number> {
    try {
      const coinId = this.symbolToId[symbol.toUpperCase()];
      
      if (!coinId) {
        return 0;
      }

      const response = await fetch(
        `${this.apiUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return data[coinId]?.usd_24h_change || 0;
    } catch (error) {
      console.error(`Error fetching 24h change for ${symbol}:`, error);
      return 0;
    }
  }
}
