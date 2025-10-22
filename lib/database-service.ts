// Database service for MoonPay transaction tracking
// Uses a simple JSON file storage for now, can be upgraded to a real database later

import fs from 'fs';
import path from 'path';

export interface WithdrawalRecord {
  id: string;
  moonpayTransactionId: string;
  walletAddress: string;
  currencyCode: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  externalTransactionId?: string;
  failureReason?: string;
  withdrawalHash?: string;
}

export interface TransactionHistory {
  id: string;
  userId: string;
  walletAddress: string;
  currencyCode: string;
  amount: number;
  status: string;
  moonpayTransactionId: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

class DatabaseService {
  private dataDir: string;
  private withdrawalsFile: string;
  private transactionsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.withdrawalsFile = path.join(this.dataDir, 'withdrawals.json');
    this.transactionsFile = path.join(this.dataDir, 'transactions.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    this.initializeFiles();
  }

  private initializeFiles(): void {
    if (!fs.existsSync(this.withdrawalsFile)) {
      fs.writeFileSync(this.withdrawalsFile, JSON.stringify([], null, 2));
    }
    
    if (!fs.existsSync(this.transactionsFile)) {
      fs.writeFileSync(this.transactionsFile, JSON.stringify([], null, 2));
    }
  }

  // Withdrawal Records
  async createWithdrawalRecord(data: Omit<WithdrawalRecord, 'id'>): Promise<WithdrawalRecord> {
    const withdrawals = this.getWithdrawals();
    
    const newRecord: WithdrawalRecord = {
      id: this.generateId(),
      ...data,
    };
    
    withdrawals.push(newRecord);
    this.saveWithdrawals(withdrawals);
    
    console.log('📝 Created withdrawal record:', newRecord.id);
    return newRecord;
  }

  async getWithdrawalRecord(id: string): Promise<WithdrawalRecord | null> {
    const withdrawals = this.getWithdrawals();
    return withdrawals.find(w => w.id === id) || null;
  }

  async getWithdrawalByMoonPayId(moonpayTransactionId: string): Promise<WithdrawalRecord | null> {
    const withdrawals = this.getWithdrawals();
    return withdrawals.find(w => w.moonpayTransactionId === moonpayTransactionId) || null;
  }

  async updateWithdrawalRecord(id: string, updates: Partial<WithdrawalRecord>): Promise<WithdrawalRecord | null> {
    const withdrawals = this.getWithdrawals();
    const index = withdrawals.findIndex(w => w.id === id);
    
    if (index === -1) {
      return null;
    }
    
    withdrawals[index] = { ...withdrawals[index], ...updates };
    this.saveWithdrawals(withdrawals);
    
    console.log('📝 Updated withdrawal record:', id);
    return withdrawals[index];
  }

  async getWithdrawalsByWallet(walletAddress: string): Promise<WithdrawalRecord[]> {
    const withdrawals = this.getWithdrawals();
    return withdrawals.filter(w => w.walletAddress === walletAddress);
  }

  // Transaction History
  async createTransactionRecord(data: Omit<TransactionHistory, 'id'>): Promise<TransactionHistory> {
    const transactions = this.getTransactions();
    
    const newRecord: TransactionHistory = {
      id: this.generateId(),
      ...data,
    };
    
    transactions.push(newRecord);
    this.saveTransactions(transactions);
    
    console.log('📝 Created transaction record:', newRecord.id);
    return newRecord;
  }

  async getTransactionHistory(userId: string): Promise<TransactionHistory[]> {
    const transactions = this.getTransactions();
    return transactions.filter(t => t.userId === userId);
  }

  async getTransactionByMoonPayId(moonpayTransactionId: string): Promise<TransactionHistory | null> {
    const transactions = this.getTransactions();
    return transactions.find(t => t.moonpayTransactionId === moonpayTransactionId) || null;
  }

  async updateTransactionRecord(id: string, updates: Partial<TransactionHistory>): Promise<TransactionHistory | null> {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      return null;
    }
    
    transactions[index] = { ...transactions[index], ...updates };
    this.saveTransactions(transactions);
    
    console.log('📝 Updated transaction record:', id);
    return transactions[index];
  }

  // Helper methods
  private getWithdrawals(): WithdrawalRecord[] {
    try {
      const data = fs.readFileSync(this.withdrawalsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading withdrawals file:', error);
      return [];
    }
  }

  private saveWithdrawals(withdrawals: WithdrawalRecord[]): void {
    try {
      fs.writeFileSync(this.withdrawalsFile, JSON.stringify(withdrawals, null, 2));
    } catch (error) {
      console.error('Error saving withdrawals file:', error);
    }
  }

  private getTransactions(): TransactionHistory[] {
    try {
      const data = fs.readFileSync(this.transactionsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading transactions file:', error);
      return [];
    }
  }

  private saveTransactions(transactions: TransactionHistory[]): void {
    try {
      fs.writeFileSync(this.transactionsFile, JSON.stringify(transactions, null, 2));
    } catch (error) {
      console.error('Error saving transactions file:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Statistics
  async getWithdrawalStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    totalAmount: number;
  }> {
    const withdrawals = this.getWithdrawals();
    
    return {
      total: withdrawals.length,
      pending: withdrawals.filter(w => w.status === 'pending').length,
      completed: withdrawals.filter(w => w.status === 'completed').length,
      failed: withdrawals.filter(w => w.status === 'failed').length,
      totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    };
  }

  async getTransactionStats(): Promise<{
    total: number;
    byCurrency: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const transactions = this.getTransactions();
    
    const byCurrency: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    transactions.forEach(t => {
      byCurrency[t.currencyCode] = (byCurrency[t.currencyCode] || 0) + 1;
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    });
    
    return {
      total: transactions.length,
      byCurrency,
      byStatus,
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
