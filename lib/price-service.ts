// Live crypto price service using Next.js API route (avoids CORS!)
export class PriceService {
  private cache: Map<string, { price: number; change24h: number; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute cache
  private apiUrl = '/api/prices'; // Use our API route instead of direct CoinGecko

  async getPrice(symbol: string): Promise<number> {
    // Check cache first
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    try {
      const response = await fetch(`${this.apiUrl}?symbols=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[symbol]?.price || 0;
      const change24h = data[symbol]?.change24h || 0;

      // Update cache
      this.cache.set(symbol, { price, change24h, timestamp: Date.now() });

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      // Return cached price if available, otherwise 0
      return cached?.price || 0;
    }
  }

  async getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${this.apiUrl}?symbols=${symbols.join(',')}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const now = Date.now();

      const result: Record<string, number> = {};
      symbols.forEach(symbol => {
        if (data[symbol]) {
          const price = data[symbol].price;
          const change24h = data[symbol].change24h;
          result[symbol] = price;
          this.cache.set(symbol, { price, change24h, timestamp: now });
        }
      });

      return result;
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      // Return cached prices
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
    // Check cache first
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.change24h;
    }

    try {
      const response = await fetch(`${this.apiUrl}?symbols=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[symbol]?.price || 0;
      const change24h = data[symbol]?.change24h || 0;

      // Update cache
      this.cache.set(symbol, { price, change24h, timestamp: Date.now() });

      return change24h;
    } catch (error) {
      console.error(`Error fetching 24h change for ${symbol}:`, error);
      return cached?.change24h || 0;
    }
  }
}