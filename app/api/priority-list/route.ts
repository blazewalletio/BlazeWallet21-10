import { NextRequest, NextResponse } from 'next/server';
import { PriorityListService } from '@/lib/priority-list-service';

// GET /api/priority-list - Get priority list status and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    // Get stats
    const stats = await PriorityListService.getStats();
    
    // Get timing info
    const timing = {
      timeUntilRegistration: PriorityListService.getTimeUntilRegistration(),
      timeUntilPresale: PriorityListService.getTimeUntilPresale(),
      timeUntilExclusivityEnd: PriorityListService.getTimeUntilExclusivityEnd(),
    };

    // Get status flags
    const isRegistrationOpen = PriorityListService.isRegistrationOpen();
    const isPriorityOnlyPhase = PriorityListService.isPriorityOnlyPhase();
    const isPresaleOpenToAll = PriorityListService.isPresaleOpenToAll();

    // Get user entry if wallet provided
    let userEntry = null;
    let userReferrals: any[] = [];
    if (walletAddress) {
      userEntry = await PriorityListService.getRegistration(walletAddress);
      if (userEntry) {
        userReferrals = await PriorityListService.getUserReferrals(walletAddress);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: stats || {
          total_registered: 0,
          verified_count: 0,
          referral_count: 0,
          early_bird_count: 0,
          email_provided_count: 0,
          last_registration: null,
        },
        isRegistrationOpen,
        isPriorityOnlyPhase,
        isPresaleOpenToAll,
        userEntry,
        userReferrals,
        timing,
      },
    });
  } catch (error) {
    console.error('Error fetching priority list status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch priority list status' },
      { status: 500 }
    );
  }
}

// POST /api/priority-list - Register for priority list
export async function POST(request: NextRequest) {
  try {
    console.log('🔥 API: Priority list registration request received');
    
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const { walletAddress, email, telegram, twitter, referralCode } = body;
    
    console.log('🔍 Parsed fields:', {
      walletAddress,
      email,
      telegram,
      twitter,
      referralCode
    });

    if (!walletAddress) {
      console.error('❌ Missing wallet address');
      return NextResponse.json(
        { success: false, message: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    console.log('✅ Wallet address present, calling PriorityListService...');

    const result = await PriorityListService.registerForPriorityList(walletAddress, {
      email,
      telegram,
      twitter,
      referralCode,
    });
    
    console.log('📥 Service result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Registration successful!');
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          entry: result.entry,
          position: result.position,
          isEarlyBird: result.isEarlyBird,
        },
      });
    } else {
      console.error('❌ Registration failed:', result.message);
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('💥 API Error registering for priority list:', error);
    console.error('💥 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, message: 'Failed to register for priority list' },
      { status: 500 }
    );
  }
}
