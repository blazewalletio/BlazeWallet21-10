# 🔑 Block Explorer API Keys Setup

## Waarom Heb Je API Keys Nodig?

Vanaf **oktober 2024** heeft Etherscan hun API geüpdatet naar **V2** en deze vereist een API key voor transaction history. Zonder API key zie je **geen transacties** in BLAZE Wallet!

---

## ✅ Gratis API Keys Aanvragen

### 1. **Etherscan** (voor Ethereum & Sepolia)

**Stappen:**
1. Ga naar: https://etherscan.io/register
2. Maak een gratis account aan
3. Verifieer je email
4. Ga naar: https://etherscan.io/myapikey
5. Click "Add" om een nieuwe API key te maken
6. Kopieer je API key

**Rate Limits (Gratis):**
- 5 calls per seconde
- 100,000 calls per dag
- **Meer dan genoeg voor Arc!**

---

### 2. **BscScan** (voor BSC & BSC Testnet)

**Stappen:**
1. Ga naar: https://bscscan.com/register
2. Maak een gratis account aan
3. Verifieer je email
4. Ga naar: https://bscscan.com/myapikey
5. Click "Add" om een nieuwe API key te maken
6. Kopieer je API key

---

### 3. **PolygonScan** (voor Polygon)

**Stappen:**
1. Ga naar: https://polygonscan.com/register
2. Maak een gratis account aan
3. Verifieer je email
4. Ga naar: https://polygonscan.com/myapikey
5. Click "Add" om een nieuwe API key te maken
6. Kopieer je API key

---

## 🔧 API Keys Installeren

### Voor Local Development:

1. **Maak `.env.local` file:**
```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app"
touch .env.local
```

2. **Voeg je API keys toe:**
```env
NEXT_PUBLIC_ETHERSCAN_API_KEY=JOUW_ETHERSCAN_KEY_HIER
NEXT_PUBLIC_BSCSCAN_API_KEY=JOUW_BSCSCAN_KEY_HIER
NEXT_PUBLIC_POLYGONSCAN_API_KEY=JOUW_POLYGONSCAN_KEY_HIER
```

3. **Restart development server:**
```bash
npm run dev
```

---

### Voor Vercel Production:

1. **Ga naar Vercel Dashboard:**
   - Open: https://vercel.com/rick-schlimbacks-projects/blazewallet

2. **Settings → Environment Variables**

3. **Voeg toe:**
   - Key: `NEXT_PUBLIC_ETHERSCAN_API_KEY`
   - Value: Je Etherscan API key
   - Environment: Production, Preview, Development

4. **Repeat voor andere keys:**
   - `NEXT_PUBLIC_BSCSCAN_API_KEY`
   - `NEXT_PUBLIC_POLYGONSCAN_API_KEY`

5. **Redeploy:**
```bash
npx vercel --prod
```

---

## 🧪 Test Je Setup

### Check Console Output:

```javascript
// Als API key werkt:
✅ Loaded 10 transactions

// Als API key ontbreekt:
💡 Tip: Add a free Etherscan API key to .env.local
Get your key at: https://etherscan.io/apis
```

---

## 🚀 Snelle Setup (Copy-Paste Ready)

```bash
# 1. Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_ETHERSCAN_API_KEY=YourEtherscanKeyHere
NEXT_PUBLIC_BSCSCAN_API_KEY=YourBscScanKeyHere
NEXT_PUBLIC_POLYGONSCAN_API_KEY=YourPolygonScanKeyHere
EOF

# 2. Restart dev server
npm run dev
```

---

## ❓ FAQ

### **Q: Zijn deze API keys veilig om te delen?**
A: **NEXT_PUBLIC_** keys zijn client-side en dus zichtbaar in de browser. Dit is OK voor read-only block explorer APIs. Etherscan rate-limits per IP, niet per key, dus abuse is beperkt.

### **Q: Moet ik voor deze keys betalen?**
A: **NEE!** Alle block explorer APIs hebben gratis tiers die RUIM voldoende zijn voor BLAZE Wallet.

### **Q: Werkt Arc zonder API keys?**
A: Nee, voor Ethereum heb je sinds oktober 2024 een API key nodig. BSC, Polygon etc. kunnen nog wel zonder, maar met beperkte rate limits.

### **Q: Kan ik 1 key delen voor development EN production?**
A: Ja! Je kunt dezelfde key gebruiken voor beide. Rate limits zijn per IP, niet per environment.

---

## 🎯 Prioriteit

**Minimaal nodig:**
- ✅ **Etherscan API Key** - Voor Ethereum transacties

**Optioneel (als je die chains gebruikt):**
- ✅ BscScan - Voor BSC transacties
- ✅ PolygonScan - Voor Polygon transacties

---

**Zonder Etherscan API key zie je GEEN transacties in BLAZE Wallet op Ethereum!** 🔑
