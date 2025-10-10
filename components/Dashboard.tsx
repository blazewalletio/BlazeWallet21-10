'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Settings, 
  TrendingUp, Eye, EyeOff, Plus, Zap, ChevronRight,
  Repeat, Wallet as WalletIcon, TrendingDown, PieChart, Rocket, CreditCard,
  Lock, Gift, Vote, Users, Palette
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
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
import StakingModal from './StakingModal';
import GovernanceModal from './GovernanceModal';
import LaunchpadModal from './LaunchpadModal';
import ReferralDashboard from './ReferralDashboard';
import NFTMintModal from './NFTMintModal';
import CashbackTracker from './CashbackTracker';
import PremiumBadge, { PremiumCard } from './PremiumBadge';
import { getPortfolioHistory } from '@/lib/portfolio-history';

export default function Dashboard() {
  const { 
    address, 
    balance, 
    updateBalance, 
    currentChain, 
    tokens,
    updateTokens 
  } = useWalletStore();
  
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
  const [totalValueUSD, setTotalValueUSD] = useState(0);
  const [change24h, setChange24h] = useState(2.5);
  const [chartData, setChartData] = useState<number[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(24); // Default: 24 hours

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
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChainSelector(true)}
                  className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl hover:bg-gray-50"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ background: chain.color }}
                  >
                    {chain.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{chain.shortName}</div>
                    <div className="text-xs text-gray-500 font-mono">{formattedAddress}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFounderDeploy(true)}
                  className="px-3 py-2 rounded-xl flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 shadow-soft"
                  title="Deploy Blaze Token"
                >
                  <Rocket className="w-5 h-5" />
                  <span className="text-sm font-semibold hidden sm:inline">Deploy</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="glass-card p-3 rounded-xl hover:bg-gray-50"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(true)}
                  className="glass-card p-3 rounded-xl hover:bg-gray-50"
                >
                  <Settings className="w-5 h-5 text-gray-700" />
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
                  <div className="text-sm text-gray-600 mb-2">Portfolio waarde</div>
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
                      {selectedTimeRange === 1 ? ' afgelopen uur' : 
                       selectedTimeRange === 24 ? ' vandaag' : 
                       selectedTimeRange === 72 ? ' afgelopen 3 dagen' :
                       selectedTimeRange === 168 ? ' deze week' :
                       selectedTimeRange === 720 ? ' deze maand' :
                       ' totaal'}
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

          {/* Quick Pay Highlight */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQuickPay(true)}
            className="glass-card relative overflow-hidden p-6 rounded-2xl subtle-shimmer cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 animate-gradient" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-lg font-bold mb-1 text-gray-900">Quick Pay</div>
                <div className="text-sm text-gray-600">Lightning fast payments</div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
          </motion.button>

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
              <div className="text-sm font-semibold text-gray-900">Koop</div>
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
              <div className="text-sm font-semibold text-gray-900">Stuur</div>
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
              <div className="text-sm font-semibold text-gray-900">Ontvang</div>
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
            <span className="text-sm font-semibold">Tokens toevoegen</span>
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
                  <p className="text-sm">Nog geen tokens</p>
                  <button
                    onClick={() => setShowTokenSelector(true)}
                    className="text-primary-400 text-sm mt-2 hover:text-primary-300"
                  >
                    Token toevoegen
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
      
      {/* BLAZE Feature Modals */}
      <StakingModal isOpen={showStaking} onClose={() => setShowStaking(false)} />
      <GovernanceModal isOpen={showGovernance} onClose={() => setShowGovernance(false)} />
      <LaunchpadModal isOpen={showLaunchpad} onClose={() => setShowLaunchpad(false)} />
      <NFTMintModal isOpen={showNFTMint} onClose={() => setShowNFTMint(false)} />
      
      {/* Full Screen Modals for Dashboards */}
      <AnimatePresence>
        {showReferrals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowReferrals(false)}
                className="mb-4 text-slate-400 hover:text-white"
              >
                ← Back to Dashboard
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
            className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setShowCashback(false)}
                className="mb-4 text-slate-400 hover:text-white"
              >
                ← Back to Dashboard
              </button>
              <CashbackTracker />
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
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl pointer-events-auto"
            >
              <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700/50 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">🔥 Deploy Blaze Token</h2>
                <button
                  onClick={() => setShowFounderDeploy(false)}
                  className="text-slate-400 hover:text-white transition-colors"
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