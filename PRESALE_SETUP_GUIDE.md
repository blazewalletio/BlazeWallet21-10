# 🔥 BLAZE PRESALE - COMPLETE SETUP GUIDE

## 📋 STAP 1: BSC TESTNET SETUP

### 1.1 Get Testnet BNB (Gratis!)

**Optie A: Official Faucet**
1. Ga naar: https://testnet.bnbchain.org/faucet-smart
2. Plak je wallet address
3. Klik "Give me BNB"
4. Krijg 0.5 BNB (gratis!)

**Optie B: Alternative Faucets**
- https://testnet.binance.org/faucet-smart
- https://www.bnbchain.org/en/testnet-faucet

**Je hebt nodig:**
- ~0.1 BNB voor contract deployment
- ~0.01 BNB voor testen

---

### 1.2 Hardhat Config Check

Je `hardhat.config.js` moet deze network hebben:

```javascript
bscTestnet: {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545",
  chainId: 97,
  accounts: [process.env.PRIVATE_KEY]
}
```

---

### 1.3 Setup .env File

Maak file: `contracts/.env`

```bash
# Your wallet private key (ZONDER 0x prefix!)
PRIVATE_KEY=your_private_key_here

# BscScan API Key (optional, voor verification)
BSCSCAN_API_KEY=your_api_key_here
```

⚠️ **BELANGRIJK:** Zorg dat `.env` in `.gitignore` staat!

---

## 🚀 STAP 2: DEPLOY PRESALE & TOKEN

### 2.1 Update Wallet Addresses

Open: `contracts/scripts/deploy-presale.js`

Verander deze adressen naar JOUW wallets:

```javascript
const config = {
  liquidityWallet: "0xYOUR_LIQUIDITY_WALLET", // Ontvangt 60% van presale
  operationalWallet: "0xYOUR_MAIN_WALLET",     // Ontvangt 40% van presale ($200k)
  founderImmediateWallet: "0xYOUR_MAIN_WALLET", // Krijgt 80M tokens direct
  founderVestingWallet: "0xYOUR_MAIN_WALLET",   // Krijgt vesting tokens
  communityWallet: "0xYOUR_MAIN_WALLET",
  treasuryWallet: "0xYOUR_MAIN_WALLET",
  teamWallet: "0xYOUR_MAIN_WALLET",
  strategicWallet: "0xYOUR_MAIN_WALLET",
};
```

💡 **Tip:** Voor testnet kun je overal hetzelfde adres gebruiken!

---

### 2.2 Deploy to Testnet

```bash
cd contracts

# Deploy presale + token
npx hardhat run scripts/deploy-presale.js --network bscTestnet
```

**Output:**
```
✅ Presale Contract deployed to: 0xABC...
✅ BLAZE Token deployed to: 0xDEF...
```

📝 **SAVE DEZE ADRESSEN!** Je hebt ze nodig voor de frontend!

---

## 💻 STAP 3: FRONTEND INTEGRATIE

### 3.1 Create Contract Config File

Maak: `lib/presale-config.ts`

```typescript
export const PRESALE_CONFIG = {
  // TESTNET
  testnet: {
    chainId: 97,
    presaleAddress: '0xYOUR_PRESALE_ADDRESS',
    tokenAddress: '0xYOUR_TOKEN_ADDRESS',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  },
  
  // MAINNET (later)
  mainnet: {
    chainId: 56,
    presaleAddress: '',
    tokenAddress: '',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
  },
};

// Current environment
export const CURRENT_PRESALE = PRESALE_CONFIG.testnet; // Change to mainnet later
```

---

### 3.2 Create Presale Service

Maak: `lib/presale-service.ts`

