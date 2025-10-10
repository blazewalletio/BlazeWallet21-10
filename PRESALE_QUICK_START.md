# 🚀 PRESALE QUICK START - 3 SIMPELE STAPPEN

## ✅ **ANTWOORD OP JE VRAGEN:**

### 1. **Testnet werkend krijgen?**
→ Zie stap 1 hieronder (5 minuten)

### 2. **Presale 100% werkend krijgen?**
→ Zie stap 2 & 3 hieronder (10 minuten)

### 3. **Mensen kunnen daadwerkelijk kopen?**
→ Ja! Als je stap 1-3 volgt, werkt alles automatisch!

### 4. **Cap op hoeveel mensen kunnen kopen?**
→ **JA! Al ingebouwd:**
- ✅ Max **$10,000 per wallet**
- ✅ Hard cap **$500,000 totaal**
- ✅ Users kunnen niet meer als ze max hebben bereikt

---

## 📋 STAP 1: TESTNET SETUP (5 min)

### A. Get Testnet BNB (Gratis!)

1. Open: https://testnet.bnbchain.org/faucet-smart
2. Plak je wallet address: `0x...`
3. Klik "Give me BNB"
4. Wacht 30 seconden
5. Check je wallet → Should have 0.5 BNB! ✅

**Need more?** Gebruik deze faucets:
- https://testnet.binance.org/faucet-smart
- https://www.bnbchain.org/en/testnet-faucet

---

### B. Setup Environment File

```bash
cd contracts
cp .env.example .env
```

Open `.env` en vul in:
```bash
PRIVATE_KEY=your_private_key_here
```

⚠️ **Hoe krijg je private key?**
1. Open Blaze Wallet
2. Ga naar Settings
3. Klik "Export Private Key"
4. Kopieer (ZONDER 0x!)

---

## 🚀 STAP 2: DEPLOY CONTRACTS (10 min)

### A. Update Wallet Addresses

Open: `contracts/scripts/deploy-presale.js`

**Lijn 14-23**, verander naar JOUW adressen:

```javascript
const config = {
  liquidityWallet: "0xYOUR_WALLET_ADDRESS",    // Krijgt 60% presale ($300k)
  operationalWallet: "0xYOUR_WALLET_ADDRESS",  // Krijgt 40% presale ($200k)
  founderImmediateWallet: "0xYOUR_WALLET_ADDRESS", // Krijgt 80M tokens
  founderVestingWallet: "0xYOUR_WALLET_ADDRESS",   // Vesting address
  communityWallet: "0xYOUR_WALLET_ADDRESS",
  treasuryWallet: "0xYOUR_WALLET_ADDRESS",
  teamWallet: "0xYOUR_WALLET_ADDRESS",
  strategicWallet: "0xYOUR_WALLET_ADDRESS",
};
```

💡 **Voor testnet:** Gebruik overal hetzelfde adres (je eigen wallet)!

---

### B. Deploy to BSC Testnet

```bash
cd contracts
npx hardhat run scripts/deploy-presale.js --network bscTestnet
```

**Output:**
```
✅ Presale Contract deployed to: 0xABC123...
✅ BLAZE Token deployed to: 0xDEF456...
```

📝 **KOPIEER DEZE ADRESSEN!** ← Super belangrijk!

---

### C. Update Frontend Config

Open: `lib/presale-config.ts`

**Lijn 4-5**, vul de addresses in:

```typescript
testnet: {
  chainId: 97,
  presaleAddress: '0xYOUR_PRESALE_ADDRESS',  // From deployment output
  tokenAddress: '0xYOUR_TOKEN_ADDRESS',      // From deployment output
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  explorerUrl: 'https://testnet.bscscan.com',
},
```

---

### D. Start the Presale

```bash
cd contracts
npx hardhat console --network bscTestnet
```

In de console:
```javascript
// Connect to presale
const Presale = await ethers.getContractFactory("BlazePresale");
const presale = Presale.attach("0xYOUR_PRESALE_ADDRESS");

// Start for 30 days
await presale.startPresale(30);

// Verify
const info = await presale.getPresaleInfo();
console.log("Active:", info.active); // Should be true!
```

Type `.exit` to close console

---

## 💻 STAP 3: DEPLOY FRONTEND & TEST (5 min)

