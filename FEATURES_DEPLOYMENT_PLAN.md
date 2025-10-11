# 🚀 BLAZE Features Deployment Plan

## 📋 OVERZICHT

Dit document beschrijft hoe we alle BLAZE features stap voor stap werkend krijgen:
1. Eerst op **TESTNET** (gratis testen)
2. Dan op **MAINNET** (echte launch)

---

## ✅ HUIDIGE STATUS

### AL LIVE OP BSC TESTNET:
- ✅ **Presale Contract**: `0x8321C862B49C4Ad9132e55c3B24Cb72772B30fdd`
- ✅ **BLAZE Token**: `0x2C1421595151991ac3894943123d6c285bdF5116`
- ✅ **Network**: BSC Testnet (Chain ID: 97)
- ✅ **Status**: Presale is actief en werkend!

### NOG TE DEPLOYEN:
- ⏳ **Staking** (ingebouwd in BlazeToken, needs mainnet deployment)
- ⏳ **Governance** (nieuw contract nodig)
- ⏳ **Launchpad** (nieuw contract nodig)
- ⏳ **NFT Skins** (nieuw contract nodig)
- ⏳ **Cashback** (off-chain systeem, database)
- ⏳ **Referrals** (off-chain systeem, database)
- ⏳ **Vesting** (contract bestaat al, moet gedeployed worden)

---

## 🎯 FASE 1: TESTNET DEPLOYMENT (3-5 DAGEN)

### 📝 STAP 1.1: BLAZE TOKEN + STAKING (AL KLAAR!)

**Status**: ✅ **DONE** - Token is al gedeployed op testnet

**Contract**: `BlazeToken.sol` bevat al:
- ERC20 token functionaliteit
- Staking met 3 opties (Flexible 8%, 6 maanden 15%, 1 jaar 20% APY)
- Burn mechanisme (0.1% per transfer)
- Premium membership (1000+ BLAZE staked)

**Frontend Te Doen**:
- [ ] Koppel `StakingDashboard.tsx` aan het echte contract
- [ ] Implementeer stake/unstake functies met ethers.js
- [ ] Toon real-time staking balances
- [ ] Toon rewards calculator

**Benodigde Tijd**: 4-6 uur

---

### 📝 STAP 1.2: GOVERNANCE CONTRACT

**Wat is het?**
- Users kunnen voorstellen indienen
- Stemmen met BLAZE tokens (1 token = 1 stem)
- Proposals worden automatisch uitgevoerd na approval

**Smart Contract Structuur**:
```solidity
contract BlazeGovernance {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        ProposalState state;
    }
    
    // Minimaal 10,000 BLAZE nodig om proposal te maken
    uint256 public constant PROPOSAL_THRESHOLD = 10000 * 10**18;
    
    // Voting period: 7 dagen
    uint256 public constant VOTING_PERIOD = 7 days;
    
    // 51% majority nodig
    uint256 public constant QUORUM = 51;
}
```

**Deployment Stappen**:
1. Maak `contracts/contracts/BlazeGovernance.sol`
2. Implementeer voting logica
3. Deploy naar testnet
4. Test met dummy proposals
5. Koppel aan `GovernanceDashboard.tsx`

**Benodigde Tijd**: 8-10 uur

---

### 📝 STAP 1.3: LAUNCHPAD CONTRACT

**Wat is het?**
- Nieuwe crypto projects kunnen presale doen via Blaze
- BLAZE holders krijgen early access
- Platform verdient fees (bijv. 2% van raised amount)

**Smart Contract Structuur**:
```solidity
contract BlazeChainLaunchpad {
    struct LaunchProject {
        address tokenAddress;
        address creator;
        uint256 softCap;
        uint256 hardCap;
        uint256 minContribution;
        uint256 maxContribution;
        uint256 tokenPrice;
        uint256 raised;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
    }
    
    // Vereist BLAZE staking voor early access
    uint256 public constant EARLY_ACCESS_THRESHOLD = 5000 * 10**18;
    
    // Platform fee: 2% van raised amount
    uint256 public constant PLATFORM_FEE = 200; // 2% in basis points
}
```

**Deployment Stappen**:
1. Maak `contracts/contracts/BlazeChainLaunchpad.sol`
2. Implementeer presale logica (lijkt op huidige presale)
3. Deploy naar testnet
4. Maak test project
5. Koppel aan `LaunchpadDashboard.tsx`

**Benodigde Tijd**: 10-12 uur

---

### 📝 STAP 1.4: NFT SKINS CONTRACT

**Wat is het?**
- NFTs die wallet themes/skins unlocken
- Users kunnen kopen met BLAZE tokens
- Limited editions voor collectors

