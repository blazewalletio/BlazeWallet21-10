# 🚀 BLAZE Token V4 Enhanced - Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Prepare Wallets

Create separate wallets for each allocation:

```
✅ Public Sale Wallet    (150M BLAZE)
✅ Liquidity Wallet      (100M BLAZE)
✅ Founder Wallet        (100M unlocked + receive vesting)
✅ Community Wallet      (200M BLAZE)
✅ Treasury Wallet       (150M BLAZE)
✅ Team Wallet           (100M BLAZE)
✅ Strategic Wallet      (50M BLAZE)
```

**Security Best Practices:**
- Use hardware wallets (Ledger/Trezor) for large amounts
- Use multi-sig for treasury (Gnosis Safe)
- Never share private keys
- Test on testnet first!

### 2. Fund Deployer Wallet

**Ethereum Mainnet:**
- Minimum: 0.5 ETH (~$1,500)
- Recommended: 1 ETH for safety

**Sepolia Testnet:**
- Get free testnet ETH from faucets
- sepoliafaucet.com
- faucet.quicknode.com/ethereum/sepolia

### 3. Set Up Environment

```bash
cd contracts
cp .env.template .env
```

Edit `.env`:
```bash
# Deployment
PRIVATE_KEY=your_deployer_private_key_here

# RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Wallet Addresses
PUBLIC_SALE_WALLET=0x...
FOUNDER_WALLET=0x...
COMMUNITY_WALLET=0x...
TREASURY_WALLET=0x...
TEAM_WALLET=0x...
STRATEGIC_WALLET=0x...
LIQUIDITY_WALLET=0x...
```

---

## 🧪 Test Deployment (Sepolia)

### Step 1: Install Dependencies

```bash
cd contracts
npm install
```

### Step 2: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

### Step 3: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 4: Verify Contracts

```bash
# Verify Token
npx hardhat verify --network sepolia <TOKEN_ADDRESS> \
  "PUBLIC_SALE_WALLET" "FOUNDER_WALLET" "COMMUNITY_WALLET" \
  "TREASURY_WALLET" "TEAM_WALLET" "STRATEGIC_WALLET" "LIQUIDITY_WALLET"

# Verify Vesting
npx hardhat verify --network sepolia <VESTING_ADDRESS> \
  "TOKEN_ADDRESS" "FOUNDER_WALLET"
```

### Step 5: Test Functions

Test on Etherscan:
1. Go to contract on Sepolia Etherscan
2. Click "Contract" → "Write Contract"
3. Test: `stake()`, `unstake()`, `transfer()`
4. Verify burns are working
5. Check vesting schedule

---

## 🌐 Mainnet Deployment

### STOP! Final Checklist:

- [ ] All contracts tested on Sepolia
- [ ] Security audit completed (CertiK)
- [ ] Legal opinion obtained
- [ ] All wallet addresses verified (triple check!)
- [ ] Deployer wallet funded (1 ETH+)
- [ ] Team ready for launch
- [ ] Marketing materials ready
- [ ] Social media accounts set up

### Step 1: Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

**⏱ Wait for confirmation (1-2 minutes)**

### Step 2: Save Contract Addresses

Write these down immediately:
```
Token Address:   0x...
Vesting Address: 0x...
```

### Step 3: Fund Vesting Contract

Transfer 150M ARC to vesting contract:

```javascript
// On Etherscan or using script:
arcToken.transfer(VESTING_ADDRESS, 150000000 * 10**18)
```

### Step 4: Verify on Etherscan

```bash
# Token
npx hardhat verify --network mainnet <TOKEN_ADDRESS> \
  "0xPublicSale" "0xFounder" "0xCommunity" \
  "0xTreasury" "0xTeam" "0xStrategic" "0xLiquidity"

# Vesting
npx hardhat verify --network mainnet <VESTING_ADDRESS> \
  "<TOKEN_ADDRESS>" "0xFounder"
```

---

## 💧 Add Liquidity

### Uniswap V3 (Ethereum)

**Amount: 50M BLAZE + $500k ETH**

1. Go to app.uniswap.org
2. Connect founder/liquidity wallet
3. Click "Pool" → "New Position"
4. Select ARC/ETH pair
5. Set range: $0.008 - $0.015 (concentrated)
6. Add liquidity
7. **CRITICAL: Lock LP tokens on Unicrypt for 2 years!**

### PancakeSwap (BSC)

**Amount: 30M BLAZE + $200k BNB**

1. Bridge ARC to BSC (use official bridge)
2. Go to pancakeswap.finance
3. Add liquidity: ARC/BNB
4. Lock LP tokens on Unicrypt

### QuickSwap (Polygon)

**Amount: 20M BLAZE + $100k MATIC**

1. Bridge ARC to Polygon
2. Go to quickswap.exchange
3. Add liquidity: ARC/MATIC
4. Lock LP tokens

### Lock Liquidity on Unicrypt

1. Go to unicrypt.network
2. Click "Lock Tokens"
3. Select LP tokens
4. Duration: 730 days (2 years)
5. Confirm and pay fee
6. **Save lock proof link!**

---

## 📊 Submit to Tracking Sites

### CoinGecko

1. Go to: coingecko.com/request-form
2. Fill out:
   - Token name: Arc Token
   - Symbol: ARC
   - Contract: <TOKEN_ADDRESS>
   - Logo: Upload high-res logo
   - Website: arc.wallet
   - Social media links
