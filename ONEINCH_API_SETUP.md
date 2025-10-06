# 🔑 1inch API Key Setup - 5 Minuten Gids

## Stap 1: Maak Account (2 minuten)

1. Ga naar: **https://portal.1inch.dev/**
2. Klik "Sign Up" (rechts boven)
3. Vul in:
   - Email: [jouw email]
   - Wachtwoord: [sterk wachtwoord]
4. Bevestig email

---

## Stap 2: Maak API Key (1 minuut)

1. Log in op https://portal.1inch.dev/
2. Ga naar **"Applications"** (links in menu)
3. Klik **"Create Application"**
4. Vul in:
   - Name: `Arc Wallet Production`
   - Description: `Crypto wallet swap aggregation`
5. Klik **"Create"**
6. **Kopieer de API Key** (bewaar veilig!)

---

## Stap 3: Voeg Toe aan Vercel (2 minuten)

### Via Vercel Dashboard:

1. Ga naar: https://vercel.com/dashboard
2. Selecteer project: **arcwallet**
3. Ga naar: **Settings → Environment Variables**
4. Klik **"Add New"**
5. Vul in:
   ```
   Name:  ONEINCH_API_KEY
   Value: [plak hier je API key]
   ```
6. Selecteer:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. Klik **"Save"**

### Of via Terminal:

```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app"

# Voeg toe aan Vercel
npx vercel env add ONEINCH_API_KEY production
# [Plak je API key en druk Enter]

npx vercel env add ONEINCH_API_KEY preview
# [Plak je API key en druk Enter]

# Redeploy
npx vercel --prod
```

---

## Stap 4: Verify (30 seconden)

1. Open: https://arcwallet.vercel.app
2. Hard refresh: Cmd + Shift + R
3. Open Swap modal
4. Type: 0.005 ETH → USDT
5. Zou moeten zien: **"Powered by: 1inch"** ✅

---

## 🎯 Gratis Tier Limits

**1inch Free Tier:**
- ✅ 1,000,000 requests/maand
- ✅ Alle chains ondersteund
- ✅ Volledige functionaliteit
- ✅ Rate limit: 100 requests/minuut

**Arc wallet gebruik (schatting):**
- ~10 quote requests per swap (typing)
- ~1 transaction per swap (execute)
- 100 swaps/dag = ~1,100 requests
- 3,000 swaps/maand = ~33,000 requests

**Conclusie: Ruim binnen gratis tier! ✅**

---

## 🔍 Troubleshooting

### "Invalid API Key"
```bash
# Check of key correct is toegevoegd:
npx vercel env ls

# Zou moeten zien:
# ONEINCH_API_KEY | production, preview | ...
```

### "Rate Limit Exceeded"
```
→ Wacht 1 minuut
→ Of upgrade naar paid tier ($49/maand voor 10M requests)
```

### "Chain not supported"
```
1inch ondersteunt:
✅ Ethereum (1)
✅ BSC (56)
✅ Polygon (137)
✅ Arbitrum (42161)
✅ Optimism (10)
✅ Base (8453)
✅ Avalanche (43114)
✅ Gnosis (100)
✅ Klaytn (8217)
✅ Aurora (1313161554)
```

---

## 📊 Monitoring

**Check API usage:**
1. Ga naar: https://portal.1inch.dev/
2. Klik "Dashboard"
3. Zie real-time stats:
   - Requests today
   - Success rate
   - Error types
   - Rate limit status

---

## 🚀 Je Bent Klaar!

Na deze setup:
- ✅ 1inch swaps werken
- ✅ Beste routing (100+ DEXes)
- ✅ MEV protection
- ✅ Chi gas optimization
- ✅ 1M gratis requests/maand

**Later upgraden naar Uniswap SDK kan altijd nog! De fallback zit er al in.**

---

## 💡 Pro Tips

**Productie tips:**
```javascript
// Monitor API usage weekly
// Bij >500K requests/maand: overweeg paid tier
// Bij >1M requests/maand: switch naar Uniswap SDK primary
```

**Performance tips:**
```javascript
// Debounce quote requests (al geïmplementeerd)
// Cache quotes voor 10 seconden
// Gebruik Uniswap SDK voor heavy users
```

**Security tips:**
```javascript
✅ API key alleen server-side (NEVER client-side)
✅ Rotate key elk kwartaal
✅ Monitor voor suspicious activity
✅ Rate limit per user (TODO)
```

---

**Klaar om te beginnen? Volg de stappen en je hebt werkende swaps binnen 5 minuten! 🔥**
