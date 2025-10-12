'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownLeft, ArrowLeft, RefreshCw, Settings, 
  TrendingUp, Eye, EyeOff, Plus, Zap, ChevronRight,
  Repeat, Wallet as WalletIcon, TrendingDown, PieChart, Rocket, CreditCard,
  Lock, Gift, Vote, Users, Palette, LogOut
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { useTranslation } from '@/lib/useTranslation';
import { BlockchainService } from '@/lib/blockchain';
import { TokenService } from '@/lib/token-service';
import { PriceService } from '@/lib/price-service';
import { CHAINS, POPULAR_TOKENS } from '@/lib/chains';
import { Token } from '@/lib/types';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import BuyModal from './BuyModal';
import ChainSelector from './ChainSelector';
import TokenSelector from './TokenSelector';
import PortfolioChart from './PortfolioChart';
import SettingsModal from './SettingsModal';
import DebugPanel from './DebugPanel';
import AnimatedNumber from './AnimatedNumber';
import QuickPayModal from './QuickPayModal';
import FounderDeploy from './FounderDeploy';
import TransactionHistory from './TransactionHistory';
import StakingDashboard from './StakingDashboard';
import GovernanceDashboard from './GovernanceDashboard';
import LaunchpadDashboard from './LaunchpadDashboard';
import ReferralDashboard from './ReferralDashboard';
import NFTMintDashboard from './NFTMintDashboard';
import CashbackTracker from './CashbackTracker';
import PremiumBadge, { PremiumCard } from './PremiumBadge';
import PresaleDashboard from './PresaleDashboard';
import VestingDashboard from './VestingDashboard';
import { getPortfolioHistory } from '@/lib/portfolio-history';

