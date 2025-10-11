# 🚀 Arc Deployment Guide

## Vercel Deployment (Recommended)

Arc is optimized for Vercel and can go live in minutes.

### Step 1: GitHub Repository

1. Create a new repository on GitHub
2. Push your code:

```bash
git init
git add .
git commit -m "Arc v2.0 - Bend Money 🌈"
git branch -M main
git remote add origin https://github.com/your-username/arc-wallet.git
git push -u origin main
```

### Step 2: Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Log in with GitHub
3. Click "New Project"
4. Select your `arc-wallet` repository
5. Vercel automatically detects Next.js
6. Click "Deploy"

**Done!** Your wallet is now live on a Vercel URL like `arc-wallet-xyz.vercel.app`

### Step 3: Custom Domain (Optional)

1. Buy a domain (e.g., at Namecheap, GoDaddy)
2. Go to your Vercel project → Settings → Domains
3. Add your domain
4. Update your DNS records according to Vercel's instructions

### Step 4: Environment Variables (Optional)

For production use with your own RPC endpoints:

1. Go to Vercel Dashboard → your project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_ETHEREUM_RPC`: Your Alchemy/Infura URL
   - `NEXT_PUBLIC_SEPOLIA_RPC`: Your testnet URL (optional)
3. Redeploy your app

## Alternative: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## Alternative: Self Hosting

### With Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

```bash
docker build -t arc-wallet .
docker run -p 3000:3000 arc-wallet
```

### With PM2

```bash
npm run build
pm2 start npm --name "arc-wallet" -- start
```

## Production Checklist

Before going live, ensure:

- [ ] Own RPC endpoints (Alchemy/Infura)
- [ ] Analytics (Vercel Analytics, Google Analytics)
- [ ] Error tracking (Sentry)
- [ ] Custom domain with HTTPS
- [ ] Security headers (already configured in vercel.json)
- [ ] SEO optimization (metadata)
- [ ] Performance monitoring
- [ ] Backup strategy for users

## Security Considerations

### Important for Production

1. **RPC Endpoints**: Always use your own API keys, no public endpoints
2. **Rate Limiting**: Implement rate limiting for API calls
3. **CSP Headers**: Content Security Policy for XSS protection
4. **HTTPS Only**: Force HTTPS (automatic on Vercel)
5. **No Logging**: Never log private keys or mnemonics
6. **Client-Side Only**: Keys always stay in the browser

### Vercel Security Headers

The app already has security headers configured in `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

## Performance Optimization

### Next.js Optimizations (Already Configured)

✅ Code splitting per route
✅ Image optimization
✅ Font optimization (Inter)
✅ Static generation where possible
✅ API route caching

### Extra Optimizations

For even better performance:

```typescript
// app/layout.tsx - Preconnect to RPC
<link rel="preconnect" href="https://eth.llamarpc.com" />

// Lazy load heavy components
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <LoadingSpinner />
})
```

## Monitoring

### Vercel Analytics

Included free with Vercel deployment.

### Web Vitals

Monitor Core Web Vitals:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Custom Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

- Check if they start with `NEXT_PUBLIC_` (for client-side)
- Redeploy after adding new variables

### RPC Rate Limiting

- Upgrade to paid Alchemy/Infura plan
- Implement request caching
- Use multiple endpoints with fallback

## Costs

### Free Tier (Vercel)

- ✅ Unlimited sites
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Analytics
- ✅ 100GB bandwidth/month

Perfect for personal use and small projects.

### Scaling Up

For more traffic:
- **Pro Plan** ($20/month): 1TB bandwidth
- **Enterprise**: Custom pricing

### RPC Provider Costs

- **Alchemy Free**: 300M compute units/month
- **Infura Free**: 100k requests/day
- Usually sufficient for small to medium apps

## Deploy Updates

```bash
# Update code
git add .
git commit -m "Update: new feature"
git push

# Vercel deploys automatically!
```

## Rollback

In Vercel dashboard:
1. Go to Deployments
2. Select previous successful deployment
3. Click "Promote to Production"

## Support

Questions about deployment?
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- Open an issue in the repo

---

**Bend money with Arc!** 🌈

Deployment success! 🚀



