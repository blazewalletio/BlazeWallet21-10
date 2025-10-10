# 🔥 BLAZE PRESALE - EXACT STAPPENPLAN

## 📋 FASE 1: TESTNET DEPLOYMENT (20 minuten)

### ✅ STAP 1: Get Testnet BNB

1. **Open je Blaze Wallet:** https://my.blazewallet.io
2. **Kopieer je wallet address** (bijv. 0x1234...)
3. **Ga naar faucet:** https://testnet.bnbchain.org/faucet-smart
4. **Plak je address en klik "Give me BNB"**
5. **Wacht 1 minuut**
6. **Check wallet:** Je moet 0.5 BNB hebben op BSC Testnet

**Lukt niet?** Probeer: https://testnet.binance.org/faucet-smart

---

### ✅ STAP 2: Setup Private Key

1. **Open terminal**
2. **Ga naar contracts folder:**
   ```bash
   cd ~/Desktop/Crypto\ wallet\ app/contracts
   ```

3. **Check of .env bestaat:**
   ```bash
   ls -la | grep .env
   ```

4. **Maak .env file:**
   ```bash
   touch .env
   ```

5. **Open .env in editor:**
   ```bash
   open .env
   ```

6. **Plak dit erin (vervang JOUW_KEY):**
   ```
   PRIVATE_KEY=jouw_private_key_zonder_0x
   ```

7. **Save en sluit**

**⚠️ HOE KRIJG JE PRIVATE KEY?**
- Open Blaze Wallet → Settings → Export Private Key
- Kopieer ALLES (maar verwijder "0x" aan het begin!)

---

### ✅ STAP 3: Update Wallet Addresses in Deploy Script

1. **Open file:**
   ```bash
   open scripts/deploy-presale.js
   ```

2. **Zoek regel 14-23** (const config = {...})

3. **Vervang ALLE adressen met JOUW wallet address:**
   ```javascript
   const config = {
     liquidityWallet: "0xJOUW_WALLET_ADDRESS",
     operationalWallet: "0xJOUW_WALLET_ADDRESS",
     founderImmediateWallet: "0xJOUW_WALLET_ADDRESS",
     founderVestingWallet: "0xJOUW_WALLET_ADDRESS",
     communityWallet: "0xJOUW_WALLET_ADDRESS",
     treasuryWallet: "0xJOUW_WALLET_ADDRESS",
     teamWallet: "0xJOUW_WALLET_ADDRESS",
     strategicWallet: "0xJOUW_WALLET_ADDRESS",
   };
   ```

4. **Save (Cmd+S)**

💡 **Voor testnet:** Gebruik overal hetzelfde adres!

---

### ✅ STAP 4: Deploy Contracts to Testnet

1. **In terminal (in contracts folder):**
   ```bash
   npx hardhat run scripts/deploy-presale.js --network bscTestnet
   ```

2. **Wacht ~30 seconden**

3. **Je ziet:**
   ```
   ✅ Presale Contract deployed to: 0xABC123...
   ✅ BLAZE Token deployed to: 0xDEF456...
   ```

4. **📝 KOPIEER BEIDE ADRESSEN!** ← Super belangrijk!

**Als error:**
- Check .env file heeft PRIVATE_KEY
- Check je hebt testnet BNB
- Check hardhat.config.js heeft bscTestnet network

---

### ✅ STAP 5: Update Frontend Config

1. **Open file:**
   ```bash
   cd ..  # Terug naar project root
   open lib/presale-config.ts
   ```

2. **Zoek regel 4-5** (testnet section)

3. **Vul de addresses in:**
   ```typescript
   testnet: {
     chainId: 97,
     presaleAddress: '0xABC123...',  // ← JOUW PRESALE ADDRESS
     tokenAddress: '0xDEF456...',    // ← JOUW TOKEN ADDRESS
     rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
     explorerUrl: 'https://testnet.bscscan.com',
   },
   ```

4. **Save (Cmd+S)**

---

### ✅ STAP 6: Start Presale

1. **Open hardhat console:**
   ```bash
   cd contracts
   npx hardhat console --network bscTestnet
   ```

