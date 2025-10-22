'use client';

import { motion } from 'framer-motion';
import { TabType } from './BottomNavigation';
import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, Eye, EyeOff, Plus, Zap, ChevronRight,
  Repeat, Wallet as WalletIcon, TrendingDown, PieChart, Rocket, CreditCard,
  Lock, Gift, Vote, Users, Palette, Settings as SettingsIcon, History, Bot, Flame
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { BlockchainService } from '@/lib/blockchain';
import { CHAINS } from '@/lib/chains';
import AnimatedNumber from './AnimatedNumber';
import PortfolioChart from './PortfolioChart';
import TransactionHistory from './TransactionHistory';
import SettingsModal from './SettingsModal';
import StakingDashboard from './StakingDashboard';
import GovernanceDashboard from './GovernanceDashboard';
import LaunchpadDashboard from './LaunchpadDashboard';
import ReferralDashboard from './ReferralDashboard';
import NFTMintDashboard from './NFTMintDashboard';
import CashbackTracker from './CashbackTracker';
import PresaleDashboard from './PresaleDashboard';

interface TabContentProps {
  activeTab: TabType;
  tokens: any[];
  totalValueUSD: number;
  change24h: number;
  chartData: number[];
  selectedTimeRange: number | null;
  setSelectedTimeRange: (range: number | null) => void;
  setShowSendModal: (show: boolean) => void;
  setShowReceiveModal: (show: boolean) => void;
  setShowSwapModal: (show: boolean) => void;
  setShowBuyModal: (show: boolean) => void;
  setShowTokenSelector: (show: boolean) => void;
  setShowQuickPay: (show: boolean) => void;
  fetchData: () => void;
  isRefreshing: boolean;
}