### A. Build & Deploy

```bash
cd ..  # Back to project root
npm run build
npx vercel --prod --yes
```

**Wait 2-3 minutes for deployment...**

---

### B. Test the Flow!

1. **Open:** https://my.blazewallet.io
2. **Switch to BSC Testnet** (chainId 97)
   - Click network selector
   - Select "BSC Testnet"
3. **Click "Presale"** button (orange, top right)
4. **Enter amount:** e.g. $100
5. **Click "Contribute Now"**
6. **Confirm transaction** in wallet
7. **Wait 10-20 seconds**
8. **See your allocation!** 🎉

---

## ✅ VERIFICATION

### Check on BscScan Testnet:

**Presale Contract:**
```
https://testnet.bscscan.com/address/0xYOUR_PRESALE_ADDRESS
```

**Token Contract:**
```
https://testnet.bscscan.com/address/0xYOUR_TOKEN_ADDRESS
```

**Your Transaction:**
```
https://testnet.bscscan.com/tx/0xYOUR_TX_HASH
```

---

## 🎯 HOE HET WERKT:

### **User Flow:**
1. User clicks "Presale" button
2. Enters contribution ($100 - $10,000)
3. Sees calculation: "$500 = 119,904 BLAZE tokens"
4. Clicks "Contribute Now"
5. Confirms BNB transaction
6. Gets allocated tokens (claimable after TGE)

### **What Happens Behind the Scenes:**
1. User sends BNB to presale contract
2. Contract calculates tokens based on price ($0.00417)
3. Tokens are allocated (stored in contract)
4. User's contribution is tracked
5. After presale ends → You finalize
6. **60% BNB → Liquidity wallet**
7. **40% BNB → Operational wallet (JOUW $200k!)**
8. Users can claim their BLAZE tokens

---

## 💰 JOUW GELD KRIJGEN:

### After Presale Ends:

**Step 1: Finalize Presale**
```bash
npx hardhat console --network bscTestnet

const presale = await ethers.getContractAt("BlazePresale", "0xYOUR_ADDRESS");
await presale.finalizePresale();
```

**Step 2: Check Your Balance**
```bash
const balance = await ethers.provider.getBalance("0xYOUR_OPERATIONAL_WALLET");
console.log("You got:", ethers.formatEther(balance), "BNB");
```

**If presale raised $500k:**
- Liquidity wallet gets: ~500 BNB ($300k at $600/BNB)
- **YOU get: ~333 BNB ($200k!)** 💰

---

## 🎉 SUCCESS CHECKLIST:

### You know it's working when:
- ✅ Presale modal opens without errors
- ✅ Live stats show (raised, participants, time)
- ✅ You can enter contribution amount
- ✅ Transaction goes through
- ✅ Your allocation shows in modal
- ✅ Your operational wallet receives BNB after finalize

---

## 🆘 TROUBLESHOOTING:

### "Presale not configured"
→ Fill in contract addresses in `lib/presale-config.ts`

### "Please switch to BSC Testnet"
→ Click network selector, choose BSC Testnet

### "Insufficient funds"
→ Get more testnet BNB from faucet

### "Transaction failed"
→ Check you have enough BNB for gas (~0.001 BNB)

### "Presale not active"
→ Run `presale.startPresale(30)` via hardhat console

---

## 🎯 VOOR MAINNET LAUNCH:

### When ready for real money:

1. **Get real BNB** (~0.5 BNB for deployment + testing)
2. **Update addresses** in deploy script to REAL wallets
3. **Change network** in presale-config.ts to `mainnet`
4. **Deploy:** `npx hardhat run scripts/deploy-presale.js --network bsc`
5. **Verify contracts** on BscScan
6. **Rebuild frontend:** `npm run build && npx vercel --prod`
7. **Start presale:** via hardhat console
8. **Announce to community!** 📢

---

## 📞 NEED HELP?

Als iets niet werkt:
1. Check console for errors (F12)
2. Check BscScan for transaction status
3. Check presale contract state via hardhat console
4. Verify wallet has testnet BNB

---

**JE BENT NU KLAAR OM TE TESTEN! 🔥**

**Volg stap 1, 2, 3 en je presale werkt 100%!** 🚀