**Smart Contract Structuur**:
```solidity
contract BlazeWalletSkins is ERC721 {
    struct Skin {
        uint256 id;
        string name;
        string imageURI;
        uint256 price; // Prijs in BLAZE
        uint256 totalSupply;
        uint256 minted;
        bool isLimited;
    }
    
    // Prijzen in BLAZE tokens
    uint256 public constant BASIC_SKIN_PRICE = 100 * 10**18;     // 100 BLAZE
    uint256 public constant PREMIUM_SKIN_PRICE = 500 * 10**18;   // 500 BLAZE
    uint256 public constant LIMITED_SKIN_PRICE = 2000 * 10**18;  // 2000 BLAZE
    
    // Premium members krijgen 50% discount
    uint256 public constant PREMIUM_DISCOUNT = 50;
}
```

**Deployment Stappen**:
1. Maak `contracts/contracts/BlazeWalletSkins.sol`
2. Maak collectie van 10+ skins
3. Upload skin images naar IPFS
4. Deploy contract naar testnet
5. Mint test skins
6. Koppel aan `NFTMintDashboard.tsx`

**Benodigde Tijd**: 12-16 uur

---

### 📝 STAP 1.5: CASHBACK SYSTEEM

**Wat is het?**
- Users verdienen cashback op swaps/transactions
- Uitbetaald in BLAZE tokens
- Premium members krijgen 2x cashback

**Implementatie**: 
Dit kan **off-chain** (geen smart contract nodig):
- Track transactions in database
- Bereken cashback percentages
- Periodiek uitbetalen (bijv. wekelijks)
- Gebruik treasury wallet voor payouts

**Database Schema**:
```typescript
CashbackTransaction {
  id: string;
  userId: string;
  walletAddress: string;
  txHash: string;
  amount: number;
  cashbackRate: number; // 0.5% voor regulier, 1% voor premium
  cashbackAmount: number;
  status: 'pending' | 'approved' | 'paid';
  paidAt?: Date;
}
```

**Backend Te Doen**:
- [ ] Maak API endpoints voor cashback tracking
- [ ] Implementeer transaction listener (luister naar swaps)
- [ ] Maak admin panel voor cashback approval
- [ ] Implementeer automatische payout systeem
- [ ] Koppel aan `CashbackTracker.tsx`

**Benodigde Tijd**: 8-10 uur

---

### 📝 STAP 1.6: REFERRAL SYSTEEM

**Wat is het?**
- Users krijgen unieke referral link
- Verdien 10% van wat je referrals verdienen
- Bonus rewards voor actieve referrers

**Implementatie**: 
Ook **off-chain** (database):
- Genereer unieke referral codes
- Track wie wie heeft referred
- Bereken rewards automatisch
- Multi-level mogelijk (2 levels deep)

**Database Schema**:
```typescript
ReferralUser {
  walletAddress: string;
  referralCode: string;
  referredBy?: string;
  totalReferred: number;
  totalEarned: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

ReferralReward {
  id: string;
  referrer: string;
  referee: string;
  amount: number;
  source: 'staking' | 'swap' | 'cashback';
  status: 'pending' | 'paid';
}
```

**Backend Te Doen**:
- [ ] Maak API endpoints voor referrals
- [ ] Implementeer referral code generation
- [ ] Track referral rewards
- [ ] Implementeer tier systeem (meer referrals = hoger tier)
- [ ] Koppel aan `ReferralDashboard.tsx`

**Benodigde Tijd**: 6-8 uur

---

### 📝 STAP 1.7: VESTING CONTRACT (FOUNDER ONLY)

**Status**: Contract bestaat al (`FounderVesting.sol`)

**Wat is het?**
- 150M BLAZE locked voor founders
- Lineair vrijgegeven over 3 jaar
- Alleen zichtbaar voor founder wallets

**Deployment Stappen**:
1. Deploy `FounderVesting.sol` naar testnet
2. Transfer 150M BLAZE naar vesting contract
3. Verifieer vesting schedule
4. Test claim functie
5. Koppel aan `VestingDashboard.tsx`

**Benodigde Tijd**: 2-3 uur

---

## 📊 FASE 1 SAMENVATTING

### Total Development Time: ~50-65 uur

**Prioriteit & Volgorde**:
1. ⭐⭐⭐ **Staking** (4-6u) - Meest belangrijk, token utility
2. ⭐⭐⭐ **Governance** (8-10u) - Community engagement
3. ⭐⭐⭐ **Cashback** (8-10u) - User retention
4. ⭐⭐ **Referrals** (6-8u) - Growth mechanism
5. ⭐⭐ **Launchpad** (10-12u) - Revenue generator
6. ⭐ **NFT Skins** (12-16u) - Nice to have, fun feature
7. ⭐ **Vesting** (2-3u) - Alleen voor founders

