# 🔥 BlazeToken Contract - Volledige Specificaties

## 📊 **TOKENOMICS**

### Total Supply: 1,000,000,000 BLAZE (1 Miljard)

| Categorie | Tokens | Percentage | Wallet | Status |
|-----------|--------|------------|--------|--------|
| **Public Sale** | 150,000,000 | 15% | publicSaleWallet | ✅ Unlocked |
| **Liquidity** | 100,000,000 | 10% | liquidityWallet | ✅ Unlocked |
| **Founder (Unlocked)** | 100,000,000 | 10% | founderWallet | ✅ Unlocked |
| **Founder (Locked)** | 150,000,000 | 15% | founderWallet | 🔒 Vesting |
| **Community** | 200,000,000 | 20% | communityWallet | ✅ Unlocked |
| **Treasury** | 150,000,000 | 15% | treasuryWallet | ✅ Unlocked |
| **Team** | 100,000,000 | 10% | teamWallet | ✅ Unlocked |
| **Strategic** | 50,000,000 | 5% | strategicWallet | ✅ Unlocked |

**Totaal bij deployment:** 1,000,000,000 BLAZE  
**Founder locked tokens:** 150M gemint naar founderWallet (kan later naar vesting contract)

---

## 🔒 **STAKING FEATURES**

### APY Rates (Annual Percentage Yield)
- **Flexible Staking:** 8% APY (lockPeriod = 0 dagen)
- **6 Month Lock:** 15% APY (lockPeriod = 180 dagen)
- **1 Year Lock:** 20% APY (lockPeriod = 365 dagen)

### Staking Mechanisme
- **Tokens worden getransferred naar contract** bij staking
- **Rewards komen uit communityWallet** (200M BLAZE voor rewards)
- **Unstaking voor lock period:** Niet toegestaan (revert)
- **Flexible unstaking:** Altijd mogelijk
- **Reward berekening:** Real-time, elke seconde (amount × APY × duration / (365 days × 10000))

### Premium Membership
- **Threshold:** 10,000 BLAZE gestaked
- **Benefits:** 
  - Premium status badge
  - Hogere fee discounts
  - Toegang tot premium features (in wallet UI)

---

## 💰 **FEE DISCOUNTS**

Gebaseerd op gestakete hoeveelheid:

| Staked Amount | Discount | Basis Points |
|---------------|----------|--------------|
| 1,000 - 9,999 BLAZE | 10% | 1000 |
| 10,000 - 49,999 BLAZE | 25% | 2500 |
| 50,000 - 99,999 BLAZE | 50% | 5000 |
| 100,000+ BLAZE | 75% | 7500 |

**Gebruik:** Deze discounts kunnen worden toegepast op transactiekosten in de wallet.

---

## 🔥 **BURNING MECHANISM**

### Automatische Burns
- **Burn Rate:** 0.10% (10 basis points per 10,000)
- **Bij elke transfer:** 0.10% wordt geburnd
- **Exempt adressen:**
  - Minting (from = address(0))
  - Burning (to = address(0))
  - Staking (to = contract)
  - Unstaking (from = contract)
  - Liquidity wallet

### Handmatige Burns
- **Treasury Buyback & Burn:** Owner kan tokens uit treasury burnen
- **Doel:** Deflationair model, supply daalt over tijd

---

## 🛡️ **SECURITY FEATURES**

### Access Control
- **Owner:** Deployer wallet (kan worden overgedragen)
- **Owner functies:**
  - `pause()` - Emergency stop van alle transfers
  - `unpause()` - Hervatten van transfers
  - `burnFromTreasury()` - Burn tokens uit treasury

### Reentrancy Protection
- **ReentrancyGuard** op alle staking/unstaking functies
- **Beschermt tegen:** Reentrancy attacks

### Pausable
- **Emergency stop:** Owner kan alle transfers pauzeren
- **Gebruik:** Alleen in noodgevallen (hack, kritieke bug)

---

## 📈 **SMART CONTRACT FUNCTIES**

