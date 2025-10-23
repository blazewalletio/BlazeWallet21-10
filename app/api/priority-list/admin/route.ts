import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Admin email whitelist
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

// GET /api/priority-list/admin - Admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('admin');
    
    // Check admin authorization
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all registrations
    const { data: registrations, error: regError } = await supabase
      .from('priority_list_registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (regError) {
      console.error('Error fetching registrations:', regError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch registrations' },
        { status: 500 }
      );
    }

    // Get stats
    const { data: stats, error: statsError } = await supabase
      .from('priority_list_stats')
      .select('*')
      .single();

    if (statsError) {
      console.error('Error fetching stats:', statsError);
    }

    // Get leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('referral_leaderboard')
      .select('*')
      .limit(20);

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
    }

    return NextResponse.json({
      success: true,
      data: {
        registrations: registrations || [],
        stats: stats || null,
        leaderboard: leaderboard || [],
      },
    });
  } catch (error) {
    console.error('Error in admin API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/priority-list/admin - Admin actions (verify, delete, etc)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, action, walletAddress } = body;
    
    // Check admin authorization
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!action || !walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Action and wallet address required' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'verify':
        const { error: verifyError } = await supabase
          .from('priority_list_registrations')
          .update({ is_verified: true })
          .eq('wallet_address', walletAddress.toLowerCase());

        if (verifyError) {
          console.error('Verify error:', verifyError);
          return NextResponse.json(
            { success: false, message: 'Failed to verify registration' },
            { status: 500 }
          );
        }

        // Log admin action
        await supabase.from('admin_actions').insert({
          admin_email: adminEmail,
          action_type: 'verify',
          target_wallet: walletAddress,
        });

        return NextResponse.json({
          success: true,
          message: 'Registration verified successfully',
        });

      case 'delete':
        const { error: deleteError } = await supabase
          .from('priority_list_registrations')
          .delete()
          .eq('wallet_address', walletAddress.toLowerCase());

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return NextResponse.json(
            { success: false, message: 'Failed to delete registration' },
            { status: 500 }
          );
        }

        // Log admin action
        await supabase.from('admin_actions').insert({
          admin_email: adminEmail,
          action_type: 'delete',
          target_wallet: walletAddress,
        });

        return NextResponse.json({
          success: true,
          message: 'Registration deleted successfully',
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in admin action:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