2. **In console, type (vervang address):**
   ```javascript
   const Presale = await ethers.getContractFactory("BlazePresale");
   const presale = Presale.attach("0xJOUW_PRESALE_ADDRESS");
   await presale.startPresale(30);
   ```

3. **Verify:**
   ```javascript
   const info = await presale.getPresaleInfo();
   console.log("Active:", info.active);
   ```

   **Moet "true" zijn!** ✅

4. **Exit console:**
   ```javascript
   .exit
   ```

---

### ✅ STAP 7: Deploy Frontend

1. **Terug naar project root:**
   ```bash
   cd ..
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   npx vercel --prod --yes
   ```

4. **Wacht 2-3 minuten**

---

### ✅ STAP 8: TEST!

1. **Open:** https://my.blazewallet.io
2. **Switch to BSC Testnet** (chainId 97)
3. **Click "Presale"** button (oranje, top right)
4. **Check:** Zie je live stats? ✅
5. **Enter:** $100
6. **Click:** "Contribute Now"
7. **Confirm** transaction
8. **Check:** Zie je allocation? 🎉

**Success!** Testnet werkt! 🔥

---

## 📋 FASE 2: MAINNET DEPLOYMENT (30 minuten)

### ✅ STAP 9: Get Real BNB

1. **Buy BNB** op exchange (Binance, Kraken, etc.)
2. **Withdraw** to your wallet address
3. **Je hebt nodig:**
   - ~0.1 BNB voor deployment ($60)
   - ~1-2 BNB voor liquidity ($600-1200)

---

### ✅ STAP 10: Create Separate Wallets (BELANGRIJK!)

**Voor security en transparantie:**

1. **Liquidity Wallet:**
   - Create nieuwe wallet in Blaze
   - Save address
   - Dit ontvangt 60% ($300k)

2. **Operational Wallet:**
   - Kan je huidige wallet zijn
   - Dit ontvangt 40% ($200k)

**Waarom apart?**
- Liquidity moet locked blijven (6 months)
- Operational kan je direct gebruiken
- Transparantie voor community

---

### ✅ STAP 11: Update Deploy Script voor Mainnet

1. **Open:**
   ```bash
   cd contracts
   open scripts/deploy-presale.js
   ```

2. **Update config (regel 14-23) met REAL adressen:**
   ```javascript
   const config = {
     liquidityWallet: "0xYOUR_LIQUIDITY_WALLET",    // Nieuwe wallet!
     operationalWallet: "0xYOUR_OPERATIONAL_WALLET", // Jouw main wallet
     founderImmediateWallet: "0xYOUR_OPERATIONAL_WALLET",
     founderVestingWallet: "0xYOUR_OPERATIONAL_WALLET",
     communityWallet: "0xYOUR_OPERATIONAL_WALLET",
     treasuryWallet: "0xYOUR_OPERATIONAL_WALLET",
     teamWallet: "0xYOUR_OPERATIONAL_WALLET",
     strategicWallet: "0xYOUR_OPERATIONAL_WALLET",
   };
   ```

3. **Save**

---

### ✅ STAP 12: Deploy to BSC Mainnet

1. **Update .env met MAINNET private key:**
   ```bash
   open .env
   ```
   
   **Zet erin:**
   ```
   PRIVATE_KEY=your_mainnet_wallet_private_key
   ```

2. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy-presale.js --network bsc
   ```

3. **Wacht ~60 seconden**

4. **Output:**
   ```
   ✅ Presale Contract: 0xMAINNET_PRESALE...
   ✅ Token Contract: 0xMAINNET_TOKEN...
   ```

5. **📝 SAVE DEZE ADRESSEN!**

---

### ✅ STAP 13: Verify Contracts on BscScan

**Dit is belangrijk voor trust!**

1. **Get BscScan API key:**
   - Ga naar: https://bscscan.com/register
   - Create account
   - Go to API Keys
   - Create new key
   - Copy key

2. **Add to .env:**
   ```
   BSCSCAN_API_KEY=your_api_key_here
   ```

3. **Verify Presale:**
   ```bash
   npx hardhat verify --network bsc 0xPRESALE_ADDRESS "0xLIQUIDITY_WALLET" "0xOPERATIONAL_WALLET"
   ```

4. **Verify Token:**
   ```bash
   npx hardhat verify --network bsc 0xTOKEN_ADDRESS "0xPRESALE_ADDRESS" "0xLIQUIDITY_WALLET" "0xFOUNDER_IMMEDIATE" "0xFOUNDER_VESTING" "0xCOMMUNITY" "0xTREASURY" "0xTEAM" "0xSTRATEGIC"
   ```

5. **Check BscScan:**
   - https://bscscan.com/address/0xYOUR_PRESALE_ADDRESS
   - Should show "✅ Contract Source Code Verified"

---

### ✅ STAP 14: Update Frontend for Mainnet

1. **Open:**
   ```bash
   open lib/presale-config.ts
   ```

2. **Update mainnet section (regel 12-13):**
   ```typescript
   mainnet: {
     chainId: 56,
     presaleAddress: '0xYOUR_MAINNET_PRESALE',  // From step 12
     tokenAddress: '0xYOUR_MAINNET_TOKEN',      // From step 12
     rpcUrl: 'https://bsc-dataseed.binance.org/',
     explorerUrl: 'https://bscscan.com',
   },
   ```

3. **Change environment (regel 20):**
   ```typescript
   export const CURRENT_PRESALE = PRESALE_CONFIG.mainnet; // ← Change to mainnet!
   ```

4. **Save**

---

### ✅ STAP 15: Deploy Frontend

```bash
npm run build
npx vercel --prod --yes
```

**Wacht 2-3 minuten** → Frontend is updated!

---

## 🎉 FASE 3: PRESALE LIVE GAAN (10 minuten)

### ✅ STAP 16: Start Mainnet Presale

1. **Open console:**
   ```bash
   cd contracts
   npx hardhat console --network bsc
   ```

2. **Start presale:**
   ```javascript
   const Presale = await ethers.getContractFactory("BlazePresale");
   const presale = Presale.attach("0xYOUR_MAINNET_PRESALE_ADDRESS");
   
   // Start for 30 days
   await presale.startPresale(30);
   
   // Verify
   const info = await presale.getPresaleInfo();
   console.log("Active:", info.active);
   console.log("End time:", new Date(Number(info.timeRemaining) + Date.now()));
   ```

3. **Exit:** `.exit`

---

### ✅ STAP 17: Test User Flow

1. **Open:** https://my.blazewallet.io
2. **Switch to BSC Mainnet** (chainId 56)
3. **Click "Presale"**
4. **Check stats load:**
   - Total raised
   - Participants
   - Time remaining
5. **Enter test amount:** $100
6. **See calculation:** "23,981 BLAZE"
7. **(Optional) Contribute:** Om te testen

**Als alles werkt → PRESALE IS LIVE!** 🚀

---

### ✅ STAP 18: Monitor & Promote

**Monitor:**
```bash
# Check presale status anytime
npx hardhat console --network bsc

const presale = await ethers.getContractAt("BlazePresale", "0xYOUR_ADDRESS");
const info = await presale.getPresaleInfo();

console.log("Raised:", ethers.formatEther(info.raised), "BNB");
console.log("Participants:", info.participantCount.toString());
console.log("Tokens sold:", ethers.formatUnits(info.tokensSold, 18));
```

**Promote:**
- Twitter: "🔥 $BLAZE Presale is LIVE! 2.4x gain at launch!"
- Telegram/Discord: Share presale link
- Show transparency: "60% locked liquidity!"

---

## 💰 STAP 19: FINALIZE & GET YOUR MONEY

**When presale ends (30 days OR $500k reached):**

### A. Finalize Presale

```bash
npx hardhat console --network bsc

const presale = await ethers.getContractAt("BlazePresale", "0xYOUR_ADDRESS");

// Finalize (distributes funds!)
await presale.finalizePresale();
```

**What happens:**
- ✅ 60% BNB → Liquidity wallet
- ✅ 40% BNB → Operational wallet (**$200k naar jou!**)

---

### B. Check Your Balance

```javascript
// Check operational wallet balance
const balance = await ethers.provider.getBalance("0xYOUR_OPERATIONAL_WALLET");
console.log("Your money:", ethers.formatEther(balance), "BNB");

