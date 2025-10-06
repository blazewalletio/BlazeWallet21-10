// Simple price service - in productie zou je CoinGecko/CoinMarketCap API gebruiken
export class PriceService {
  private cache: Map<string, { price: number; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute

  // Placeholder prices - in productie: gebruik echte API
  private mockPrices: Record<string, number> = {
    ETH: 1700,
    MATIC: 0.52,
    USDT: 1.0,
    USDC: 1.0,
    WBTC: 28000,
    LINK: 7.5,
    ARB: 0.85,
  };

  async getPrice(symbol: string): Promise<number> {
    const cached = this.cache.get(symbol);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    // In productie: fetch van API
    // const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    
    const price = this.mockPrices[symbol] || 0;
    
    // Simuleer kleine price fluctuaties voor realistisch effect
    const fluctuation = (Math.random() - 0.5) * 0.02; // ±1%
    const adjustedPrice = price * (1 + fluctuation);

    this.cache.set(symbol, { price: adjustedPrice, timestamp: now });
    return adjustedPrice;
  }

  async getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    const pricePromises = symbols.map(async (symbol) => ({
      symbol,
      price: await this.getPrice(symbol),
    }));

    const results = await Promise.all(pricePromises);
    return results.reduce((acc, { symbol, price }) => {
      acc[symbol] = price;
      return acc;
    }, {} as Record<string, number>);
  }

  async get24hChange(symbol: string): Promise<number> {
    // Mock 24h change - in productie: echte data
    const changes: Record<string, number> = {
      ETH: 2.5,
      MATIC: -1.2,
      USDT: 0.01,
      USDC: -0.02,
      WBTC: 1.8,
      LINK: 5.3,
      ARB: -0.8,
    };
    
    return changes[symbol] || 0;
  }
}
