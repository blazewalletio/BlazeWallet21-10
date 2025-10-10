# 🧪 Arc Token - BSC Testnet Testing Guide

## 🎯 Waarom Testnet?

- ✅ **FREE!** No real money needed
- ✅ Test all functions safely
- ✅ Find bugs before mainnet
- ✅ Practice deployment process
- ✅ No risk!

**ALWAYS test on testnet first!** 🛡️

---

## 📋 Step-by-Step Testnet Testing

### Step 1: Setup MetaMask voor BSC Testnet (5 min)

**Add BSC Testnet to MetaMask:**

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add Network" → "Add Network Manually"
4. Enter these details:

```
Network Name: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Currency Symbol: BNB
Block Explorer: https://testnet.bscscan.com
```

5. Click "Save"
6. Switch to "BSC Testnet"

---

### Step 2: Get FREE Testnet BNB (5 min)

**Option 1: BNB Chain Faucet (Recommended)**

1. Go to: https://testnet.bnbchain.org/faucet-smart
2. Connect your MetaMask (BSC Testnet network!)
3. Complete captcha
4. Click "Give me BNB"
5. Wait 30 seconds
6. You receive 0.5 tBNB (testnet BNB)

**Option 2: Alternative Faucets**

If first doesn't work, try:
- https://testnet.binance.org/faucet-smart
- https://faucet.quicknode.com/binance-smart-chain/bnb-testnet

**Check Your Balance:**
- MetaMask should show 0.5 tBNB
- This is enough for MANY deployments!

---

### Step 3: Prepare Environment (2 min)

**Create .env file:**

```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app/contracts"
```

Create `.env` file:
```bash
PRIVATE_KEY=your_metamask_private_key_here
```

**Get Your Private Key:**
1. MetaMask → Click 3 dots (top right)
2. Account Details
3. Export Private Key
4. Enter password
5. Copy the key (starts with 0x)
6. Paste in .env file

⚠️ **IMPORTANT:** This is testnet, but NEVER share private keys!

---

### Step 4: Compile Contracts (2 min)

```bash
cd "/Users/rickschlimback/Desktop/Crypto wallet app/contracts"
npx hardhat compile
```

**Expected Output:**
```
Compiled X Solidity files successfully
```

If you see errors, let me know!

---

### Step 5: Deploy to Testnet! (2 min)

```bash
npx hardhat run scripts/deploy-bootstrap.js --network bscTestnet
```

**What Happens:**
- Deploys Arc Token contract
- Shows you all info
- Takes ~30 seconds
- Costs ~$0 (FREE testnet BNB!)

**Save the Output:**
- Token Address: 0x...
- Your Balance: 1,000,000,000 ARC

---

### Step 6: Verify Deployment (5 min)

**Check on BSCScan Testnet:**

1. Go to: https://testnet.bscscan.com
2. Paste your token address
3. You should see:
   - Contract created ✅
   - Total supply: 1,000,000,000 ARC ✅
   - Your balance: 1B ARC ✅

**Add Token to MetaMask:**

1. MetaMask → Assets tab
2. Scroll down → "Import Tokens"
3. Paste token address
4. Click "Add Custom Token"
5. Confirm
6. You should see: 1,000,000,000 ARC in your wallet! 🎉

---

### Step 7: Test Token Functions (10 min)

**A. Test Transfer:**

