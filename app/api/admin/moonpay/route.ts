// Admin API endpoint for MoonPay statistics and management
import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'stats':
        const withdrawalStats = await databaseService.getWithdrawalStats();
        const transactionStats = await databaseService.getTransactionStats();
        
        return NextResponse.json({
          withdrawals: withdrawalStats,
          transactions: transactionStats,
        });

      case 'withdrawals':
        const withdrawals = await databaseService.getWithdrawalsByWallet('all');
        return NextResponse.json(withdrawals);

      case 'transactions':
        const transactions = await databaseService.getTransactionHistory('all');
        return NextResponse.json(transactions);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in admin API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Manual withdrawal trigger (for admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, action } = body;

    if (!transactionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    switch (action) {
      case 'retry_withdrawal':
        // Get the withdrawal record
        const withdrawalRecord = await databaseService.getWithdrawalByMoonPayId(transactionId);
        
        if (!withdrawalRecord) {
          return NextResponse.json({ error: 'Withdrawal record not found' }, { status: 404 });
        }

        // Reset status to pending for retry
        await databaseService.updateWithdrawalRecord(withdrawalRecord.id, { 
          status: 'pending',
          failureReason: undefined
        });

        return NextResponse.json({ success: true, message: 'Withdrawal retry initiated' });

      case 'cancel_withdrawal':
        // Cancel the withdrawal
        const cancelRecord = await databaseService.getWithdrawalByMoonPayId(transactionId);
        
        if (!cancelRecord) {
          return NextResponse.json({ error: 'Withdrawal record not found' }, { status: 404 });
        }

        await databaseService.updateWithdrawalRecord(cancelRecord.id, { 
          status: 'failed',
          failureReason: 'Cancelled by admin'
        });

        return NextResponse.json({ success: true, message: 'Withdrawal cancelled' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in admin POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
