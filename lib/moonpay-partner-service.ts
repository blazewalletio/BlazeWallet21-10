// MoonPay Partner API Integration
// Docs: https://docs.moonpay.com/api_reference/

import { databaseService } from './database-service';

export interface MoonPayTransaction {
  id: string;
  baseCurrencyAmount: number;
  baseCurrencyCode: string;
  currencyCode: string;
  status: 'waitingPayment' | 'pending' | 'waitingAuthorization' | 'completed' | 'failed';
  walletAddress: string;
  walletAddressTag?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureCode?: string;
  failureMessage?: string;
  networkFeeAmount?: number;
  networkFeeCurrencyCode?: string;
  feeAmount?: number;
  feeCurrencyCode?: string;
  externalTransactionId?: string;
  bankTransferReference?: string;
  paymentMethod?: string;
  paymentMethodCode?: string;
  isFirstBuy?: boolean;
  isFirstSell?: boolean;
  isFirstSwap?: boolean;
  kycStatus?: 'not_started' | 'in_progress' | 'rejected' | 'completed';
  bankStatus?: 'not_started' | 'in_progress' | 'rejected' | 'completed';
  externalCustomerId?: string;
  customerId?: string;
  tag?: string;
  redirectUrl?: string;
  returnUrl?: string;
  failureUrl?: string;
  baseCurrencyPrice?: number;
  baseCurrencyPriceUsd?: number;
  baseCurrencyPriceEur?: number;
  baseCurrencyPriceGbp?: number;
  baseCurrencyPriceBtc?: number;
  baseCurrencyPriceEth?: number;
  baseCurrencyPriceBch?: number;
  baseCurrencyPriceLtc?: number;
  baseCurrencyPriceXrp?: number;
  baseCurrencyPriceBnb?: number;
  baseCurrencyPriceUsdc?: number;
  baseCurrencyPriceUsdt?: number;
  baseCurrencyPriceBusd?: number;
  baseCurrencyPriceDai?: number;
  baseCurrencyPriceMatic?: number;
  baseCurrencyPriceAvax?: number;
  baseCurrencyPriceSol?: number;
  baseCurrencyPriceDot?: number;
  baseCurrencyPriceAda?: number;
  baseCurrencyPriceLink?: number;
  baseCurrencyPriceUni?: number;
  baseCurrencyPriceAave?: number;
  baseCurrencyPriceComp?: number;
  baseCurrencyPriceMkr?: number;
  baseCurrencyPriceSnx?: number;
  baseCurrencyPriceYfi?: number;
  baseCurrencyPriceCrv?: number;
  baseCurrencyPrice1inch?: number;
  baseCurrencyPriceSushi?: number;
  baseCurrencyPriceBal?: number;
  baseCurrencyPriceRen?: number;
  baseCurrencyPriceKnc?: number;
  baseCurrencyPriceZrx?: number;
  baseCurrencyPriceBnt?: number;
  baseCurrencyPriceLrc?: number;
  baseCurrencyPriceBat?: number;
  baseCurrencyPriceZil?: number;
  baseCurrencyPriceIost?: number;
  baseCurrencyPriceCelo?: number;
  baseCurrencyPriceNear?: number;
  baseCurrencyPriceFlow?: number;
  baseCurrencyPriceAlgo?: number;
  baseCurrencyPriceAtom?: number;
  baseCurrencyPriceFtm?: number;
  baseCurrencyPriceOne?: number;
  baseCurrencyPriceHbar?: number;
  baseCurrencyPriceVet?: number;
  baseCurrencyPriceIcx?: number;
  baseCurrencyPriceOnt?: number;
  baseCurrencyPriceZec?: number;
  baseCurrencyPriceDash?: number;
  baseCurrencyPriceEos?: number;
  baseCurrencyPriceTron?: number;
  baseCurrencyPriceXlm?: number;
  baseCurrencyPriceXmr?: number;
  baseCurrencyPriceNeo?: number;
  baseCurrencyPriceQtum?: number;
  baseCurrencyPriceWaves?: number;
  baseCurrencyPriceArdr?: number;
  baseCurrencyPriceNxt?: number;
  baseCurrencyPriceDoge?: number;
  baseCurrencyPriceShib?: number;
  baseCurrencyPricePepe?: number;
  baseCurrencyPriceFloki?: number;
  baseCurrencyPriceBonk?: number;
  baseCurrencyPriceWif?: number;
  baseCurrencyPriceBome?: number;
  baseCurrencyPricePopcat?: number;
  baseCurrencyPriceMew?: number;
  baseCurrencyPriceBrett?: number;
  baseCurrencyPriceMyro?: number;
  baseCurrencyPriceJup?: number;
  baseCurrencyPriceW?: number;
  baseCurrencyPriceJto?: number;
  baseCurrencyPriceOrca?: number;
  baseCurrencyPriceRay?: number;
  baseCurrencyPricePyth?: number;
  baseCurrencyPriceJito?: number;
  baseCurrencyPriceWen?: number;
  baseCurrencyPriceDrift?: number;
  baseCurrencyPriceMargin?: number;
  baseCurrencyPriceKamino?: number;
  baseCurrencyPriceTensor?: number;
  baseCurrencyPriceMagic?: number;
  baseCurrencyPricePsy?: number;
  baseCurrencyPriceStep?: number;
  baseCurrencyPriceMedia?: number;
  baseCurrencyPriceBonk?: number;
  baseCurrencyPriceWif?: number;
  baseCurrencyPriceBome?: number;
  baseCurrencyPricePopcat?: number;
  baseCurrencyPriceMew?: number;
  baseCurrencyPriceBrett?: number;
  baseCurrencyPriceMyro?: number;
  baseCurrencyPriceJup?: number;
  baseCurrencyPriceW?: number;
  baseCurrencyPriceJto?: number;
  baseCurrencyPriceOrca?: number;
  baseCurrencyPriceRay?: number;
  baseCurrencyPricePyth?: number;
  baseCurrencyPriceJito?: number;
  baseCurrencyPriceWen?: number;
  baseCurrencyPriceDrift?: number;
  baseCurrencyPriceMargin?: number;
  baseCurrencyPriceKamino?: number;
  baseCurrencyPriceTensor?: number;
  baseCurrencyPriceMagic?: number;
  baseCurrencyPricePsy?: number;
  baseCurrencyPriceStep?: number;
  baseCurrencyPriceMedia?: number;
}

