#!/bin/bash

# Script to automatically promote latest deployment to production
# Run this after each deployment to ensure latest is always production

echo "🚀 Promoting latest deployment to production..."

# Get the latest deployment ID
LATEST_DEPLOYMENT=$(vercel ls --json | jq -r '.[0].uid')

if [ -z "$LATEST_DEPLOYMENT" ]; then
    echo "❌ No deployments found"
    exit 1
fi

echo "📦 Latest deployment: $LATEST_DEPLOYMENT"

# Promote to production
vercel promote $LATEST_DEPLOYMENT --prod

echo "✅ Successfully promoted to production!"
echo "🌐 Your domain should now point to the latest deployment"