export default function TabContent({
  activeTab,
  tokens,
  totalValueUSD,
  change24h,
  chartData,
  selectedTimeRange,
  setSelectedTimeRange,
  setShowSendModal,
  setShowReceiveModal,
  setShowSwapModal,
  setShowBuyModal,
  setShowTokenSelector,
  setShowQuickPay,
  fetchData,
  isRefreshing
}: TabContentProps) {
  const { address, balance, currentChain } = useWalletStore();
  const chain = CHAINS[currentChain];
  const formattedAddress = address ? BlockchainService.formatAddress(address) : '';
  const isPositiveChange = change24h >= 0;

  // Modal states for each tab
  const [showSettings, setShowSettings] = useState(false);
  const [showStaking, setShowStaking] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showNFTMint, setShowNFTMint] = useState(false);
  const [showCashback, setShowCashback] = useState(false);
  const [showPresale, setShowPresale] = useState(false);

  const [showBalance, setShowBalance] = useState(true);

  // Wallet Tab Content
  const WalletTab = () => (
    <div className="space-y-4">
      {/* Portfolio Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Portfolio value</h2>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showBalance ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
        
        <div className="mb-4">
          {showBalance ? (
            <div className="text-3xl font-bold text-gray-900 mb-2">
              <AnimatedNumber value={totalValueUSD} prefix="$" decimals={2} />
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-900 mb-2">••••••</div>
          )}
          
          <div className="flex items-center gap-3 mb-3">
            <div className="text-gray-600">
              {showBalance ? `${parseFloat(balance).toFixed(4)} ${chain.nativeCurrency.symbol}` : '••••••'}
            </div>
            <div className="text-sm text-gray-500">Native balance</div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded hover:bg-gray-100"
            >
              {showBalance ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {isPositiveChange ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveChange ? '+' : ''}{change24h.toFixed(2)}% today
            </span>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-20 mb-4">
          <PortfolioChart data={chartData} />
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 24, 72, 168, 720, null].map((hours, index) => {
            const labels = ['1u', '1d', '3d', '1w', '1m', 'Alles'];
            const isSelected = selectedTimeRange === hours;
            
            return (
              <button
                key={index}
                onClick={() => setSelectedTimeRange(hours)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {labels[index]}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBuyModal(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Buy</div>
          <div className="text-sm text-gray-600">Crypto kopen met fiat</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSendModal(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-6 h-6 text-red-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Send</div>
          <div className="text-sm text-gray-600">Crypto verzenden</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReceiveModal(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-6 h-6 text-green-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Receive</div>
          <div className="text-sm text-gray-600">Crypto ontvangen</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSwapModal(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Repeat className="w-6 h-6 text-purple-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Swap</div>
          <div className="text-sm text-gray-600">Tokens wisselen</div>
        </motion.button>
      </div>

      {/* Add Tokens Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTokenSelector(true)}
        className="w-full glass-card p-4 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Plus className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900">Add tokens</div>
          <div className="text-sm text-gray-600">Custom tokens toevoegen</div>
        </div>
      </motion.button>
    </div>
  );

  // AI Tools Tab Content
  const AIToolsTab = () => (
    <div className="space-y-4">
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Tools</h2>
            <p className="text-sm text-gray-600">Smart crypto assistance</p>
          </div>
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">AI Assistent</div>
          <div className="text-sm text-gray-600">Natuurlijke taal transacties</div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Scam Detector</div>
          <div className="text-sm text-gray-600">Real-time risico scanning</div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Portfolio Advisor</div>
          <div className="text-sm text-gray-600">Gepersonaliseerde tips</div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Gas Optimizer</div>
          <div className="text-sm text-gray-600">Bespaar op gas fees</div>
        </motion.div>
      </div>
    </div>
  );

  // Blaze Tab Content
  const BlazeTab = () => (
    <div className="space-y-4">
      {/* BLAZE Presale Card */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPresale(true)}
        className="w-full glass-card p-6 rounded-2xl text-left hover:bg-orange-50 transition-colors group border-2 border-orange-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 mb-1">BLAZE Presale</div>
            <div className="text-sm text-gray-600">Vroege toegang tot tokens</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </motion.button>

      {/* Blaze Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowStaking(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Staking</div>
          <div className="text-sm text-gray-600">Earn 8-20% APY</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGovernance(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Vote className="w-6 h-6 text-blue-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Governance</div>
          <div className="text-sm text-gray-600">Vote on proposals</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLaunchpad(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Rocket className="w-6 h-6 text-green-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Launchpad</div>
          <div className="text-sm text-gray-600">Early token access</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReferrals(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Referrals</div>
          <div className="text-sm text-gray-600">Earn rewards</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNFTMint(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Palette className="w-6 h-6 text-pink-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">NFT Skins</div>
          <div className="text-sm text-gray-600">Customize wallet</div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCashback(true)}
          className="glass-card p-6 rounded-2xl text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Gift className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="font-semibold text-gray-900 mb-1">Cashback</div>
          <div className="text-sm text-gray-600">Earn on transactions</div>
        </motion.button>
      </div>
    </div>
  );

  // History Tab Content
  const HistoryTab = () => (
    <div className="space-y-4">
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <History className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-600">Alle wallet activiteit</p>
          </div>
        </div>
      </div>
      
      <TransactionHistory />
    </div>
  );

  // Settings Tab Content
  const SettingsTab = () => (
    <div className="space-y-4">
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600">Wallet & app configuratie</p>
          </div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(true)}
          className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="font-medium text-gray-900">Open Settings</div>
          <div className="text-sm text-gray-600">Beveiliging, netwerk en meer</div>
        </motion.button>
      </div>
    </div>
  );

  // Render appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletTab />;
      case 'ai':
        return <AIToolsTab />;
      case 'blaze':
        return <BlazeTab />;
      case 'history':
        return <HistoryTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <WalletTab />;
    }
  };

  return (
    <>
      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="px-4 pb-24"
      >
        {renderTabContent()}
      </motion.div>

      {/* Modals */}
      {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
      
      {/* Full Screen Modals */}
      {showStaking && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={() => setShowStaking(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <StakingDashboard />
          </div>
        </div>
      )}
      
      {showGovernance && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={() => setShowGovernance(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <GovernanceDashboard />
          </div>
        </div>
      )}
      
      {showLaunchpad && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={() => setShowLaunchpad(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <LaunchpadDashboard />
          </div>
        </div>
      )}
      
      {showPresale && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={() => setShowPresale(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <PresaleDashboard />
          </div>
        </div>
      )}
      
      {showReferrals && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={() => setShowReferrals(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <ReferralDashboard />
          </div>
        </div>
      )}
      
      {showNFTMint && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={() => setShowNFTMint(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <NFTMintDashboard />
          </div>
        </div>
      )}
      
      {showCashback && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={() => setShowCashback(false)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <CashbackTracker />
          </div>
        </div>
      )}
    </>
  );
}