```typescript
import { ethers } from 'ethers';
import { CURRENT_PRESALE } from './presale-config';

// Contract ABIs (simplified)
const PRESALE_ABI = [
  'function contribute() external payable',
  'function getPresaleInfo() external view returns (bool active, bool finalized, uint256 raised, uint256 tokensSold, uint256 participantCount, uint256 timeRemaining)',
  'function getUserInfo(address user) external view returns (uint256 contribution, uint256 tokenAllocation, bool claimed)',
  'function claimTokens() external',
];

const TOKEN_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function symbol() external view returns (string)',
];

export class PresaleService {
  private presaleContract: ethers.Contract;
  private tokenContract: ethers.Contract;
  private provider: ethers.BrowserProvider;

  constructor(wallet: ethers.Signer) {
    this.provider = wallet.provider as ethers.BrowserProvider;
    this.presaleContract = new ethers.Contract(
      CURRENT_PRESALE.presaleAddress,
      PRESALE_ABI,
      wallet
    );
    this.tokenContract = new ethers.Contract(
      CURRENT_PRESALE.tokenAddress,
      TOKEN_ABI,
      wallet
    );
  }

  async getPresaleInfo() {
    const info = await this.presaleContract.getPresaleInfo();
    return {
      active: info.active,
      finalized: info.finalized,
      raised: parseFloat(ethers.formatEther(info.raised)),
      tokensSold: parseFloat(ethers.formatUnits(info.tokensSold, 18)),
      participantCount: Number(info.participantCount),
      timeRemaining: Number(info.timeRemaining) * 1000, // Convert to ms
    };
  }

  async getUserInfo(address: string) {
    const info = await this.presaleContract.getUserInfo(address);
    return {
      contribution: parseFloat(ethers.formatEther(info.contribution)),
      tokenAllocation: parseFloat(ethers.formatUnits(info.tokenAllocation, 18)),
      claimed: info.claimed,
    };
  }

  async contribute(amountInBNB: string) {
    const tx = await this.presaleContract.contribute({
      value: ethers.parseEther(amountInBNB),
    });
    await tx.wait();
    return tx.hash;
  }

  async claimTokens() {
    const tx = await this.presaleContract.claimTokens();
    await tx.wait();
    return tx.hash;
  }
}
```

---

### 3.3 Update PresaleModal.tsx

Vervang de mock data met echte contract calls:

```typescript
// Add imports
import { PresaleService } from '@/lib/presale-service';
import { CURRENT_PRESALE } from '@/lib/presale-config';

// In component:
useEffect(() => {
  if (isOpen && wallet && address) {
    loadPresaleData();
  }
}, [isOpen, wallet, address]);

const loadPresaleData = async () => {
  if (!wallet) return;
  
  try {
    const presaleService = new PresaleService(wallet);
    const info = await presaleService.getPresaleInfo();
    const userInfo = await presaleService.getUserInfo(address!);
    
    setPresaleInfo({
      totalRaised: info.raised,
      hardCap: 500000,
      participants: info.participantCount,
      timeRemaining: info.timeRemaining,
      tokenPrice: 0.00417,
      minContribution: 100,
      maxContribution: 10000,
    });
    
    setUserInfo({
      contribution: userInfo.contribution,
      tokenAllocation: userInfo.tokenAllocation,
      hasClaimed: userInfo.claimed,
    });
  } catch (err) {
    console.error('Error loading presale data:', err);
  }
};

const handleContribute = async () => {
  if (!wallet || !contributionAmount) return;
  
  setIsContributing(true);
  setError('');
  
  try {
    const presaleService = new PresaleService(wallet);
    
    // Convert USD to BNB (approximate, you'd want real price feed)
    const bnbPrice = 600; // $600 per BNB (update with real price)
    const amountInBNB = parseFloat(contributionAmount) / bnbPrice;
    
    const txHash = await presaleService.contribute(amountInBNB.toString());
    
    setSuccess(`Success! Tx: ${txHash.slice(0, 10)}...`);
    
    // Reload data
    await loadPresaleData();
    setContributionAmount('');
  } catch (err: any) {
    setError(err.message || 'Transaction failed');
  } finally {
    setIsContributing(false);
  }
};
```

---

## 🧪 STAP 4: TESTING

### 4.1 Start Presale (via Hardhat Console)

```bash
cd contracts

# Connect to deployed contract
npx hardhat console --network bscTestnet

# In console:
const Presale = await ethers.getContractFactory("BlazePresale");
const presale = Presale.attach("0xYOUR_PRESALE_ADDRESS");

# Start presale for 30 days
await presale.startPresale(30);

# Verify it started
const info = await presale.getPresaleInfo();
console.log("Presale active:", info.active);
```

