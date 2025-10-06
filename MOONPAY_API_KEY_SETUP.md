# MoonPay API Key Setup voor Blaze Wallet

## ✅ Status: MoonPay Volledig Geïmplementeerd!

Blaze Wallet is nu volledig klaar voor MoonPay. Zodra je een Partner API key ontvangt, kun je deze in 2 minuten toevoegen!

---

## 🔑 Wanneer krijg je de API Key?

Na approval van MoonPay ontvang je:
- **Test Key:** `pk_test_...` (voor testing)
- **Live Key:** `pk_live_...` (voor productie)

---

## 📋 Stap 1: API Key Toevoegen aan Vercel

### **Via Vercel Dashboard:**

1. Ga naar: https://vercel.com/rick-schlimbacks-projects/arcwallet
2. Klik op **Settings** tab
3. Klik op **Environment Variables** in sidebar
4. Klik op **Add New**
5. Vul in:
   - **Name:** `NEXT_PUBLIC_MOONPAY_API_KEY`
   - **Value:** `pk_live_YOUR_API_KEY_HERE`
   - **Environment:** Production, Preview, Development (alle 3 aanvinken)
6. Klik **Save**

### **Via Terminal (Alternatief):**

```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app"
npx vercel env add NEXT_PUBLIC_MOONPAY_API_KEY production
# Plak je API key wanneer gevraagd
```

---

## 📋 Stap 2: Code Uncomment (Eenmalig)

Open: `components/BuyModal.tsx`

**Zoek deze regel (regel 27):**
```typescript
// apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY, // Add when you have partner account
```

**Verander naar:**
```typescript
apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY, // Partner revenue share active!
```

**Snel via terminal:**
```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app"

# Backup maken
cp components/BuyModal.tsx components/BuyModal.tsx.backup

# Uncomment de regel
sed -i '' 's|// apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY,|apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY,|g' components/BuyModal.tsx
```

---

## 📋 Stap 3: Deploy

```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app"
git add components/BuyModal.tsx
git commit -m "feat: Activate MoonPay partner API key"
npx vercel --prod --yes
npx vercel alias set [NEW_DEPLOYMENT_URL] arcwallet.vercel.app
```

Of gewoon via Vercel Dashboard → **Redeploy** knop (na env var toevoegen)

---

## ✅ Verificatie: Werkt het?

1. Open: https://arcwallet.vercel.app
2. Klik op **Koop** button
3. Selecteer een crypto (bijv. ETH)
4. MoonPay widget opent
5. Check de URL - moet je API key bevatten:
   ```
   https://buy.moonpay.com?apiKey=pk_live_...
   ```

Als je API key in de URL staat = **Revenue share actief!** 💰

---

## 💰 Test Commissie

Om te testen of commissie werkt:

1. Doe een **test transactie** (klein bedrag)
2. Log in op MoonPay Partner Dashboard
3. Ga naar **Analytics** → **Transactions**
4. Check of transactie zichtbaar is
5. Check of commissie berekend wordt

---

## 🎨 Extra: Custom Branding (Optioneel)

In `lib/moonpay-service.ts` kun je customizen:

```typescript
static openWidget(config: MoonPayConfig) {
  const params = new URLSearchParams({
    walletAddress: config.walletAddress,
    currencyCode: config.currencyCode,
    baseCurrencyCode: config.baseCurrencyCode || 'eur',
    apiKey: config.apiKey,
    
    // 🎨 Branding opties (optioneel):
    colorCode: '%238B5CF6', // Blaze purple (al ingesteld!)
    theme: 'dark', // Dark theme (al ingesteld!)
    language: 'nl', // Dutch (al ingesteld!)
    
    // Extra opties (als je wilt):
    // email: 'user@example.com', // Pre-fill user email
    // externalCustomerId: 'user123', // Je interne user ID
  });
  
  // ... rest van code
}
```

---

## 📊 MoonPay Partner Dashboard

Na approval krijg je toegang tot:

**URL:** https://dashboard.moonpay.com

**Features:**
- Real-time transactie tracking
- Revenue reports
- Commissie overzicht
- User analytics
- API usage stats
- Payout management

---

## 🔒 Security Best Practices

### **Belangrijk:**
- ✅ API key in Vercel Environment Variables (veilig)
- ✅ `NEXT_PUBLIC_` prefix (frontend kan gebruiken)
- ❌ NOOIT API key in GitHub committen
- ❌ NOOIT API key delen

### **Als API Key Leaked:**
1. Log in op MoonPay Dashboard
2. Ga naar **Settings** → **API Keys**
3. Klik **Regenerate Key**
4. Update Vercel env var met nieuwe key
5. Redeploy

---

## 💡 Testing met Test Key

**Voor je live gaat:**

1. Gebruik `pk_test_...` key eerst
2. Test transacties in Sandbox mode
3. Verifieer dat alles werkt
4. Dan pas switchen naar `pk_live_...`

**Test key toevoegen:**
```
Name: NEXT_PUBLIC_MOONPAY_API_KEY
Value: pk_test_YOUR_TEST_KEY
Environment: Development
```

**Live key toevoegen:**
```
Name: NEXT_PUBLIC_MOONPAY_API_KEY
Value: pk_live_YOUR_LIVE_KEY
Environment: Production, Preview
```

---

## 📞 Support

**MoonPay Issues:**
- Dashboard: https://dashboard.moonpay.com
- Docs: https://docs.moonpay.com
- Support: partners@moonpay.com

**API Key Problems:**
- Check Vercel env vars: https://vercel.com/rick-schlimbacks-projects/arcwallet/settings/environment-variables
- Check deployed version has latest code
- Check browser console voor errors

---

## 🚀 Quick Reference

**Wat is al klaar:**
- ✅ MoonPay service (`lib/moonpay-service.ts`)
- ✅ BuyModal integratie (`components/BuyModal.tsx`)
- ✅ Multi-chain support
- ✅ Currency mapping
- ✅ Dutch language
- ✅ Dark theme
- ✅ Blaze branding

**Wat moet je doen als je API key hebt:**
1. Add env var in Vercel (2 min)
2. Uncomment API key line in code (1 min)
3. Deploy (2 min)
4. Test (5 min)
5. **Done!** 🎉

---

## 📈 Expected Revenue

**Met je API key actief:**

```
1,000 users × €100 avg purchase = €100,000 volume
€100,000 × 0.2% commission = €200/maand
= €2,400/jaar

10,000 users × €100 = €1,000,000 volume
€1,000,000 × 0.25% = €2,500/maand
= €30,000/jaar! 💰
```

---

**Blaze Wallet is 100% klaar voor MoonPay revenue share! 🔥**

Zodra je de API key hebt → 5 minuten werk → Geld verdienen! 💸
