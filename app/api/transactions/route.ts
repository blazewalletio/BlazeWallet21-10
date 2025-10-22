// API endpoint to get transaction status
import { NextRequest, NextResponse } from 'next/server';
import { moonPayPartnerService } from '@/lib/moonpay-partner-service';
import { databaseService } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId');
    const walletAddress = url.searchParams.get('walletAddress');
    
    if (!transactionId && !walletAddress) {
      return NextResponse.json({ error: 'Missing transactionId or walletAddress' }, { status: 400 });
    }

    if (transactionId) {
      // Get specific transaction status
      const status = await moonPayPartnerService.getTransactionStatus(transactionId);
      return NextResponse.json(status);
    }

    if (walletAddress) {
      // Get all transactions for wallet
      const withdrawals = await databaseService.getWithdrawalsByWallet(walletAddress);
      return NextResponse.json(withdrawals);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// API endpoint to create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, currencyCode, baseCurrencyCode, baseCurrencyAmount, externalCustomerId } = body;

    if (!walletAddress || !currencyCode || !baseCurrencyCode || !baseCurrencyAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create transaction via MoonPay Partner API
    const transaction = await moonPayPartnerService.createTransaction({
      walletAddress,
      currencyCode,
      baseCurrencyCode,
      baseCurrencyAmount,
      externalCustomerId,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/transactions`,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/transactions`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/transactions?error=true`,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}