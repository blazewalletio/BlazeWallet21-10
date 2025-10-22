import { NextRequest, NextResponse } from 'next/server';
import { priorityListService } from '@/lib/priority-list-service';

// GET /api/priority-list - Get priority list status and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    const stats = priorityListService.getStats();
    const isRegistrationOpen = priorityListService.isRegistrationOpen();
    const isPriorityOnlyPhase = priorityListService.isPriorityOnlyPhase();
    const isPresaleOpenToAll = priorityListService.isPresaleOpenToAll();

    let userEntry = null;
    if (walletAddress) {
      userEntry = priorityListService.getPriorityEntry(walletAddress);
    }

    const timeUntilRegistration = priorityListService.getTimeUntilRegistration();
    const timeUntilPresale = priorityListService.getTimeUntilPresale();
    const timeUntilExclusivityEnd = priorityListService.getTimeUntilExclusivityEnd();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        isRegistrationOpen,
        isPriorityOnlyPhase,
        isPresaleOpenToAll,
        userEntry,
        timing: {
          timeUntilRegistration,
          timeUntilPresale,
          timeUntilExclusivityEnd,
        },
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
    const body = await request.json();
    const { walletAddress, email, telegram, twitter, referralCode } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const result = await priorityListService.registerForPriorityList(walletAddress, {
      email,
      telegram,
      twitter,
      referralCode,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.entry,
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error registering for priority list:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register for priority list' },
      { status: 500 }
    );
  }
}

// PUT /api/priority-list - Verify entry (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, action } = body;

    if (!walletAddress || !action) {
      return NextResponse.json(
        { success: false, message: 'Wallet address and action are required' },
        { status: 400 }
      );
    }

    if (action === 'verify') {
      const success = priorityListService.verifyEntry(walletAddress);
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Entry verified successfully',
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Entry not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating priority list entry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update entry' },
      { status: 500 }
    );
  }
}