3. Submit and wait 1-2 weeks

### CoinMarketCap

1. Go to: coinmarketcap.com/request
2. Similar form as CoinGecko
3. Additional requirements:
   - Etherscan link (verified)
   - Liquidity proof ($100k+)
   - Trading volume (wait 1 week)
4. Submit and wait 1-2 weeks

---

## 🏦 Exchange Listings

### Tier 3: Gate.io / MEXC (Month 1-2)

**Requirements:**
- Verified contract ✅
- $10M+ FDV
- 30%+ circulating supply
- $100k+ daily volume
- Application fee: $10-30k

**Process:**
1. Go to exchange listing application
2. Fill comprehensive form
3. Pay listing fee
4. Provide: Logo, description, socials
5. Wait 2-4 weeks for approval

### Tier 2: KuCoin (Month 3-4)

**Requirements:**
- All above +
- $50M+ FDV
- $500k+ daily volume
- Active community (10k+ Discord)
- Application fee: $50k

### Tier 1: Binance (Month 6+)

**Requirements:**
- $100M+ FDV
- $5M+ daily volume
- 50k+ holders
- Multiple CEX listings
- No listing fee (merit-based)
- But often requires $500k-1M "market making"

---

## 🔐 Post-Deployment Security

### 1. Renounce Ownership (Optional)

After everything is stable:
```solidity
arcToken.transferOwnership(address(0))
```

**Pros:** Ultimate decentralization
**Cons:** Cannot pause in emergency

**Recommendation:** Transfer to multi-sig instead

### 2. Multi-Sig for Treasury

Use Gnosis Safe:
1. Go to app.safe.global
2. Create multi-sig (3/5 or 5/7)
3. Transfer treasury wallet ownership
4. All team members hold keys

### 3. Monitor Contracts

Set up monitoring:
- Etherscan alerts (large transfers)
- Discord webhook for events
- Dune Analytics dashboard
- DeFiLlama listing

---

## 📈 Marketing Launch

### Day 1: Announcement

**Twitter:**
```
🔥 BLAZE Token ($BLAZE) is LIVE!

Contract: 0x...
Verified: etherscan.io/address/0x...
Buy: app.uniswap.org/#/swap?outputCurrency=0x...

✅ 1B supply
✅ Deflationary (0.1% burn)
✅ Staking (8-20% APY)
✅ $800k liquidity (locked 2 years)

Set your finances ablaze! 🚀
```

**Discord:**
Pin message with:
- Contract address
- How to buy guide
- Tokenomics breakdown
- Links to liquidity locks

### Week 1: Community Growth

- Daily updates
- AMA sessions
- Trading competitions
- Meme contests
- Referral program

### Week 2-4: Exchange Push

- Apply to Gate.io, MEXC
- Submit to CoinGecko, CMC
- Influencer partnerships
- Press releases

---

## ⚠️ Common Issues & Solutions

### Issue: "Insufficient funds for gas"
**Solution:** Add more ETH to deployer wallet

### Issue: "Contract verification failed"
**Solution:** 
- Check constructor arguments match exactly
- Use same compiler version (0.8.20)
- Try manual verification on Etherscan

### Issue: "Transaction failed"
**Solution:**
- Increase gas limit
- Check wallet has enough balance
- Verify contract isn't paused

### Issue: "Vesting not working"
**Solution:**
- Verify 150M ARC transferred to vesting contract
- Check cliff hasn't expired yet
- Ensure calling from founder wallet

---

## 🎯 Success Metrics

### Week 1 Targets:
- [ ] 1,000+ holders
- [ ] $100k+ daily volume
- [ ] $10M+ FDV
- [ ] Listed on CoinGecko/CMC

### Month 1 Targets:
- [ ] 5,000+ holders
- [ ] $500k+ daily volume
- [ ] $50M+ FDV
- [ ] 1-2 CEX listings

### Month 3 Targets:
- [ ] 20,000+ holders
- [ ] $2M+ daily volume
- [ ] $100M+ FDV
- [ ] 3-5 CEX listings

### Month 6 Targets:
- [ ] 50,000+ holders
- [ ] $10M+ daily volume
- [ ] $500M+ FDV
- [ ] Binance listing (dream!)

---

## 📞 Support & Resources

**Hardhat Docs:** hardhat.org/docs
**OpenZeppelin:** docs.openzeppelin.com
**Etherscan API:** docs.etherscan.io
**Uniswap Docs:** docs.uniswap.org

**Emergency Contacts:**
- CertiK (audit): security@certik.com
- Unicrypt (locks): support@unicrypt.network
- Alchemy (RPC): support@alchemy.com

---

## 🌈 Final Checklist Before Launch

- [ ] All contracts deployed and verified
- [ ] Vesting contract funded (150M ARC)
- [ ] Liquidity added ($800k total)
- [ ] Liquidity locked (2 years, proof saved)
- [ ] CoinGecko/CMC submitted
- [ ] Website live
- [ ] Social media active
- [ ] Team ready (24/7 support)
- [ ] Marketing campaign started
- [ ] Legal compliance checked

**When all checked: LAUNCH! 🚀**

---

**BLAZE Token V4 Enhanced**  
*Set Your Finances Ablaze* 🔥