### Publieke Read Functies
```solidity
name() → "Blaze Token"
symbol() → "BLAZE"
decimals() → 18
totalSupply() → 1,000,000,000 BLAZE
balanceOf(address) → uint256
getStakeInfo(address) → (amount, timestamp, lockPeriod, pendingReward, premium, feeDiscount)
calculateReward(address) → uint256
getTokenStats() → (circulatingSupply, burnedSupply, stakedSupply, effectiveSupply)
isPremium(address) → bool
feeDiscounts(address) → uint256
totalStaked() → uint256
totalBurned() → uint256
FLEXIBLE_APY() → 800 (8%)
SIX_MONTH_APY() → 1500 (15%)
ONE_YEAR_APY() → 2000 (20%)
PREMIUM_THRESHOLD() → 10,000 BLAZE
BURN_RATE() → 10 (0.10%)
```

### Publieke Write Functies
```solidity
stake(uint256 amount, uint256 lockPeriod) - Stake tokens
unstake() - Unstake alle tokens + rewards
claimRewards() - Claim rewards zonder unstaken
transfer(address to, uint256 amount) - ERC20 transfer (met 0.10% burn)
approve(address spender, uint256 amount) - ERC20 approve
transferFrom(address from, address to, uint256 amount) - ERC20 transferFrom
burn(uint256 amount) - Burn eigen tokens
```

### Owner-Only Functies
```solidity
pause() - Pauzeer alle transfers
unpause() - Hervat transfers
burnFromTreasury(uint256 amount) - Burn tokens uit treasury
transferOwnership(address newOwner) - Transfer ownership
```

---

## ✅ **TESTING RESULTATEN**

### Test Coverage: 39/39 Tests Passed (100%)

**Deployment Tests (5/5):**
- ✅ Correcte naam en symbol
- ✅ Correcte decimals (18)
- ✅ 1 miljard tokens gemint
- ✅ Juiste token distributie
- ✅ Wallet adressen correct ingesteld

**Staking Constants Tests (3/3):**
- ✅ APY waardes correct
- ✅ Premium threshold 10,000 BLAZE
- ✅ Burn rate 0.10%

**Staking Tests (7/7):**
- ✅ Flexible staking werkt
- ✅ 6-month staking werkt
- ✅ 1-year staking werkt
- ✅ Ongeldige lock periods worden geweigerd
- ✅ Kan niet 0 tokens staken
- ✅ Kan niet meer staken dan balance
- ✅ totalStaked wordt correct bijgewerkt
- ✅ Premium activatie bij 10,000+ BLAZE

**Unstaking Tests (5/5):**
- ✅ Flexible unstaking werkt direct
- ✅ Locked tokens kunnen niet voor tijd unstaken
- ✅ Geen stake = kan niet unstaken
- ✅ totalStaked update bij unstake
- ✅ Premium status wordt verwijderd bij unstake

**Rewards Tests (2/2):**
- ✅ Reward berekening correct voor flexible staking
- ✅ Geen rewards voor non-stakers

**Fee Discount Tests (4/4):**
- ✅ 10% discount bij 1,000+ BLAZE
- ✅ 25% discount bij 10,000+ BLAZE
- ✅ 50% discount bij 50,000+ BLAZE
- ✅ 75% discount bij 100,000+ BLAZE

**Token Statistics Tests (2/2):**
- ✅ Correcte initiële stats
- ✅ Staked supply update na staking

**Burning Tests (3/3):**
- ✅ 0.10% burn bij transfers
- ✅ Geen burn bij staking
- ✅ Owner kan treasury burnen

**Pausable Tests (3/3):**
- ✅ Owner kan pauzeren
- ✅ Owner kan unpauzeren
- ✅ Non-owner kan niet pauzeren

**Access Control Tests (2/2):**
- ✅ Alleen owner kan treasury burnen
- ✅ Alleen owner kan pauzeren

**Integration Tests (2/2):**
- ✅ Meerdere gebruikers kunnen staken
- ✅ Volledige stake → wait → claim → unstake flow werkt

---

