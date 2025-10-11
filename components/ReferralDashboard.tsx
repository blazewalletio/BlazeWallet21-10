'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Copy, Check, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { ReferralService, ReferralData, ReferralStats, ReferralTransaction } from '@/lib/referral-service';

export default function ReferralDashboard() {
  const { connectedWallet } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<ReferralTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const referralService = new ReferralService();

  // Load data when wallet connects
  useEffect(() => {
    const loadData = async () => {
      if (!connectedWallet) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const userAddress = await connectedWallet.getAddress();
        
        const [data, statsData, transactionsData] = await Promise.all([
          referralService.getReferralData(userAddress),
          referralService.getReferralStats(userAddress),
          referralService.getReferralTransactions(userAddress, 5),
        ]);
        
        setReferralData(data);
        setStats(statsData);
        setRecentTransactions(transactionsData);
      } catch (err: any) {
        console.error('Error loading referral data:', err);
        setError(err.message || 'Failed to load referral data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [connectedWallet]);

  const copyReferralLink = () => {
    if (!referralData) return;
    navigator.clipboard.writeText(referralData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    if (!connectedWallet || !stats || stats.pendingRewardsFormatted === 0) return;

    try {
      setIsClaiming(true);
      setError(null);
      setSuccess(null);
      
      const userAddress = await connectedWallet.getAddress();
      const txHash = await referralService.claimReferralRewards(userAddress, connectedWallet);
      
      setSuccess(`Successfully claimed ${stats.pendingRewardsFormatted.toFixed(4)} BLAZE! Transaction: ${txHash.slice(0, 10)}...`);
      
      // Reload data
      const [data, statsData, transactionsData] = await Promise.all([
        referralService.getReferralData(userAddress),
        referralService.getReferralStats(userAddress),
        referralService.getReferralTransactions(userAddress, 5),
      ]);
      
      setReferralData(data);
      setStats(statsData);
      setRecentTransactions(transactionsData);
      
    } catch (err: any) {
      console.error('Error claiming referral rewards:', err);
      setError(err.message || 'Failed to claim referral rewards');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
        <p className="text-gray-600">
          Earn 50 BLAZE per referral + 10% of their transaction fees forever!
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <span className="ml-3 text-gray-600">Loading referral data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-400 mb-1">Error</h3>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-400 mb-1">Success</h3>
            <p className="text-sm text-green-300">{success}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50/50 border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-600">Total Referrals</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalReferrals}</div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.activeReferrals} active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50/50 border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-600">Total Earned</span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {stats.totalEarnedFormatted.toFixed(2)} BLAZE
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Lifetime rewards
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50/50 border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">
              {stats.pendingRewardsFormatted.toFixed(2)} BLAZE
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Claimable now
            </div>
          </motion.div>
        </div>
      )}

      {/* Referral Link */}
      {referralData && (
        <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Your Referral Link</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralData.referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-mono"
            />
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span>Earn 50 BLAZE instantly per sign-up</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span>Get 10% of their transaction fees</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span>Lifetime passive income</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span>Unlimited referrals</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Referrals */}
      {recentTransactions.length > 0 && (
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Referral Activity</h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.transactionType === 'signup' ? 'bg-gradient-to-br from-orange-500 to-pink-500' :
                    transaction.transactionType === 'transaction_fee' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                    'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-mono text-sm">
                      {transaction.referredAddress.slice(0, 6)}...{transaction.referredAddress.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {transaction.transactionType === 'signup' ? 'Signup bonus' : 'Fee share'} • {formatTimeAgo(transaction.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.status === 'confirmed' ? 'text-green-400' :
                    transaction.status === 'pending' ? 'text-orange-400' :
                    'text-gray-400'
                  }`}>
                    +{transaction.amountFormatted.toFixed(2)} BLAZE
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Referrals */}
      {!isLoading && recentTransactions.length === 0 && (
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Referrals Yet</h3>
          <p className="text-gray-500">Share your referral link to start earning rewards!</p>
        </div>
      )}

      {/* Claim Button */}
      {stats && stats.pendingRewardsFormatted > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClaim}
          disabled={isClaiming}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isClaiming ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5" />
              Claim {stats.pendingRewardsFormatted.toFixed(2)} BLAZE
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