1. Create a second wallet (or use friend's address)
2. Go to: https://testnet.bscscan.com/address/YOUR_TOKEN_ADDRESS
3. Click "Contract" → "Write Contract"
4. Connect MetaMask
5. Find "transfer" function
6. Enter:
   - to: 0x... (other address)
   - amount: 1000000000000000000000 (1000 ARC with 18 decimals)
7. Click "Write"
8. Confirm in MetaMask

**Check:**
- Transaction should succeed ✅
- Other wallet receives ~999 ARC (1 ARC burned 0.1%)
- Your balance decreased by 1000 ARC

**B. Test Staking:**

1. Same page → "Write Contract"
2. Find "approve" function
3. Approve contract to spend your tokens:
   - spender: YOUR_TOKEN_ADDRESS
   - amount: 1000000000000000000000000 (1M ARC)
4. Write → Confirm

5. Find "stake" function
6. Enter:
   - amount: 1000000000000000000000 (1000 ARC)
   - lockPeriod: 0 (flexible) or 365 (1 year)
7. Write → Confirm

**Check:**
- Should succeed ✅
- Check "Read Contract" → "stakes" → Your address
- Should show your stake ✅

**C. Test Rewards:**

1. Wait 1-2 minutes
2. "Read Contract" → "calculateReward" → Your address
3. Should show some reward amount (tiny, but not 0)

**D. Test Unstake:**

1. "Write Contract" → "unstake"
2. Write → Confirm
3. Tokens return to your wallet + rewards! ✅

---

### Step 8: Test Liquidity (Optional, 15 min)

**Add Small Test Liquidity on PancakeSwap Testnet:**

1. Go to: https://pancakeswap.finance/?chain=bscTestnet
2. Click "Liquidity" → "Add"
3. Select:
   - tBNB (testnet BNB)
   - Custom token (paste your token address)
4. Add small amounts:
   - 1,000,000 ARC (1M)
   - 0.01 tBNB
5. Confirm transactions

**Test Swap:**
1. Go to "Swap"
2. Try swapping tBNB → ARC
3. Should work! ✅

**Check Price:**
- Go to Dexscreener testnet (if available)
- Or calculate: 0.01 BNB / 1M ARC = $0.00000001 per ARC

---

## ✅ Testing Checklist

Before going to mainnet, verify:

### Contract Functions:
- [ ] Deploy succeeds ✅
- [ ] Token shows in MetaMask ✅
- [ ] Transfer works ✅
- [ ] Burns work (0.1% per transfer) ✅
- [ ] Staking works ✅
- [ ] Unstaking works ✅
- [ ] Rewards calculate ✅
- [ ] Premium unlocks at 1000 ARC ✅

### Liquidity:
- [ ] Can add liquidity ✅
- [ ] Can swap tokens ✅
- [ ] Price calculates correctly ✅

### Security:
- [ ] Can't transfer more than balance ❌ (should fail)
- [ ] Can't unstake before lock period ❌ (should fail)
- [ ] Contract is pausable (only owner) ✅

---

## 🐛 Common Issues & Fixes

### "Insufficient funds for gas"
**Solution:** Get more testnet BNB from faucet

### "Transaction failed"
**Solution:** 
- Check you're on BSC Testnet (not mainnet!)
- Increase gas limit
- Try again

### "Token not showing in MetaMask"
**Solution:**
- Manually import using contract address
- Make sure you're on BSC Testnet network

### "Can't compile contracts"
**Solution:**
```bash
rm -rf node_modules
npm install
npx hardhat clean
npx hardhat compile
```

---

## 🎯 When You're Ready for Mainnet

After all tests pass:

1. ✅ All functions work
2. ✅ No bugs found
3. ✅ You understand the process
4. ✅ You have $500 in real BNB

**Then deploy to mainnet:**

```bash
npx hardhat run scripts/deploy-bootstrap.js --network bsc
```

**Difference:**
- Testnet: FREE, testing
- Mainnet: Real money, real token, real launch!

---

## 💡 Pro Tips

### 1. Test Multiple Times
- Deploy 2-3 times on testnet
- Each time costs $0
- Practice makes perfect!

### 2. Test Edge Cases
- Try sending 0 tokens (should fail)
- Try staking 0 (should fail)
- Try unstaking too early (should fail)

### 3. Test with Friends
- Have friend test buying/selling
- Test liquidity from both sides
- Simulate real usage

### 4. Document Issues
- Write down any problems
- Fix them before mainnet
- Better safe than sorry!

---

## 🆘 Need Help?

**If Something Goes Wrong:**

1. **Check transaction on BSCScan:**
   - https://testnet.bscscan.com/tx/YOUR_TX_HASH
   - Look at error message

2. **Common fixes:**
   - Recompile contracts
   - Get more testnet BNB
   - Check network (should be BSC Testnet)
   - Restart MetaMask

3. **Still stuck?**
   - Try alternative faucet
   - Create new wallet
   - Start fresh

**Remember:** Testnet is for learning! Make mistakes here, not on mainnet! 🛡️

---

## 🌈 Next Steps

After successful testnet testing:

1. ✅ Review all tests
2. ✅ Fix any issues found
3. ✅ Prepare mainnet wallets
4. ✅ Get $500 real BNB
5. ✅ Follow QUICK_START_500.md
6. 🚀 **LAUNCH TO MAINNET!**

---

**Good luck testing! 🧪**

You're doing it right by testing first! 🎯
