'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, ChevronRight, LogOut, ArrowLeft, Zap
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { useTranslation } from '@/lib/useTranslation';
import { BlockchainService } from '@/lib/blockchain';
import { TokenService } from '@/lib/token-service';
import { PriceService } from '@/lib/price-service';
import { CHAINS, POPULAR_TOKENS } from '@/lib/chains';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import BuyModal from './BuyModal';
import ChainSelector from './ChainSelector';
import TokenSelector from './TokenSelector';
import SettingsModal from './SettingsModal';
import QuickPayModal from './QuickPayModal';
import DebugPanel from './DebugPanel';
import FounderDeploy from './FounderDeploy';
import VestingDashboard from './VestingDashboard';
import StakingDashboard from './StakingDashboard';
import GovernanceDashboard from './GovernanceDashboard';
import LaunchpadDashboard from './LaunchpadDashboard';
import { getPortfolioHistory } from '@/lib/portfolio-history';
import BottomNavigation, { TabType } from './BottomNavigation';
import TabContent from './TabContent';
import AITransactionAssistant from './AITransactionAssistant';
import AIRiskScanner from './AIRiskScanner';
import AIPortfolioAdvisor from './AIPortfolioAdvisor';
import AIGasOptimizer from './AIGasOptimizer';
import AIConversationalAssistant from './AIConversationalAssistant';
import AIBrainAssistant from './AIBrainAssistant';
import AISettingsModal from './AISettingsModal';
import { Sparkles, Shield, Brain, MessageSquare } from 'lucide-react';

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
  
  // Bottom Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  
  // Modal States
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
  const [showVesting, setShowVesting] = useState(false);
  const [showStaking, setShowStaking] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  
  // Data States
  const [totalValueUSD, setTotalValueUSD] = useState(0);
  const [change24h, setChange24h] = useState(2.5);
  const [chartData, setChartData] = useState<number[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(24); // Default: 24 hours
  
  // AI Features state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAIRiskScanner, setShowAIRiskScanner] = useState(false);
  const [showAIPortfolioAdvisor, setShowAIPortfolioAdvisor] = useState(false);
  const [showAIGasOptimizer, setShowAIGasOptimizer] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAIBrain, setShowAIBrain] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

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

        {/* Tab Content */}
        <TabContent
          activeTab={activeTab}
          tokens={tokens}
          totalValueUSD={totalValueUSD}
          change24h={change24h}
          chartData={chartData}
          selectedTimeRange={selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
          setShowSendModal={setShowSendModal}
          setShowReceiveModal={setShowReceiveModal}
          setShowSwapModal={setShowSwapModal}
          setShowBuyModal={setShowBuyModal}
          setShowTokenSelector={setShowTokenSelector}
          setShowQuickPay={setShowQuickPay}
          fetchData={() => fetchData(true)}
          isRefreshing={isRefreshing}
        />

        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
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
      
      {/* AI Feature Modals */}
      <AnimatePresence>
        {showAIAssistant && (
          <AITransactionAssistant
            onClose={() => setShowAIAssistant(false)}
            context={{
              balance: balance || '0',
              tokens: tokens,
              address: address || '',
              chain: currentChain,
            }}
            onExecuteAction={(action) => {
              // Handle action execution
              if (action.type === 'send') {
                setShowSendModal(true);
              } else if (action.type === 'swap') {
                setShowSwapModal(true);
              }
            }}
          />
        )}

        {showAIRiskScanner && (
          <AIRiskScanner onClose={() => setShowAIRiskScanner(false)} />
        )}

        {showAIPortfolioAdvisor && (
          <AIPortfolioAdvisor
            onClose={() => setShowAIPortfolioAdvisor(false)}
            tokens={tokens}
            totalValue={totalValueUSD}
          />
        )}

        {showAIGasOptimizer && (
          <AIGasOptimizer
            onClose={() => setShowAIGasOptimizer(false)}
            currentGasPrice={30} // TODO: Get real gas price from chain
          />
        )}

        {showAIChat && (
          <AIConversationalAssistant
            onClose={() => setShowAIChat(false)}
            context={{
              balance: balance || '0',
              tokens: tokens,
              address: address || '',
              chain: currentChain,
              totalValue: totalValueUSD,
            }}
          />
        )}

        {showAIBrain && (
          <AIBrainAssistant
            onClose={() => setShowAIBrain(false)}
            onOpenFeature={(feature) => {
              setShowAIBrain(false);
              if (feature === 'assistant') setShowAIAssistant(true);
              else if (feature === 'scanner') setShowAIRiskScanner(true);
              else if (feature === 'advisor') setShowAIPortfolioAdvisor(true);
              else if (feature === 'optimizer') setShowAIGasOptimizer(true);
              else if (feature === 'chat') setShowAIChat(true);
            }}
            context={{
              balance: balance || '0',
              tokens: tokens,
              address: address || '',
              chain: currentChain,
              totalValue: totalValueUSD,
            }}
          />
        )}

        {showAISettings && (
          <AISettingsModal onClose={() => setShowAISettings(false)} />
        )}
      </AnimatePresence>
      
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