// At $600/BNB, if presale raised $500k:
// You got: ~333 BNB = $200k! 💰
```

---

### C. Add Liquidity on PancakeSwap

**Voor liquidity wallet:**

1. **Calculate tokens needed:**
   - $300k BNB (from presale)
   - $300k BLAZE tokens (from liquidity allocation)
   - Price: $0.01 per BLAZE = 30M tokens

2. **Go to:** https://pancakeswap.finance/add

3. **Add Liquidity:**
   - Token A: BNB
   - Token B: BLAZE (paste token address)
   - Amount: ~500 BNB + 30M BLAZE
   - Click "Supply"

4. **Get LP tokens**

5. **Lock LP tokens:**
   - Go to: https://www.pinksale.finance/pinklock
   - Lock for 6 months
   - Shows community you're serious!

---

### D. Users Can Claim Tokens

**Users go to presale modal:**
1. See "Claim Your Tokens" button
2. Click it
3. Get their BLAZE tokens!
4. Can now trade on PancakeSwap!

---

## 📊 CHECKLIST

### ✅ Testnet Phase:
- [ ] Got testnet BNB
- [ ] Created .env with private key
- [ ] Updated deploy script with addresses
- [ ] Deployed contracts to testnet
- [ ] Updated presale-config.ts with testnet addresses
- [ ] Started presale (30 days)
- [ ] Deployed frontend
- [ ] Tested contribution flow
- [ ] Verified contracts work

### ✅ Mainnet Phase:
- [ ] Got real BNB (~2 BNB total)
- [ ] Created separate liquidity wallet
- [ ] Updated deploy script with REAL addresses
- [ ] Deployed to BSC Mainnet
- [ ] Verified contracts on BscScan
- [ ] Updated presale-config.ts with mainnet addresses
- [ ] Changed CURRENT_PRESALE to mainnet
- [ ] Deployed frontend
- [ ] Tested on mainnet

### ✅ Presale Live:
- [ ] Started presale (30 days)
- [ ] Announced to community
- [ ] Monitoring contributions
- [ ] Ready to finalize when done

### ✅ After Presale:
- [ ] Finalized presale
- [ ] Got $200k in operational wallet
- [ ] Added liquidity on PancakeSwap
- [ ] Locked LP tokens
- [ ] Users can claim tokens
- [ ] Trading is LIVE!

---

## 🆘 TROUBLESHOOTING

### Error: "Presale not configured"
**Fix:** Fill in contract addresses in `lib/presale-config.ts` (Step 5 or 14)

### Error: "insufficient funds for gas"
**Fix:** Get more testnet/mainnet BNB

### Error: "nonce too high"
**Fix:** Reset account in wallet settings

### Error: "transaction failed"
**Fix:** Check presale is started: `presale.getPresaleInfo()`

### Presale button shows "Check back soon"
**Fix:** Deploy contracts and update config first

### Stats don't load
**Fix:** 
1. Check contract addresses are correct
2. Check you're on correct network
3. Check F12 console for errors

---

## 💡 PRO TIPS

1. **Test EVERYTHING on testnet first!**
2. **Double-check ALL addresses before mainnet**
3. **Keep liquidity wallet separate!**
4. **Lock LP tokens to build trust**
5. **Be transparent about fund allocation**
6. **Announce presale on social media**
7. **Monitor daily progress**

---

## 📞 QUICK REFERENCE

**Testnet Faucet:**
https://testnet.bnbchain.org/faucet-smart

**BSC Testnet Explorer:**
https://testnet.bscscan.com

**BSC Mainnet Explorer:**
https://bscscan.com

**PancakeSwap:**
https://pancakeswap.finance

**LP Lock:**
https://www.pinksale.finance/pinklock

---

## 🎯 EXPECTED TIMELINE

- **Testnet setup:** 20 minutes
- **Testing:** 1-2 hours
- **Mainnet deployment:** 30 minutes
- **Presale duration:** 30 days
- **Token claim:** 1 day
- **Add liquidity:** 1 hour

**Total to live presale:** ~1 day of work! 🚀

---

**BEGIN NU MET STAP 1!** ✨