export interface MoonPayWebhookPayload {
  type: 'transaction_updated';
  data: MoonPayTransaction;
}

export interface MoonPayPartnerConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  webhookSecret: string;
}

export class MoonPayPartnerService {
  private config: MoonPayPartnerConfig;

  constructor(config: MoonPayPartnerConfig) {
    this.config = config;
  }

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<MoonPayTransaction> {
    const response = await fetch(`${this.config.baseUrl}/v1/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`MoonPay API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all transactions for a customer
  async getCustomerTransactions(customerId: string, limit = 50, offset = 0): Promise<MoonPayTransaction[]> {
    const response = await fetch(
      `${this.config.baseUrl}/v1/transactions?customerId=${customerId}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`MoonPay API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  // Create a new transaction
  async createTransaction(transactionData: {
    walletAddress: string;
    currencyCode: string;
    baseCurrencyCode: string;
    baseCurrencyAmount: number;
    externalCustomerId?: string;
    tag?: string;
    redirectUrl?: string;
    returnUrl?: string;
    failureUrl?: string;
  }): Promise<MoonPayTransaction> {
    const response = await fetch(`${this.config.baseUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      throw new Error(`MoonPay API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Process webhook payload
  async processWebhook(payload: MoonPayWebhookPayload): Promise<void> {
    if (payload.type === 'transaction_updated') {
      const transaction = payload.data;
      
      // Only process completed transactions
      if (transaction.status === 'completed') {
        await this.handleCompletedTransaction(transaction);
      }
    }
  }

  // Handle completed transaction - trigger automatic withdrawal
  private async handleCompletedTransaction(transaction: MoonPayTransaction): Promise<void> {
    try {
      console.log(`🔄 Processing completed transaction: ${transaction.id}`);
      
      // Get the Blaze wallet address from the transaction
      const blazeWalletAddress = transaction.walletAddress;
      
      if (!blazeWalletAddress) {
        console.error(`❌ No wallet address found for transaction: ${transaction.id}`);
        return;
      }

      // Create withdrawal record in database
      await this.createWithdrawalRecord(transaction);
      
      // Trigger automatic withdrawal
      await this.triggerAutomaticWithdrawal(transaction);
      
      console.log(`✅ Successfully processed transaction: ${transaction.id}`);
    } catch (error) {
      console.error(`❌ Error processing transaction ${transaction.id}:`, error);
    }
  }

  // Create withdrawal record in database
  private async createWithdrawalRecord(transaction: MoonPayTransaction): Promise<void> {
    const withdrawalData = {
      moonpayTransactionId: transaction.id,
      walletAddress: transaction.walletAddress,
      currencyCode: transaction.currencyCode,
      amount: transaction.baseCurrencyAmount,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      completedAt: transaction.completedAt,
      externalTransactionId: transaction.externalTransactionId,
    };

    // Store in database
    await databaseService.createWithdrawalRecord(withdrawalData);
    
    // Also create transaction history record
    await databaseService.createTransactionRecord({
      userId: transaction.externalCustomerId || 'unknown',
      walletAddress: transaction.walletAddress,
      currencyCode: transaction.currencyCode,
      amount: transaction.baseCurrencyAmount,
      status: transaction.status,
      moonpayTransactionId: transaction.id,
      createdAt: new Date().toISOString(),
      completedAt: transaction.completedAt,
      failureReason: transaction.failureReason,
    });
  }

  // Trigger automatic withdrawal to Blaze wallet
  private async triggerAutomaticWithdrawal(transaction: MoonPayTransaction): Promise<void> {
    try {
      // Determine the correct withdrawal method based on currency
      const currencyCode = transaction.currencyCode;
      
      if (currencyCode === 'sol' || currencyCode === 'usdc_sol' || currencyCode === 'usdt_sol') {
        await this.withdrawToSolanaWallet(transaction);
      } else if (currencyCode === 'eth' || currencyCode === 'usdt' || currencyCode === 'usdc') {
        await this.withdrawToEthereumWallet(transaction);
      } else {
        console.warn(`⚠️ Unsupported currency for withdrawal: ${currencyCode}`);
      }
    } catch (error) {
      console.error(`❌ Error triggering withdrawal for transaction ${transaction.id}:`, error);
    }
  }

  // Withdraw to Solana wallet
  private async withdrawToSolanaWallet(transaction: MoonPayTransaction): Promise<void> {
    try {
      // Update withdrawal status to processing
      const withdrawalRecord = await databaseService.getWithdrawalByMoonPayId(transaction.id);
      if (withdrawalRecord) {
        await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { status: 'processing' });
      }

      // Convert Ethereum address to Solana address if needed
      const solanaAddress = await this.convertToSolanaAddress(transaction.walletAddress);
      
      if (!solanaAddress) {
        console.error(`❌ Could not convert address to Solana format: ${transaction.walletAddress}`);
        if (withdrawalRecord) {
          await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { 
            status: 'failed',
            failureReason: 'Address conversion failed'
          });
        }
        return;
      }

      // Use MoonPay's withdrawal API for Solana
      const withdrawalResponse = await fetch(`${this.config.baseUrl}/v1/transactions/${transaction.id}/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: solanaAddress,
          currencyCode: transaction.currencyCode,
          amount: transaction.baseCurrencyAmount,
        }),
      });

      if (!withdrawalResponse.ok) {
        const errorText = await withdrawalResponse.text();
        throw new Error(`Withdrawal failed: ${withdrawalResponse.status} ${errorText}`);
      }

      const withdrawalResult = await withdrawalResponse.json();
      
      // Update withdrawal record with success
      if (withdrawalRecord) {
        await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { 
          status: 'completed',
          withdrawalHash: withdrawalResult.transactionHash,
          completedAt: new Date().toISOString()
        });
      }

      console.log(`✅ Solana withdrawal completed for transaction: ${transaction.id}`);
    } catch (error) {
      console.error(`❌ Error withdrawing to Solana wallet:`, error);
      
      // Update withdrawal record with failure
      const withdrawalRecord = await databaseService.getWithdrawalByMoonPayId(transaction.id);
      if (withdrawalRecord) {
        await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { 
          status: 'failed',
          failureReason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Withdraw to Ethereum wallet
  private async withdrawToEthereumWallet(transaction: MoonPayTransaction): Promise<void> {
    try {
      // Update withdrawal status to processing
      const withdrawalRecord = await databaseService.getWithdrawalByMoonPayId(transaction.id);
      if (withdrawalRecord) {
        await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { status: 'processing' });
      }

      // Use MoonPay's withdrawal API for Ethereum
      const withdrawalResponse = await fetch(`${this.config.baseUrl}/v1/transactions/${transaction.id}/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: transaction.walletAddress,
          currencyCode: transaction.currencyCode,
          amount: transaction.baseCurrencyAmount,
        }),
      });

      if (!withdrawalResponse.ok) {
        const errorText = await withdrawalResponse.text();
        throw new Error(`Withdrawal failed: ${withdrawalResponse.status} ${errorText}`);
      }

      const withdrawalResult = await withdrawalResponse.json();
      
      // Update withdrawal record with success
      if (withdrawalRecord) {
        await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { 
          status: 'completed',
          withdrawalHash: withdrawalResult.transactionHash,
          completedAt: new Date().toISOString()
        });
      }

      console.log(`✅ Ethereum withdrawal completed for transaction: ${transaction.id}`);
    } catch (error) {
      console.error(`❌ Error withdrawing to Ethereum wallet:`, error);
      
      // Update withdrawal record with failure
      const withdrawalRecord = await databaseService.getWithdrawalByMoonPayId(transaction.id);
      if (withdrawalRecord) {
        await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { 
          status: 'failed',
          failureReason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Convert Ethereum address to Solana address (if needed)
  private async convertToSolanaAddress(ethereumAddress: string): Promise<string | null> {
    // This is a placeholder - in reality, you'd need to implement proper address conversion
    // or use a service that can convert between different blockchain address formats
    
    // For now, we'll assume the address is already in the correct format
    // In a real implementation, you might:
    // 1. Check if the address is already Solana format
    // 2. Use a conversion service
    // 3. Generate a new Solana address for the user
    
    return ethereumAddress; // Placeholder
  }

  // Get transaction status for frontend
  async getTransactionStatus(transactionId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    completedAt?: string;
    failureReason?: string;
  }> {
    const transaction = await this.getTransaction(transactionId);
    
    return {
      status: transaction.status,
      amount: transaction.baseCurrencyAmount,
      currency: transaction.currencyCode,
      completedAt: transaction.completedAt,
      failureReason: transaction.failureReason,
    };
  }
}

// Export singleton instance
export const moonPayPartnerService = new MoonPayPartnerService({
  apiKey: process.env.MOONPAY_API_KEY || '',
  secretKey: process.env.MOONPAY_SECRET_KEY || '',
  baseUrl: process.env.MOONPAY_BASE_URL || 'https://api.moonpay.com',
  webhookSecret: process.env.MOONPAY_WEBHOOK_SECRET || '',
});
