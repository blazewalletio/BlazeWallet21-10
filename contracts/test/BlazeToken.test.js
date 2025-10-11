const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlazeToken - Comprehensive Tests", function () {
  let blazeToken;
  let owner, publicSale, founder, community, treasury, team, strategic, liquidity, user1, user2;

  beforeEach(async function () {
    // Get signers
    [owner, publicSale, founder, community, treasury, team, strategic, liquidity, user1, user2] = await ethers.getSigners();

    // Deploy BlazeToken
    const BlazeToken = await ethers.getContractFactory("BlazeToken");
    blazeToken = await BlazeToken.deploy(
      publicSale.address,
      founder.address,
      community.address,
      treasury.address,
      team.address,
      strategic.address,
      liquidity.address
    );

    await blazeToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await blazeToken.name()).to.equal("Blaze Token");
      expect(await blazeToken.symbol()).to.equal("BLAZE");
    });

    it("Should set the correct decimals", async function () {
      expect(await blazeToken.decimals()).to.equal(18n);
    });

    it("Should mint 1 billion tokens total", async function () {
      const totalSupply = await blazeToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000000"));
    });

    it("Should distribute tokens correctly", async function () {
      expect(await blazeToken.balanceOf(publicSale.address)).to.equal(ethers.parseEther("150000000"));
      expect(await blazeToken.balanceOf(liquidity.address)).to.equal(ethers.parseEther("100000000"));
      expect(await blazeToken.balanceOf(founder.address)).to.equal(ethers.parseEther("250000000")); // 100M unlocked + 150M locked
      expect(await blazeToken.balanceOf(community.address)).to.equal(ethers.parseEther("200000000"));
      expect(await blazeToken.balanceOf(treasury.address)).to.equal(ethers.parseEther("150000000"));
      expect(await blazeToken.balanceOf(team.address)).to.equal(ethers.parseEther("100000000"));
      expect(await blazeToken.balanceOf(strategic.address)).to.equal(ethers.parseEther("50000000"));
    });

    it("Should set wallet addresses correctly", async function () {
      expect(await blazeToken.publicSaleWallet()).to.equal(publicSale.address);
      expect(await blazeToken.founderWallet()).to.equal(founder.address);
      expect(await blazeToken.communityWallet()).to.equal(community.address);
      expect(await blazeToken.treasuryWallet()).to.equal(treasury.address);
      expect(await blazeToken.teamWallet()).to.equal(team.address);
      expect(await blazeToken.strategicWallet()).to.equal(strategic.address);
      expect(await blazeToken.liquidityWallet()).to.equal(liquidity.address);
    });
  });

  describe("Staking Constants", function () {
    it("Should have correct APY constants", async function () {
      expect(await blazeToken.FLEXIBLE_APY()).to.equal(800n); // 8%
      expect(await blazeToken.SIX_MONTH_APY()).to.equal(1500n); // 15%
      expect(await blazeToken.ONE_YEAR_APY()).to.equal(2000n); // 20%
    });

    it("Should have correct premium threshold", async function () {
      expect(await blazeToken.PREMIUM_THRESHOLD()).to.equal(ethers.parseEther("10000"));
    });

    it("Should have correct burn rate", async function () {
      expect(await blazeToken.BURN_RATE()).to.equal(10n); // 0.10%
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Transfer some tokens to user1
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("10000"));
    });

    it("Should allow flexible staking", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await blazeToken.connect(user1).stake(stakeAmount, 0);

      const [amount, timestamp, lockPeriod, pendingReward, premium, feeDiscount] = 
        await blazeToken.getStakeInfo(user1.address);

      expect(amount).to.equal(stakeAmount);
      expect(lockPeriod).to.equal(0n);
      expect(premium).to.equal(false); // Not premium at 1000 BLAZE (need 10000+)
      expect(feeDiscount).to.equal(1000n); // 10% discount
    });

    it("Should allow 6-month staking", async function () {
      // Need more tokens to get 25% discount threshold (10000+)
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("5000"));
      
      const stakeAmount = ethers.parseEther("10000");
      await blazeToken.connect(user1).stake(stakeAmount, 180);

      const [amount, timestamp, lockPeriod, pendingReward, premium, feeDiscount] = 
        await blazeToken.getStakeInfo(user1.address);

      expect(amount).to.equal(stakeAmount);
      expect(lockPeriod).to.equal(180n * 86400n); // 180 days in seconds
      expect(premium).to.equal(true);
      expect(feeDiscount).to.equal(2500n); // 25% discount
    });

    it("Should allow 1-year staking", async function () {
      // Give user fresh tokens (no burn from previous transfers)
      const freshUser = user2;
      await blazeToken.connect(publicSale).transfer(freshUser.address, ethers.parseEther("15000"));
      
      const stakeAmount = ethers.parseEther("10000");
      
      // Get balance before staking
      const balanceBefore = await blazeToken.balanceOf(freshUser.address);
      
      await blazeToken.connect(freshUser).stake(stakeAmount, 365);

      const [amount, timestamp, lockPeriod, pendingReward, premium, feeDiscount] = 
        await blazeToken.getStakeInfo(freshUser.address);

      expect(amount).to.equal(stakeAmount);
      expect(lockPeriod).to.equal(365n * 86400n); // 365 days in seconds
      expect(premium).to.equal(true);
      expect(feeDiscount).to.equal(2500n); // 25% discount
      
      // Balance should decrease
      const balanceAfter = await blazeToken.balanceOf(freshUser.address);
      expect(balanceAfter).to.be.lt(balanceBefore);
    });

    it("Should reject invalid lock periods", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await expect(
        blazeToken.connect(user1).stake(stakeAmount, 90)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("Should reject staking 0 tokens", async function () {
      await expect(
        blazeToken.connect(user1).stake(0, 0)
      ).to.be.revertedWith("Cannot stake 0 tokens");
    });

    it("Should reject staking more than balance", async function () {
      const tooMuch = ethers.parseEther("20000"); // User only has 10000
      await expect(
        blazeToken.connect(user1).stake(tooMuch, 0)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should update totalStaked correctly", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      const totalStakedBefore = await blazeToken.totalStaked();
      await blazeToken.connect(user1).stake(stakeAmount, 0);
      const totalStakedAfter = await blazeToken.totalStaked();

      expect(totalStakedAfter - totalStakedBefore).to.equal(stakeAmount);
    });

    it("Should activate premium at 10000+ BLAZE", async function () {
      // Give user 15000 tokens
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("5000"));
      
      const stakeAmount = ethers.parseEther("10000");
      await blazeToken.connect(user1).stake(stakeAmount, 0);

      const [amount, timestamp, lockPeriod, pendingReward, premium, feeDiscount] = 
        await blazeToken.getStakeInfo(user1.address);

      expect(premium).to.equal(true); // Premium at 10000 BLAZE
      expect(amount).to.equal(stakeAmount);
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      // Transfer and stake tokens
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("10000"));
      await blazeToken.connect(user1).stake(ethers.parseEther("1000"), 0);
    });

    it("Should allow unstaking flexible stake immediately", async function () {
      await blazeToken.connect(user1).unstake();

      const [amount] = await blazeToken.getStakeInfo(user1.address);
      expect(amount).to.equal(0n);
    });

    it("Should reject unstaking locked tokens before lock period", async function () {
      // Stake with lock period
      await blazeToken.connect(publicSale).transfer(user2.address, ethers.parseEther("10000"));
      await blazeToken.connect(user2).stake(ethers.parseEther("1000"), 180);

      await expect(
        blazeToken.connect(user2).unstake()
      ).to.be.revertedWith("Tokens still locked");
    });

    it("Should reject unstaking when no stake exists", async function () {
      await expect(
        blazeToken.connect(user2).unstake()
      ).to.be.revertedWith("No stake found");
    });

    it("Should update totalStaked on unstake", async function () {
      const totalStakedBefore = await blazeToken.totalStaked();
      await blazeToken.connect(user1).unstake();
      const totalStakedAfter = await blazeToken.totalStaked();

      expect(totalStakedBefore - totalStakedAfter).to.equal(ethers.parseEther("1000"));
    });

    it("Should remove premium status on unstake", async function () {
      // Need to stake 10000+ to get premium
      await blazeToken.connect(publicSale).transfer(user2.address, ethers.parseEther("15000"));
      await blazeToken.connect(user2).stake(ethers.parseEther("10000"), 0);
      
      const [,,,,premiumBefore] = await blazeToken.getStakeInfo(user2.address);
      expect(premiumBefore).to.equal(true);

      await blazeToken.connect(user2).unstake();

      const [,,,,premiumAfter] = await blazeToken.getStakeInfo(user2.address);
      expect(premiumAfter).to.equal(false);
    });
  });

  describe("Rewards Calculation", function () {
    beforeEach(async function () {
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("10000"));
    });

    it("Should calculate rewards correctly for flexible staking", async function () {
      await blazeToken.connect(user1).stake(ethers.parseEther("1000"), 0);

      // Fast forward 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const reward = await blazeToken.calculateReward(user1.address);
      
      // Expected: (1000 * 800 * 30 days) / (365 days * 10000) ≈ 6.575 BLAZE
      expect(reward).to.be.gt(ethers.parseEther("6"));
      expect(reward).to.be.lt(ethers.parseEther("7"));
    });

    it("Should return 0 reward for non-stakers", async function () {
      const reward = await blazeToken.calculateReward(user2.address);
      expect(reward).to.equal(0n);
    });
  });

  describe("Fee Discounts", function () {
    beforeEach(async function () {
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("150000"));
    });

    it("Should give 10% discount for 1000+ BLAZE", async function () {
      await blazeToken.connect(user1).stake(ethers.parseEther("1000"), 0);
      const [,,,,,feeDiscount] = await blazeToken.getStakeInfo(user1.address);
      expect(feeDiscount).to.equal(1000n); // 10%
    });

    it("Should give 25% discount for 10000+ BLAZE", async function () {
      await blazeToken.connect(user1).stake(ethers.parseEther("10000"), 0);
      const [,,,,,feeDiscount] = await blazeToken.getStakeInfo(user1.address);
      expect(feeDiscount).to.equal(2500n); // 25%
    });

    it("Should give 50% discount for 50000+ BLAZE", async function () {
      await blazeToken.connect(user1).stake(ethers.parseEther("50000"), 0);
      const [,,,,,feeDiscount] = await blazeToken.getStakeInfo(user1.address);
      expect(feeDiscount).to.equal(5000n); // 50%
    });

    it("Should give 75% discount for 100000+ BLAZE", async function () {
      await blazeToken.connect(user1).stake(ethers.parseEther("100000"), 0);
      const [,,,,,feeDiscount] = await blazeToken.getStakeInfo(user1.address);
      expect(feeDiscount).to.equal(7500n); // 75%
    });
  });

  describe("Token Statistics", function () {
    it("Should return correct token stats initially", async function () {
      const [circulatingSupply, burnedSupply, stakedSupply, effectiveSupply] = 
        await blazeToken.getTokenStats();

      expect(circulatingSupply).to.equal(ethers.parseEther("1000000000"));
      expect(burnedSupply).to.equal(0n);
      expect(stakedSupply).to.equal(0n);
      expect(effectiveSupply).to.equal(ethers.parseEther("1000000000"));
    });

    it("Should update staked supply after staking", async function () {
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("10000"));
      await blazeToken.connect(user1).stake(ethers.parseEther("1000"), 0);

      const [,,stakedSupply,] = await blazeToken.getTokenStats();
      expect(stakedSupply).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Burning", function () {
    it("Should burn 0.10% on transfers", async function () {
      const transferAmount = ethers.parseEther("1000");
      const expectedBurn = transferAmount * 10n / 10000n; // 0.10%

      await blazeToken.connect(publicSale).transfer(user1.address, transferAmount);

      const totalBurned = await blazeToken.totalBurned();
      expect(totalBurned).to.equal(expectedBurn);
    });

    it("Should not burn on staking", async function () {
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("10000"));
      
      const burnedBefore = await blazeToken.totalBurned();
      await blazeToken.connect(user1).stake(ethers.parseEther("1000"), 0);
      const burnedAfter = await blazeToken.totalBurned();

      // Only the initial transfer should have burned tokens
      expect(burnedAfter).to.equal(burnedBefore);
    });

    it("Should allow owner to burn from treasury", async function () {
      const burnAmount = ethers.parseEther("1000000");
      
      await blazeToken.burnFromTreasury(burnAmount);

      const totalBurned = await blazeToken.totalBurned();
      expect(totalBurned).to.be.gte(burnAmount);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await blazeToken.pause();
      
      await expect(
        blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(blazeToken, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await blazeToken.pause();
      await blazeToken.unpause();
      
      await expect(
        blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("1000"))
      ).to.not.be.reverted;
    });

    it("Should reject non-owner pause", async function () {
      await expect(
        blazeToken.connect(user1).pause()
      ).to.be.revertedWithCustomError(blazeToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to burn from treasury", async function () {
      await expect(
        blazeToken.connect(user1).burnFromTreasury(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(blazeToken, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to pause", async function () {
      await expect(
        blazeToken.connect(user1).pause()
      ).to.be.revertedWithCustomError(blazeToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple users staking", async function () {
      // Setup multiple users
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("10000"));
      await blazeToken.connect(publicSale).transfer(user2.address, ethers.parseEther("10000"));

      // Both stake
      await blazeToken.connect(user1).stake(ethers.parseEther("5000"), 0);
      await blazeToken.connect(user2).stake(ethers.parseEther("3000"), 180);

      const totalStaked = await blazeToken.totalStaked();
      expect(totalStaked).to.equal(ethers.parseEther("8000"));

      const [amount1] = await blazeToken.getStakeInfo(user1.address);
      const [amount2] = await blazeToken.getStakeInfo(user2.address);

      expect(amount1).to.equal(ethers.parseEther("5000"));
      expect(amount2).to.equal(ethers.parseEther("3000"));
    });

    it("Should handle stake, wait, claim, unstake flow", async function () {
      await blazeToken.connect(publicSale).transfer(user1.address, ethers.parseEther("10000"));
      
      // Stake
      await blazeToken.connect(user1).stake(ethers.parseEther("1000"), 0);
      
      // Wait 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Check reward
      const reward = await blazeToken.calculateReward(user1.address);
      expect(reward).to.be.gt(0n);
      
      // Unstake
      await blazeToken.connect(user1).unstake();
      
      // Should have no stake
      const [amount] = await blazeToken.getStakeInfo(user1.address);
      expect(amount).to.equal(0n);
    });
  });
});

