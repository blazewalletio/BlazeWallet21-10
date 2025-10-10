# 🌈 Arc Token V4 Enhanced - Smart Contracts

## Overview

Arc Token ($ARC) is the utility token powering the Arc wallet ecosystem.

**Version:** V4 Enhanced  
**Network:** Ethereum (+ BSC, Polygon bridges)  
**Standard:** ERC-20 (OpenZeppelin 5.0)  
**Total Supply:** 1,000,000,000 (Fixed - No Minting)

---

## 📊 Tokenomics

### Distribution

```
25% (250M) → Public Sale & Liquidity
  ├─ 15% (150M) Public Sale
  └─ 10% (100M) Liquidity Pools (locked 2 years)

25% (250M) → Founder
  ├─ 10% (100M) Unlocked at launch
  └─ 15% (150M) Vesting (6-month cliff, 4-year total)

20% (200M) → Community Rewards
  ├─ Staking rewards
  ├─ Cashback incentives
  └─ Airdrops

15% (150M) → Treasury
  ├─ Partnerships
  ├─ Marketing
  └─ Development

10% (100M) → Team & Advisors
  └─ 3-year vesting

5% (50M) → Strategic/Seed
  └─ 2-year vesting
```

**Circulating at Launch:** ~31% (310M tokens)

---

## 🔥 Key Features

### 1. Deflationary Mechanism

**0.10% Burn on Transfers:**
- Automatic burn on every transaction
- Except: minting, staking, unstaking, liquidity

**Revenue Buyback & Burn:**
- 50% of Arc wallet revenue → Buy ARC → Burn
- Quarterly burns

**Unclaimed Rewards:**
- Rewards not claimed after 2 years → Burned

**Target:** 1B → 700M supply over 10 years

### 2. Staking System

**APY Rates:**
- Flexible (no lock): 8% APY
- 6-month lock: 15% APY
- 1-year lock: 20% APY

**Premium Membership:**
- Stake 1,000+ ARC = Lifetime premium
- Unlocks advanced features in Arc wallet

### 3. Fee Discounts

Stake more, pay less on Arc wallet swaps:

| Staked | Discount |
|--------|----------|
| 1,000 ARC | 10% |
| 10,000 ARC | 25% |
| 50,000 ARC | 50% |
| 100,000 ARC | 75% |

### 4. No Anti-Dump Mechanisms

Like Bitcoin:
- ✅ No max transaction limits
- ✅ No sell taxes
- ✅ No blacklists
- ✅ Free market approach

---

## 🛠 Development

### Prerequisites

```bash
Node.js >= 18
npm >= 9
```

### Setup

```bash
cd contracts
npm install
cp .env.template .env
# Edit .env with your keys
```

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

### Deploy to Testnet (Sepolia)

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Verify on Etherscan

```bash
npx hardhat verify --network mainnet <TOKEN_ADDRESS> \
  "0xPublicSale" "0xFounder" "0xCommunity" \
  "0xTreasury" "0xTeam" "0xStrategic" "0xLiquidity"
```

---

## 📝 Contract Addresses

### Mainnet (TBD)
```
Token:   0x... (deploy first)
Vesting: 0x... (deploy second)
```

### Sepolia Testnet (For Testing)
```
Token:   Deploy and test here first!
Vesting: Deploy after token
```

---

## 🔐 Security

### Audits

- [ ] CertiK Audit (Scheduled)
- [ ] OpenZeppelin Review (Scheduled)
- [x] Internal Security Review (Completed)

### Features

✅ **ReentrancyGuard** - Protects against reentrancy attacks  
✅ **Pausable** - Emergency stop mechanism  
✅ **Ownable** - Secure ownership management  
✅ **No Mint Function** - Fixed 1B supply  
✅ **OpenZeppelin Standards** - Battle-tested code  

### Bug Bounty

Found a vulnerability?
- Email: security@arc.wallet
- Reward: Up to $50,000 for critical bugs

---

## 📖 Documentation

- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Tokenomics:** [../ARC_TOKENOMICS_V4_ENHANCED.md](../ARC_TOKENOMICS_V4_ENHANCED.md)
- **API Docs:** Generate with `npm run docs`

---

## 🎯 Usage Examples

### Stake Tokens

```javascript
const arcToken = new ethers.Contract(TOKEN_ADDRESS, ABI, signer);

// Approve
await arcToken.approve(TOKEN_ADDRESS, amount);

// Stake (lockPeriod: 0, 180, or 365 days)
await arcToken.stake(amount, 365); // 1-year lock for 20% APY
```

### Check Staking Rewards

```javascript
const rewards = await arcToken.calculateReward(userAddress);
console.log("Pending rewards:", ethers.formatEther(rewards), "ARC");
```

### Claim Rewards

```javascript
await arcToken.claimRewards();
```

### Unstake

```javascript
await arcToken.unstake(); // Only after lock period ends
```

### Check Premium Status

```javascript
const isPremium = await arcToken.isPremium(userAddress);
const feeDiscount = await arcToken.feeDiscounts(userAddress);
console.log("Premium:", isPremium);
console.log("Fee discount:", feeDiscount / 100, "%");
```

### Get Token Stats

```javascript
const stats = await arcToken.getTokenStats();
console.log("Circulating:", ethers.formatEther(stats.circulatingSupply));
console.log("Burned:", ethers.formatEther(stats.burnedSupply));
console.log("Staked:", ethers.formatEther(stats.stakedSupply));
```

---

## 🚀 Roadmap

### Q1 2025
- [x] Smart contract development
- [ ] Security audit (CertiK)
- [ ] Testnet deployment
- [ ] Community testing

### Q2 2025
- [ ] Mainnet deployment
- [ ] DEX listings (Uniswap, PancakeSwap, QuickSwap)
- [ ] CoinGecko & CoinMarketCap
- [ ] CEX listings (Gate.io, MEXC)

### Q3 2025
- [ ] More CEX listings (KuCoin, Bybit)
- [ ] Bridge to additional chains
- [ ] Governance implementation
- [ ] DeFi integrations

### Q4 2025
- [ ] Binance listing (target)
- [ ] Major partnerships
- [ ] Ecosystem expansion

---

## 📞 Support

**Website:** arc.wallet  
**Twitter:** @arcwallet  
**Discord:** discord.gg/arc  
**Email:** support@arc.wallet

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) file

---

**Arc Token V4 Enhanced**  
*Bend Money* 🌈

Built with ❤️ using:
- Hardhat
- OpenZeppelin Contracts
- Ethers.js v6