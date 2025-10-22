# MoonPay Partner API Configuration Guide

## Required Environment Variables

Add these to your Vercel environment variables:

### 1. MoonPay API Keys
```
MOONPAY_API_KEY=pk_live_YOUR_API_KEY_HERE
MOONPAY_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
```

### 2. MoonPay Configuration
```
MOONPAY_BASE_URL=https://api.moonpay.com
MOONPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Application URLs
```
NEXT_PUBLIC_BASE_URL=https://my.blazewallet.io
```

## How to Get MoonPay Partner API Keys

1. **Apply for MoonPay Partner Program**
   - Go to: https://www.moonpay.com/partners
   - Fill out the application form
   - Wait for approval (usually 1-2 weeks)

2. **Get API Keys**
   - Once approved, you'll receive:
     - `pk_live_...` (Public API Key)
     - `sk_live_...` (Secret API Key)
     - Webhook secret for verification

3. **Configure Webhook**
   - Set webhook URL: `https://my.blazewallet.io/api/webhooks/moonpay`
   - Use the provided webhook secret

## Setup Instructions

1. **Add Environment Variables to Vercel**
   ```bash
   vercel env add MOONPAY_API_KEY production
   vercel env add MOONPAY_SECRET_KEY production
   vercel env add MOONPAY_WEBHOOK_SECRET production
   vercel env add NEXT_PUBLIC_BASE_URL production
   ```

2. **Deploy the Application**
   ```bash
   git add .
   git commit -m "Add MoonPay Partner API integration"
   git push origin main
   ```

3. **Test the Integration**
   - Create a test transaction
   - Check webhook logs in Vercel
   - Verify automatic withdrawal

## Features Included

✅ **Automatic Withdrawal**: Crypto automatically sent to user's Blaze wallet
✅ **Real-time Status**: Transaction status updates in real-time
✅ **Webhook Integration**: Secure webhook handling with signature verification
✅ **Database Tracking**: Complete transaction history and withdrawal records
✅ **Multi-chain Support**: Works with Ethereum, Solana, and other supported chains
✅ **Admin Dashboard**: Statistics and manual withdrawal management
✅ **Error Handling**: Comprehensive error handling and retry mechanisms

## Security Features

- Webhook signature verification
- API key authentication
- Transaction validation
- Error logging and monitoring
- Rate limiting protection