export default function Dashboard() {
  const { 
    address, 
    balance, 
    updateBalance, 
    currentChain, 
    tokens,
    updateTokens,
    updateActivity,
    lockWallet 
  } = useWalletStore();

  // Founder/Developer wallet addresses (add your addresses here)
  const founderAddresses = [
    '0x18347d3bcb33721e0c603befd2ffac8762d5a24d', // Your main wallet
    '0x742d35cc6634c0532925a3b8d0c9e5c3d3e8d3f5', // Add other founder addresses
    // Add more founder/developer addresses as needed
  ].map(addr => addr.toLowerCase());

  // Check if current wallet is a founder/developer
  const isFounder = address && founderAddresses.includes(address.toLowerCase());
  
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [showFounderDeploy, setShowFounderDeploy] = useState(false);
  const [showStaking, setShowStaking] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showNFTMint, setShowNFTMint] = useState(false);
  const [showCashback, setShowCashback] = useState(false);
  const [showPresale, setShowPresale] = useState(false);
  const [showVesting, setShowVesting] = useState(false);
  const [totalValueUSD, setTotalValueUSD] = useState(0);
  const [change24h, setChange24h] = useState(2.5);
  const [chartData, setChartData] = useState<number[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(24); // Default: 24 hours

  const { t } = useTranslation();
  const chain = CHAINS[currentChain];
  const blockchain = new BlockchainService(currentChain as any);
  const tokenService = new TokenService(chain.rpcUrl);
  const priceService = new PriceService();
  const portfolioHistory = getPortfolioHistory();

  const fetchData = async (force = false) => {
    if (!address) return;
    
    // Prevent multiple simultaneous refreshes
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Force refresh - bypass any caching
      const timestamp = Date.now();
      console.log(`[${timestamp}] Fetching balance for ${address} on ${currentChain}`);
      
      // Fetch native balance
      const bal = await blockchain.getBalance(address);
      console.log(`[${timestamp}] Balance received: ${bal} ${chain.nativeCurrency.symbol}`);
      updateBalance(bal);

      // Fetch native price
      const nativePrice = await priceService.getPrice(chain.nativeCurrency.symbol);
      const nativeValueUSD = parseFloat(bal) * nativePrice;
      
      console.log(`[${timestamp}] Native balance details:`, {
        balance: bal,
        symbol: chain.nativeCurrency.symbol,
        priceUSD: nativePrice,
        valueUSD: nativeValueUSD
      });

      // Fetch token balances
      const popularTokens = POPULAR_TOKENS[currentChain] || [];
      if (popularTokens.length > 0) {
        const tokensWithBalance = await tokenService.getMultipleTokenBalances(
          popularTokens,
          address
        );
        
        // Fetch token prices
        const tokensWithPrices = await Promise.all(
          tokensWithBalance.map(async (token) => {
            const price = await priceService.getPrice(token.symbol);
            const balanceUSD = parseFloat(token.balance || '0') * price;
            return {
              ...token,
              priceUSD: price,
              balanceUSD: balanceUSD.toFixed(2),
              change24h: await priceService.get24hChange(token.symbol),
            };
          })
        );

        // Only show tokens with balance > 0
        const tokensWithValue = tokensWithPrices.filter(
          t => parseFloat(t.balance || '0') > 0
        );
        updateTokens(tokensWithValue);

        // Calculate total portfolio value
        const tokensTotalUSD = tokensWithValue.reduce(
          (sum, token) => sum + parseFloat(token.balanceUSD || '0'),
          0
        );
        const totalValue = nativeValueUSD + tokensTotalUSD;
        setTotalValueUSD(totalValue);
        
        // Save to portfolio history
        portfolioHistory.addSnapshot(totalValue, address, currentChain);
      } else {
        setTotalValueUSD(nativeValueUSD);
        
        // Save to portfolio history
        portfolioHistory.addSnapshot(nativeValueUSD, address, currentChain);
      }

      // Get 24h change
      const nativeChange = await priceService.get24hChange(chain.nativeCurrency.symbol);
      setChange24h(nativeChange);
      
      // Update chart data from history based on selected time range
      updateChartData();
    
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      // ALWAYS stop refresh spinner, even if there's an error
      setIsRefreshing(false);
    }
  };

  // Update chart data when time range changes
  const updateChartData = () => {
    const recentSnapshots = portfolioHistory.getRecentSnapshots(20, selectedTimeRange);
    if (recentSnapshots.length > 0) {
      setChartData(recentSnapshots.map(s => s.balance));
      
      // Update change percentage for selected range
      const rangeChange = portfolioHistory.getChangePercentage(selectedTimeRange);
      if (rangeChange !== 0) {
        setChange24h(rangeChange);
      }
    }
  };

  useEffect(() => {
    fetchData(true); // Force refresh on mount
    const interval = setInterval(() => fetchData(true), 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [address, currentChain]);

  // Track user activity
  useEffect(() => {
    const handleUserActivity = () => {
      updateActivity();
    };

    // Track various user interactions
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [updateActivity]);

  // Update chart when time range changes
  useEffect(() => {
    updateChartData();
  }, [selectedTimeRange]);

  const formattedAddress = address ? BlockchainService.formatAddress(address) : '';
  const isPositiveChange = change24h >= 0;

  return (
    <>
      <div className="min-h-screen pb-24">
        {/* Header with Network Selector */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChainSelector(true)}
                  className="flex items-center gap-2 glass-card px-3 sm:px-4 py-2 rounded-xl hover:bg-gray-50 min-w-0"
                >
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0"
                    style={{ background: chain.color }}
                  >
                    {chain.icon}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">{chain.shortName}</div>
                    <div className="text-xs text-gray-500 font-mono truncate">{formattedAddress}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                </motion.button>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Presale button - Hidden on mobile, shown as card below */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPresale(true)}
                  className="hidden md:flex px-3 py-2 rounded-xl items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 shadow-soft"
                  title="Join Presale"
                >
                  <Rocket className="w-5 h-5" />
                  <span className="text-sm font-semibold">Presale</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="glass-card p-2.5 sm:p-3 rounded-xl hover:bg-gray-50"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(true)}
                  className="glass-card p-2.5 sm:p-3 rounded-xl hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    lockWallet();
                    // Reload page to show unlock screen
                    window.location.reload();
                  }}
                  className="glass-card p-2.5 sm:p-3 rounded-xl hover:bg-red-50 text-red-600"
                  title="Wallet vergrendelen"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Portfolio Value Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card relative overflow-hidden card-3d subtle-shimmer"
          >
            <div className="absolute inset-0 bg-gradient-primary opacity-5 animate-gradient" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-2">Portfolio value</div>
                  <div className="flex items-center gap-3 mb-2">
                    {showBalance ? (
                      <>
                        <h2 className="text-4xl md:text-5xl font-bold">
                          <AnimatedNumber 
                            value={totalValueUSD} 
                            decimals={2} 
                            prefix="$"
                          />
                        </h2>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{balance} {chain.nativeCurrency.symbol}</div>
                          <div className="text-xs text-gray-400">Native balance</div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowBalance(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <h2 className="text-4xl md:text-5xl font-bold">••••••</h2>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowBalance(true)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <EyeOff className="w-5 h-5" />
                        </motion.button>
                      </>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-2 text-sm ${isPositiveChange ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositiveChange ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {isPositiveChange ? '+' : ''}{change24h.toFixed(2)}% 
                      {selectedTimeRange === 1 ? t("dashboard.lastHour") : 
                       selectedTimeRange === 24 ? ' vandaag' : 
                       selectedTimeRange === 72 ? t("dashboard.last3Days") :
                       selectedTimeRange === 168 ? ' deze week' :
                       selectedTimeRange === 720 ? ' deze maand' :
                       t("dashboard.total")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Chart - Real Data */}
              <div className="h-20 flex items-end gap-1 mb-4">
                {chartData.length > 0 ? (
                  // Show real portfolio history
                  (() => {
                    const minValue = Math.min(...chartData);
                    const maxValue = Math.max(...chartData);
                    const range = maxValue - minValue || 1; // Avoid division by zero
                    
                    return chartData.map((value, i) => {
                      const heightPercent = ((value - minValue) / range) * 80 + 20;
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ delay: i * 0.03, duration: 0.5 }}
                          className={`flex-1 rounded-t ${isPositiveChange ? 'bg-emerald-400/40' : 'bg-rose-400/40'}`}
                        />
                      );
                    });
                  })()
                ) : (
                  // Placeholder while loading data
                  Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: '50%' }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="flex-1 rounded-t bg-gray-300/40"
                    />
                  ))
                )}
              </div>

              {/* Time Range Selector */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: '1u', hours: 1 },
                  { label: '1d', hours: 24 },
                  { label: '3d', hours: 72 },
                  { label: '1w', hours: 168 },
                  { label: '1m', hours: 720 },
                  { label: 'Alles', hours: null },
                ].map((range) => (
                  <motion.button
                    key={range.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTimeRange(range.hours)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTimeRange === range.hours
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Presale Card - Mobile Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-card card-hover relative overflow-hidden"
            onClick={() => setShowPresale(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10" />
            <div className="relative z-10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">BLAZE Presale</div>
                    <div className="text-sm text-gray-600">Vroege toegang tot tokens</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBuyModal(true)}
              className="glass-card card-hover p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-900">Buy</div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSendModal(true)}
              className="glass-card card-hover p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center mb-2">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-900">Send</div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReceiveModal(true)}
              className="glass-card card-hover p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-2">
                <ArrowDownLeft className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-900">Receive</div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSwapModal(true)}
              className="glass-card card-hover p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2">
                <Repeat className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-900">Swap</div>
            </motion.button>
          </div>

          {/* Add Tokens Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTokenSelector(true)}
            className="w-full glass-card card-hover p-3 flex items-center justify-center gap-2 mt-3"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Add tokens</span>
          </motion.button>

          {/* BLAZE Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                🔥 BLAZE Features
              </h3>
              <PremiumBadge isPremium={false} tokenBalance={0} threshold={10000} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Staking */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStaking(true)}
                className="glass p-4 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold mb-1">Staking</div>
                <div className="text-xs text-slate-400">Earn up to 25% APY</div>
              </motion.button>

              {/* Cashback */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCashback(true)}
                className="glass p-4 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-3">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold mb-1">Cashback</div>
                <div className="text-xs text-slate-400">2% on all transactions</div>
              </motion.button>

              {/* Governance */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGovernance(true)}
                className="glass p-4 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold mb-1">Governance</div>
                <div className="text-xs text-slate-400">Vote on proposals</div>
              </motion.button>

              {/* Launchpad */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLaunchpad(true)}
                className="glass p-4 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold mb-1">Launchpad</div>
                <div className="text-xs text-slate-400">Early access to IDOs</div>
              </motion.button>

              {/* Referrals */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReferrals(true)}
                className="glass p-4 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold mb-1">Referrals</div>
                <div className="text-xs text-slate-400">Earn 50 BLAZE/referral</div>
              </motion.button>

              {/* NFT Collection */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNFTMint(true)}
                className="glass p-4 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold mb-1">NFT Skins</div>
                <div className="text-xs text-slate-400">Exclusive wallet themes</div>
              </motion.button>

              {/* Vesting (Founder Only) */}
              {isFounder && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVesting(true)}
                  className="glass p-4 rounded-xl hover:bg-white/10 transition-colors text-left border-2 border-purple-500/30"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-semibold mb-1">Vesting</div>
                  <div className="text-xs text-slate-400">120M tokens locked</div>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Native Currency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Assets</h3>
            </div>
            
            <div className="space-y-3">
              {/* Native Token */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: chain.color }}
                  >
                    {chain.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{chain.nativeCurrency.name}</div>
                    <div className="text-sm text-slate-400">
                      {parseFloat(balance).toFixed(4)} {chain.nativeCurrency.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ${(parseFloat(balance) * (totalValueUSD > 0 ? totalValueUSD / (parseFloat(balance) + tokens.reduce((sum, t) => sum + parseFloat(t.balance || '0'), 0)) : 0)).toFixed(2)}
                  </div>
                  <div className={`text-sm ${isPositiveChange ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositiveChange ? '+' : ''}{change24h.toFixed(2)}%
                  </div>
                </div>
              </motion.div>

              {/* ERC-20 Tokens */}
              <AnimatePresence>
                {tokens.map((token, index) => (
                  <motion.div
                    key={token.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-xl">
                        {token.logo || token.symbol[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{token.name}</div>
                        <div className="text-sm text-slate-400">
                          {parseFloat(token.balance || '0').toFixed(4)} {token.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${token.balanceUSD}</div>
                      <div className={`text-sm ${(token.change24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {(token.change24h || 0) >= 0 ? '+' : ''}{(token.change24h || 0).toFixed(2)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tokens.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-3xl mb-2">🪙</div>
                  <p className="text-sm">No tokens yet</p>
                  <button
                    onClick={() => setShowTokenSelector(true)}
                    className="text-primary-400 text-sm mt-2 hover:text-primary-300"
                  >
                    Add token
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Transaction History */}
          <TransactionHistory />
        </div>
      </div>

      {/* Modals */}
      <BuyModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
      <SwapModal isOpen={showSwapModal} onClose={() => setShowSwapModal(false)} />
      <ChainSelector isOpen={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <TokenSelector isOpen={showTokenSelector} onClose={() => setShowTokenSelector(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <QuickPayModal isOpen={showQuickPay} onClose={() => setShowQuickPay(false)} />
      
      {/* BLAZE Feature Pages */}
      <AnimatePresence>
        {showStaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowStaking(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Terug naar Dashboard
              </button>
              <StakingDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGovernance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowGovernance(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Terug naar Dashboard
              </button>
              <GovernanceDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLaunchpad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowLaunchpad(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Terug naar Dashboard
              </button>
              <LaunchpadDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNFTMint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowNFTMint(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Terug naar Dashboard
              </button>
              <NFTMintDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPresale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowPresale(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Terug naar Dashboard
              </button>
              <PresaleDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Full Screen Modals for Dashboards */}
      <AnimatePresence>
        {showReferrals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowReferrals(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                ← Terug naar Dashboard
              </button>
              <ReferralDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showCashback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowCashback(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                ← Terug naar Dashboard
              </button>
              <CashbackTracker />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVesting && isFounder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowVesting(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Terug naar Dashboard
              </button>
              <VestingDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Founder Deploy Modal */}
      <AnimatePresence>
        {showFounderDeploy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowFounderDeploy(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl pointer-events-auto border border-gray-200 shadow-soft-xl"
            >
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">🔥 Deploy Blaze Token</h2>
                <button
                  onClick={() => setShowFounderDeploy(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ✕
                </button>
              </div>
              <FounderDeploy />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <DebugPanel />
      
      {/* Floating Quick Pay Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowQuickPay(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-2xl flex items-center justify-center subtle-glow hover:scale-110 transition-transform duration-300"
        title="Quick Pay"
      >
        <Zap className="w-8 h-8 text-white" />
      </motion.button>
    </>
  );
}