---

### 4.2 Test Contribution Flow

1. **Open wallet:** https://my.blazewallet.io
2. **Switch to BSC Testnet** (chainId 97)
3. **Click "Presale"** button
4. **Enter amount:** e.g. $100
5. **Click "Contribute Now"**
6. **Confirm transaction**
7. **Wait for confirmation**
8. **See your allocation** in dashboard

---

### 4.3 Verify on BscScan Testnet

Check transactions:
- Presale Contract: https://testnet.bscscan.com/address/0xYOUR_PRESALE_ADDRESS
- Token Contract: https://testnet.bscscan.com/address/0xYOUR_TOKEN_ADDRESS
- Your Transactions: https://testnet.bscscan.com/address/0xYOUR_WALLET

---

## 🎯 STAP 5: FINALIZE & CLAIM

### 5.1 End Presale

```bash
# After testing or time expires
npx hardhat console --network bscTestnet

const presale = await ethers.getContractAt("BlazePresale", "0xYOUR_ADDRESS");
await presale.finalizePresale();

# Check balances
const operationalWallet = "0xYOUR_WALLET";
const balance = await ethers.provider.getBalance(operationalWallet);
console.log("Your balance:", ethers.formatEther(balance), "BNB");
```

---

### 5.2 Claim Tokens

```bash
# Users can claim via UI or console
await presale.claimTokens();

# Check token balance
const token = await ethers.getContractAt("BlazeTokenPresale", "0xTOKEN_ADDRESS");
const balance = await token.balanceOf("0xYOUR_WALLET");
console.log("Token balance:", ethers.formatUnits(balance, 18), "BLAZE");
```

---

## 🚀 STAP 6: MAINNET DEPLOYMENT

### 6.1 Get Real BNB

Buy BNB on exchange (Binance, etc.)
Transfer to your wallet
Need ~0.5 BNB for deployment + liquidity

---

### 6.2 Deploy to Mainnet

```bash
# Update config to mainnet wallets
# Update .env with mainnet private key

npx hardhat run scripts/deploy-presale.js --network bsc
```

---

### 6.3 Verify Contracts

```bash
npx hardhat verify --network bsc 0xTOKEN_ADDRESS "constructor args..."
npx hardhat verify --network bsc 0xPREhtmlALE_ADDRESS "constructor args..."
```

---

### 6.4 Update Frontend

Change in `presale-config.ts`:
```typescript
export const CURRENT_PRESALE = PRESALE_CONFIG.mainnet;
```

Rebuild and deploy:
```bash
npm run build
npx vercel --prod
```

---

## ✅ CHECKLIST

### Before Launch:
- [ ] Contracts deployed to testnet
- [ ] Presale started (30 days)
- [ ] Frontend connected to contracts
- [ ] Test contribution works
- [ ] Test claim works
- [ ] Verified on BscScan
- [ ] Liquidity wallet setup
- [ ] Operational wallet setup

### Launch Day:
- [ ] Deploy to BSC Mainnet
- [ ] Verify contracts
- [ ] Start presale
- [ ] Update frontend config
- [ ] Deploy frontend
- [ ] Announce to community
- [ ] Monitor contributions

---

## 🆘 TROUBLESHOOTING

### "Insufficient funds"
→ Get more testnet BNB from faucet

### "Transaction reverted"
→ Check presale is active: `presale.getPresaleInfo()`

### "Below minimum contribution"
→ Contribute at least $100

### "Exceeds maximum contribution"
→ Max $10k per wallet (cap is working!)

### "Hard cap reached"
→ Presale is full ($500k raised)

---

## 📞 IMPORTANT NOTES

1. **Test EVERYTHING on testnet first!**
2. **Save all contract addresses**
3. **Keep private keys SAFE**
4. **Verify contracts on BscScan**
5. **Double-check wallet addresses before mainnet**

---

## 🎉 SUCCESS METRICS

You'll know it works when:
- ✅ Users can contribute BNB
- ✅ Their allocation shows in UI
- ✅ Funds arrive in your wallets (60/40 split)
- ✅ Users can claim tokens after finalize
- ✅ Vesting dashboard shows locked tokens

---

Good luck! 🚀🔥

