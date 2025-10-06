// Portfolio history tracking - stores real balance snapshots over time
interface BalanceSnapshot {
  timestamp: number;
  balance: number; // in USD
  address: string;
  chain: string;
}

const STORAGE_KEY = 'arc_portfolio_history';
const MAX_SNAPSHOTS = 100; // Keep last 100 data points
const SNAPSHOT_INTERVAL = 5 * 60 * 1000; // Save snapshot every 5 minutes

export class PortfolioHistory {
  private snapshots: BalanceSnapshot[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Load history from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.snapshots = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading portfolio history:', error);
      this.snapshots = [];
    }
  }

  // Save history to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshots));
    } catch (error) {
      console.error('Error saving portfolio history:', error);
    }
  }

  // Add a new balance snapshot
  addSnapshot(balance: number, address: string, chain: string) {
    const now = Date.now();
    
    // Check if we should add a new snapshot (avoid too frequent updates)
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    if (lastSnapshot && now - lastSnapshot.timestamp < SNAPSHOT_INTERVAL) {
      // Update the last snapshot instead of creating a new one
      lastSnapshot.balance = balance;
      lastSnapshot.timestamp = now;
    } else {
      // Add new snapshot
      this.snapshots.push({
        timestamp: now,
        balance,
        address,
        chain,
      });
    }

    // Keep only the last MAX_SNAPSHOTS
    if (this.snapshots.length > MAX_SNAPSHOTS) {
      this.snapshots = this.snapshots.slice(-MAX_SNAPSHOTS);
    }

    this.saveToStorage();
  }

  // Get recent snapshots for chart (last N points)
  getRecentSnapshots(count: number = 20): BalanceSnapshot[] {
    if (this.snapshots.length === 0) {
      return [];
    }

    // If we have fewer snapshots than requested, return all
    if (this.snapshots.length <= count) {
      return this.snapshots;
    }

    // Return evenly distributed snapshots across the range
    const step = Math.floor(this.snapshots.length / count);
    const result: BalanceSnapshot[] = [];
    
    for (let i = 0; i < count; i++) {
      const index = Math.min(i * step, this.snapshots.length - 1);
      result.push(this.snapshots[index]);
    }

    return result;
  }

  // Get the change percentage over the snapshots
  getChangePercentage(): number {
    if (this.snapshots.length < 2) {
      return 0;
    }

    const first = this.snapshots[0].balance;
    const last = this.snapshots[this.snapshots.length - 1].balance;

    if (first === 0) return 0;

    return ((last - first) / first) * 100;
  }

  // Get change in absolute value
  getChangeValue(): number {
    if (this.snapshots.length < 2) {
      return 0;
    }

    const first = this.snapshots[0].balance;
    const last = this.snapshots[this.snapshots.length - 1].balance;

    return last - first;
  }

  // Clear all history (useful for testing or reset)
  clear() {
    this.snapshots = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  // Get total number of snapshots
  getSnapshotCount(): number {
    return this.snapshots.length;
  }
}

// Singleton instance
let portfolioHistoryInstance: PortfolioHistory | null = null;

export function getPortfolioHistory(): PortfolioHistory {
  if (!portfolioHistoryInstance) {
    portfolioHistoryInstance = new PortfolioHistory();
  }
  return portfolioHistoryInstance;
}