## 🚀 **DEPLOYMENT INFORMATIE**

### Network
- **Blockchain:** Binance Smart Chain (BSC)
- **Testnet Chain ID:** 97
- **Mainnet Chain ID:** 56

### Gas Requirements
- **Contract Deployment:** ~4-5 miljoen gas (~0.02-0.025 BNB op testnet)
- **Stake Transaction:** ~150,000 gas
- **Unstake Transaction:** ~180,000 gas
- **Transfer Transaction:** ~65,000 gas

### Contract Size
- **Bytecode:** ~9,490 characters
- **Source Lines:** 363 lines
- **Optimized:** Yes (via IR)

---

## 🔗 **EXTERNE INTEGRATIES**

### Dependencies
- **OpenZeppelin Contracts v5.x:**
  - ERC20
  - ERC20Burnable
  - ERC20Pausable
  - Ownable
  - ReentrancyGuard

### Frontend Integration
- **Web3 Library:** ethers.js v6
- **Contract ABI:** Auto-generated bij compilatie
- **Required Functions:** Alle publieke read/write functies

---

## ⚠️ **BELANGRIJKE OPMERKINGEN**

### 1. Founder Locked Tokens
- **150M BLAZE** wordt bij deployment gemint naar `founderWallet`
- Deze tokens kunnen later worden getransferred naar een vesting contract
- Voor testnet: blijven op founder wallet
- Voor mainnet: direct naar vesting contract sturen na deployment

### 2. Rewards Sustainability
- **200M BLAZE** in communityWallet voor staking rewards
- Bij 8% APY en 100% gestaked: ~80M BLAZE per jaar nodig
- Bij 20% APY en 100% gestaked: ~200M BLAZE per jaar nodig
- **Oplossing:** Realistische staking participatie is ~20-40%, dus rewards zijn houdbaar voor 2-5 jaar

### 3. Burn Impact
- 0.10% per transfer is subtiel maar effectief
- Bij 1M transacties: ~1000 transfers × 1000 BLAZE = 1M BLAZE geburnd
- Over jaren: significante supply reductie

### 4. Premium Threshold
- 10,000 BLAZE threshold = ~$1000-5000 (afhankelijk van token prijs)
- Dit zorgt ervoor dat alleen serieuze holders premium krijgen
- Kan leiden tot meer staking (goed voor tokenomics)

### 5. Immutability
- **Contract kan NIET worden aangepast na deployment**
- Alle parameters zijn hardcoded of constant
- Voor updates: nieuw contract deployen en migratie doen

---

## 📝 **DEPLOYMENT CHECKLIST**

### Pre-Deployment
- ✅ Alle tests passed (39/39)
- ✅ Contract gecompileerd zonder errors
- ✅ Tokenomics correct (1B total)
- ✅ Premium threshold 10,000 BLAZE
- ✅ APY rates correct
- ✅ Burn rate 0.10%

### Deployment
- ⏳ BNB balance check (min 0.05 BNB)
- ⏳ Deploy BlazeToken contract
- ⏳ Verify deployment success
- ⏳ Test stake/unstake functionaliteit
- ⏳ Verify contract on BSCScan (optional)

### Post-Deployment
- ⏳ Update frontend config met nieuwe contract adres
- ⏳ Update presale contract met nieuwe token adres (indien nodig)
- ⏳ Send test tokens naar test wallets
- ⏳ Test volledige wallet integratie
- ⏳ Deploy andere contracts (Governance, Launchpad, etc.)
- ⏳ Announce nieuwe contract adres

---

## 🎯 **CONCLUSIE**

Het BlazeToken contract is:
- ✅ **Volledig getest** (39/39 tests passed)
- ✅ **Veilig** (ReentrancyGuard, Pausable, Access Control)
- ✅ **Compleet** (Alle features geïmplementeerd)
- ✅ **Geoptimaliseerd** (Gas efficient)
- ✅ **Ready voor deployment**

**Status: READY TO DEPLOY** 🚀

Upload BNB naar deployer wallet en we kunnen live gaan!