**Aanbevolen Aanpak**:
- Week 1: Staking + Governance + Cashback (20-26u)
- Week 2: Referrals + Launchpad (16-20u)
- Week 3: NFT Skins + Vesting + Testing (14-19u)

---

## 🚀 FASE 2: MAINNET DEPLOYMENT (1-2 DAGEN)

**Wanneer?** Alleen als:
- ✅ Alle features getest op testnet
- ✅ Security audit gedaan (minimaal internal review)
- ✅ Alles werkt 100% foutloos
- ✅ Team is ready voor launch
- ✅ Marketing is voorbereid

**Deployment Volgorde**:
1. Deploy BlazeToken naar BSC Mainnet
2. Deploy Governance contract
3. Deploy Launchpad contract  
4. Deploy NFT Skins contract
5. Deploy Vesting contract
6. Update alle frontend contract addresses
7. Set backend naar mainnet endpoints
8. Voeg liquidity toe (PancakeSwap)
9. Lock liquidity tokens (2+ jaar)
10. Announce launch! 🎉

**Kosten** (BSC Mainnet):
- Per contract deployment: ~$5-10 in BNB
- Total: ~$30-50 voor alle contracts
- Liquidity: Minimaal $50k+ (afhankelijk van initial price)

---

## 🔧 TECHNISCHE SETUP

### Environment Variables

Voeg toe aan `.env`:
```bash
# Testnet
NEXT_PUBLIC_BLAZE_TOKEN_TESTNET=0x2C1421595151991ac3894943123d6c285bdF5116
NEXT_PUBLIC_PRESALE_TESTNET=0x8321C862B49C4Ad9132e55c3B24Cb72772B30fdd
NEXT_PUBLIC_GOVERNANCE_TESTNET=<deploy first>
NEXT_PUBLIC_LAUNCHPAD_TESTNET=<deploy first>
NEXT_PUBLIC_NFT_SKINS_TESTNET=<deploy first>
NEXT_PUBLIC_VESTING_TESTNET=<deploy first>

# Mainnet (later)
NEXT_PUBLIC_BLAZE_TOKEN_MAINNET=
NEXT_PUBLIC_PRESALE_MAINNET=
NEXT_PUBLIC_GOVERNANCE_MAINNET=
NEXT_PUBLIC_LAUNCHPAD_MAINNET=
NEXT_PUBLIC_NFT_SKINS_MAINNET=
NEXT_PUBLIC_VESTING_MAINNET=

# Backend
DATABASE_URL=<your database>
TREASURY_WALLET_KEY=<for cashback/referral payouts>
```

### Frontend Service Files

Maak deze service files:
- `lib/staking-service.ts` - Staking interactions
- `lib/governance-service.ts` - Governance interactions
- `lib/launchpad-service.ts` - Launchpad interactions
- `lib/nft-skins-service.ts` - NFT interactions
- `app/api/cashback/route.ts` - Cashback API
- `app/api/referrals/route.ts` - Referrals API

---

## 📝 VOLGENDE STAPPEN

**NU METEEN DOEN**:
1. Kies welke feature je EERST wilt (ik raad **Staking** aan)
2. Laat me weten: wil je dat ik begin met het contract OF de frontend?
3. Of wil je eerst het complete contract voor alle features zien?

**Wat heb je nodig van mij?**
- Smart contracts schrijven? ✅
- Frontend koppelen aan contracts? ✅
- Backend API's bouwen? ✅
- Database schema maken? ✅
- Deploy scripts maken? ✅

**Zeg het maar!** 🚀

---

## 🎯 SNELLE KEUZE OPTIE

Als je niet weet waar te beginnen:

**OPTIE A: "Maak alles klaar voor Staking"** (meest impact, ~6u werk)
- Ik maak `StakingService` klaar
- Koppel aan bestaand BlazeToken contract
- Test op testnet
- Deploy nieuwe versie

**OPTIE B: "Maak alle smart contracts"** (~20u werk)
- Ik schrijf alle 4 de ontbrekende contracts
- Deploy allemaal naar testnet
- Test basis functionaliteit
- Dan koppelen we frontend

**OPTIE C: "Begin met off-chain features"** (~16u werk)
- Cashback systeem compleet werkend maken
- Referral systeem compleet werkend maken
- Database + API's + Frontend
- Geen blockchain deployment nodig

**Welke kies je? Of wil je iets anders?** 🤔

