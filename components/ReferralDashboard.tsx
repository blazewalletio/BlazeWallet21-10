'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Copy, Check, ExternalLink } from 'lucide-react';

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  
  // Mock data - replace with real data
  const referralCode = 'BLAZE-ABC123';
  const referralLink = `https://blazewallet.app/ref/${referralCode}`;
  const stats = {
    totalReferrals: 12,
    totalEarned: 650,
    pendingRewards: 150,
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
        <p className="text-text-tertiary">
          Earn 50 BLAZE per referral + 10% of their transaction fees forever!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100/50 border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-text-tertiary">Total Referrals</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalReferrals}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-100/50 border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-sm text-text-tertiary">Total Earned</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {stats.totalEarned} BLAZE
          </div>
          <div className="text-sm text-text-tertiary mt-1">
            ≈ ${(stats.totalEarned * 0.01).toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-100/50 border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-text-tertiary">Pending</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">
            {stats.pendingRewards} BLAZE
          </div>
          <div className="text-sm text-text-tertiary mt-1">
            Claimable now
          </div>
        </motion.div>
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-background-secondary border border-gray-200 rounded-lg text-sm font-mono"
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

      {/* Recent Referrals */}
      <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Recent Referrals</h3>
        <div className="space-y-3">
          {[
            { address: '0x1234...5678', earned: 50, date: '2 hours ago' },
            { address: '0xabcd...efgh', earned: 75, date: '1 day ago' },
            { address: '0x9876...4321', earned: 50, date: '3 days ago' },
          ].map((referral, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-mono text-sm">{referral.address}</div>
                  <div className="text-xs text-text-tertiary">{referral.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-400">
                  +{referral.earned} BLAZE
                </div>
                <a
                  href="#"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Button */}
      {stats.pendingRewards > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl font-semibold text-lg transition-all"
        >
          Claim {stats.pendingRewards} BLAZE
        </motion.button>
      )}
    </div>
  );
}
