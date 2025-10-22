// MoonPay Webhook Endpoint
// Handles transaction updates from MoonPay

import { NextRequest, NextResponse } from 'next/server';
import { moonPayPartnerService } from '@/lib/moonpay-partner-service';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    
    // Get the signature from headers
    const signature = request.headers.get('x-moonpay-signature');
    
    if (!signature) {
      console.error('❌ No signature found in webhook request');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify the webhook signature
    const isValidSignature = moonPayPartnerService.verifyWebhookSignature(body, signature);
    
    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    
    console.log('📨 Received MoonPay webhook:', payload);

    // Process the webhook
    await moonPayPartnerService.processWebhook(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error processing MoonPay webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('challenge');
  
  if (challenge) {
    // MoonPay webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ message: 'MoonPay webhook endpoint is active' });
}
