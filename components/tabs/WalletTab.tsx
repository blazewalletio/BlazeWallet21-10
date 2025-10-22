'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronRight,
  TrendingUp, Eye, EyeOff, Repeat, CreditCard, Plus,
  TrendingDown
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { BlockchainService } from '@/lib/blockchain';
import { TokenService } from '@/lib/token-service';
import { PriceService } from '@/lib/price-service';
import { CHAINS, POPULAR_TOKENS } from '@/lib/chains';
import SendModal from '../SendModal';
import ReceiveModal from '../ReceiveModal';
import SwapModal from '../SwapModal';
import BuyModal from '../BuyModal';
import TokenSelector from '../TokenSelector';
import AnimatedNumber from '../AnimatedNumber';
import { getPortfolioHistory } from '@/lib/portfolio-history';

export default function WalletTab() {
  const { 
    address, 
    balance, 
    updateBalance, 
    currentChain, 
    tokens,
    updateTokens,
    updateActivity,
  } = useWalletStore();

  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [totalValueUSD, setTotalValueUSD] = useState(0);
  const [change24h, setChange24h] = useState(2.5);
  const [chartData, setChartData] = useState<number[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(24);

  const chain = CHAINS[currentChain];
  const blockchain = new BlockchainService(currentChain as any);
  const tokenService = new TokenService(chain.rpcUrl);
  const priceService = new PriceService();
  const portfolioHistory = getPortfolioHistory();

  const fetchData = async (force = false) => {
    if (!address) return;
    
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      const timestamp = Date.now();
      console.log(`[${timestamp}] Fetching balance for ${address} on ${currentChain}`);
      
      const bal = await blockchain.getBalance(address);
      console.log(`[${timestamp}] Balance received: ${bal} ${chain.nativeCurrency.symbol}`);
      updateBalance(bal);

      const nativePrice = await priceService.getPrice(chain.nativeCurrency.symbol);
      const nativeValueUSD = parseFloat(bal) * nativePrice;
      
      console.log(`[${timestamp}] Native balance details:`, {
        balance: bal,
        symbol: chain.nativeCurrency.symbol,
        priceUSD: nativePrice,
        valueUSD: nativeValueUSD
      });

      const popularTokens = POPULAR_TOKENS[currentChain] || [];
      if (popularTokens.length > 0) {
        const tokensWithBalance = await tokenService.getMultipleTokenBalances(
          popularTokens,
          address
        );
        
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

        const tokensWithValue = tokensWithPrices.filter(
          t => parseFloat(t.balance || '0') > 0
        );
        updateTokens(tokensWithValue);

        const tokensTotalUSD = tokensWithValue.reduce(
          (sum, token) => sum + parseFloat(token.balanceUSD || '0'),
          0
        );
        const totalValue = nativeValueUSD + tokensTotalUSD;
        setTotalValueUSD(totalValue);
        
        portfolioHistory.addSnapshot(totalValue, address, currentChain);
      } else {
        setTotalValueUSD(nativeValueUSD);
        portfolioHistory.addSnapshot(nativeValueUSD, address, currentChain);
      }

      const nativeChange = await priceService.get24hChange(chain.nativeCurrency.symbol);
      setChange24h(nativeChange);
      
      updateChartData();
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateChartData = () => {
    const recentSnapshots = portfolioHistory.getRecentSnapshots(20, selectedTimeRange);
    if (recentSnapshots.length > 0) {
      setChartData(recentSnapshots.map(s => s.balance));
      
      const rangeChange = portfolioHistory.getChangePercentage(selectedTimeRange);
      if (rangeChange !== 0) {
        setChange24h(rangeChange);
      }
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [address, currentChain]);

  useEffect(() => {
    updateChartData();
  }, [selectedTimeRange]);

  const formattedAddress = address ? BlockchainService.formatAddress(address) : '';
  const isPositiveChange = change24h >= 0;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <motion.div className="flex items-center gap-2 glass-card px-3 sm:px-4 py-2 rounded-xl min-w-0">
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
              </motion.div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="glass-card p-2.5 sm:p-3 rounded-xl hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                    {selectedTimeRange === 1 ? " last hour" : 
                     selectedTimeRange === 24 ? " today" : 
                     selectedTimeRange === 72 ? " last 3 days" :
                     selectedTimeRange === 168 ? " this week" :
                     selectedTimeRange === 720 ? " this month" :
                     " total"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="h-20 flex items-end gap-1 mb-4">
              {chartData.length > 0 ? (
                (() => {
                  const minValue = Math.min(...chartData);
                  const maxValue = Math.max(...chartData);
                  const range = maxValue - minValue || 1;
                  
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

        {/* Assets */}
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
            {tokens.map((token, index) => (
              <motion.div
                key={token.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
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
      </div>

      {/* Modals */}
      <BuyModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
      <SwapModal isOpen={showSwapModal} onClose={() => setShowSwapModal(false)} />
      <TokenSelector isOpen={showTokenSelector} onClose={() => setShowTokenSelector(false)} />
    </>
  );
}
