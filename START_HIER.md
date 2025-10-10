# 🔥 START HIER - SIMPEL STAPPENPLAN

## ⚡ WAAROM "PRESALE NOT CONFIGURED"?

**Reden:** De contract addresses staan nog op `''` (leeg) in `lib/presale-config.ts`

**Fix:** Volg dit stappenplan om contracts te deployen en addresses in te vullen!

---

# 📋 TESTNET - DOE DIT NU (20 min)

## ☑️ STAP 1: Get Gratis Testnet BNB

```
1. Open: https://testnet.bnbchain.org/faucet-smart
2. Plak je wallet address
3. Klik "Give me BNB"
4. Wacht 1 minuut
5. Check wallet → 0.5 BNB ✅
```

---

## ☑️ STAP 2: Setup Environment

**In terminal:**

```bash
cd ~/Desktop/Crypto\ wallet\ app/contracts

# Maak .env file
echo "PRIVATE_KEY=your_key_here" > .env

# Open en edit
open .env
```

**In .env, plak:**
```
PRIVATE_KEY=jouw_private_key_zonder_0x
```

**Hoe krijg je private key?**
1. Open my.blazewallet.io
2. Settings → Export Private Key
3. Kopieer (verwijder "0x" aan het begin!)

---

## ☑️ STAP 3: Update Deploy Script

```bash
open scripts/deploy-presale.js
```

**Zoek regel 14, vervang ALLES met jouw address:**

```javascript
liquidityWallet: "0xJOUW_WALLET",
operationalWallet: "0xJOUW_WALLET",
founderImmediateWallet: "0xJOUW_WALLET",
founderVestingWallet: "0xJOUW_WALLET",
communityWallet: "0xJOUW_WALLET",
treasuryWallet: "0xJOUW_WALLET",
teamWallet: "0xJOUW_WALLET",
strategicWallet: "0xJOUW_WALLET",
```

**Save (Cmd+S)**

---

## ☑️ STAP 4: Deploy!

```bash
npx hardhat run scripts/deploy-presale.js --network bscTestnet
```

**Wacht 30 seconden...**

**Output:**
```
✅ Presale Contract deployed to: 0xABC123...
✅ BLAZE Token deployed to: 0xDEF456...
```

**📝 KOPIEER DEZE 2 ADRESSEN!**

---

## ☑️ STAP 5: Update Frontend

```bash
cd ..
open lib/presale-config.ts
```

**Vul in bij testnet (regel 4-5):**

```typescript
presaleAddress: '0xABC123...',  // ← Van stap 4
tokenAddress: '0xDEF456...',    // ← Van stap 4
```

**Save**

---

## ☑️ STAP 6: Start Presale

```bash
cd contracts
npx hardhat console --network bscTestnet
```

**Type:**
```javascript
const Presale = await ethers.getContractFactory("BlazePresale");
const presale = Presale.attach("0xABC123");  // ← Jouw presale address

await presale.startPresale(30);

// Check
const info = await presale.getPresaleInfo();
console.log("Active:", info.active);

.exit
```

---

## ☑️ STAP 7: Deploy Frontend

```bash
cd ..
npm run build
npx vercel --prod --yes
```

**Wacht 2-3 minuten...**

---

## ☑️ STAP 8: TEST!

```
1. Open: https://my.blazewallet.io
2. Switch to "BSC Testnet" (chain selector)
3. Click "Presale" (oranje button)
4. Zie je stats? ✅
5. Enter $100
6. Click "Contribute"
7. Confirm transaction
8. Success! 🎉
```

---

# 🚀 MAINNET - DOE DIT ALS TESTNET WERKT

## ☑️ STAP 9: Get Real BNB

```
1. Buy ~2 BNB on Binance/Kraken
2. Withdraw to your wallet
3. Check balance in wallet
```

---

## ☑️ STAP 10: Update Script voor Mainnet

```bash
cd contracts
open scripts/deploy-presale.js
```

**Update ALLEEN liquidityWallet en operationalWallet:**

```javascript
liquidityWallet: "0xLIQUIDITY_WALLET",    // Nieuwe wallet voor liquidity!
operationalWallet: "0xJOUW_MAIN_WALLET",  // Jouw wallet ($200k)
```

💡 **Maak aparte liquidity wallet voor security!**

---

## ☑️ STAP 11: Deploy to Mainnet

```bash
npx hardhat run scripts/deploy-presale.js --network bsc
```

**Kopieer output addresses!**

---

## ☑️ STAP 12: Update Frontend

```bash
cd ..
open lib/presale-config.ts
```

**Update mainnet section (regel 12-13):**
```typescript
presaleAddress: '0xMAINNET_PRESALE',
tokenAddress: '0xMAINNET_TOKEN',
```

**Change environment (regel 20):**
```typescript
export const CURRENT_PRESALE = PRESALE_CONFIG.mainnet;  // ← mainnet!
```

**Save**

---

## ☑️ STAP 13: Verify on BscScan

```bash
cd contracts

# Get BscScan API key first: https://bscscan.com/myapikey
# Add to .env: BSCSCAN_API_KEY=...

npx hardhat verify --network bsc 0xPRESALE_ADDRESS "0xLIQUIDITY" "0xOPERATIONAL"
```

---

## ☑️ STAP 14: Deploy Frontend

```bash
cd ..
npm run build
npx vercel --prod --yes
```

---

## ☑️ STAP 15: Start Presale

```bash
cd contracts
npx hardhat console --network bsc

const presale = await ethers.getContractAt("BlazePresale", "0xYOUR_ADDRESS");
await presale.startPresale(30);

.exit
```

---

## ☑️ STAP 16: PRESALE IS LIVE! 🎉

```
✅ Users can contribute at: my.blazewallet.io
✅ Your presale is LIVE for 30 days
✅ Money flows to your wallets automatically
✅ Announce on Twitter/Telegram!
```

---

# 💰 AFTER PRESALE ENDS

## ☑️ STAP 17: Finalize & Get Money

```bash
cd contracts
npx hardhat console --network bsc

const presale = await ethers.getContractAt("BlazePresale", "0xYOUR_ADDRESS");
await presale.finalizePresale();

// Check your money
const balance = await ethers.provider.getBalance("0xOPERATIONAL_WALLET");
console.log("You got:", ethers.formatEther(balance), "BNB");

// If $500k raised = ~333 BNB = $200k! 💰
```

---

# 🎯 SIMPELE SUMMARY

**Testnet (testen):**
1. Get gratis BNB → 2. Deploy → 3. Update config → 4. Start → 5. Deploy frontend → 6. Test

**Mainnet (echt geld):**
1. Buy BNB → 2. Deploy → 3. Verify → 4. Update config → 5. Start → 6. Deploy frontend → 7. Promote!

**Na presale:**
1. Finalize → 2. Get $200k → 3. Add liquidity → 4. Users claim → 5. Trading live!

---

# 📞 FILES JE NODIG HEBT

**Voor deployment:**
- `contracts/scripts/deploy-presale.js` (update addresses!)
- `contracts/.env` (add PRIVATE_KEY)
- `lib/presale-config.ts` (add deployed addresses)

**Complete guides:**
- Dit bestand (`START_HIER.md`)
- `DEPLOYMENT_STAPPENPLAN.md` (detailed)
- `PRESALE_QUICK_START.md` (step-by-step)

---

# ⚡ BEGIN NU!

**Start met Testnet - Stap 1!**

Volg de stappen 1-8 en binnen 20 minuten werkt alles! 🔥

