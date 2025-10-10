'use client';

import { motion } from 'framer-motion';
import { Gift, TrendingUp, Zap, ExternalLink } from 'lucide-react';

export default function CashbackTracker() {
  // Mock data - replace with real data
  const stats = {
    totalEarned: 125.50,
    thisMonth: 45.20,
    pending: 12.30,
    transactions: 156,
  };

  const recentCashback = [
    { type: 'Swap', amount: 5.20, date: '2 hours ago', tx: '0x1234...5678' },
    { type: 'Send', amount: 0.50, date: '5 hours ago', tx: '0xabcd...efgh' },
    { type: 'Swap', amount: 8.75, date: '1 day ago', tx: '0x9876...4321' },
    { type: 'Swap', amount: 12.30, date: '2 days ago', tx: '0xfedc...ba98' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Gift className="w-6 h-6 text-green-400" />
          Cashback Rewards
        </h2>
        <p className="text-text-tertiary">
          Earn 2% cashback in BLAZE on every transaction
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-semibold">Total Earned</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.totalEarned} BLAZE</div>
          <div className="text-sm text-text-tertiary mt-1">
            ≈ ${(stats.totalEarned * 0.01).toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-100/50 border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">This Month</span>
          </div>
          <div className="text-3xl font-bold">{stats.thisMonth} BLAZE</div>
          <div className="text-sm text-green-400 mt-1">
            +{((stats.thisMonth / stats.totalEarned) * 100).toFixed(0)}% growth
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-100/50 border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-semibold">Pending</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">{stats.pending} BLAZE</div>
          <div className="text-sm text-text-tertiary mt-1">
            Claimable now
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-100/50 border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">Transactions</span>
          </div>
          <div className="text-3xl font-bold">{stats.transactions}</div>
          <div className="text-sm text-text-tertiary mt-1">
            Total rewarded
          </div>
        </motion.div>
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
        <h3 className="font-semibold mb-4">How Cashback Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">💸</span>
            </div>
            <h4 className="font-semibold mb-1">Make a Transaction</h4>
            <p className="text-text-tertiary">
              Swap, send, or buy crypto in Blaze Wallet
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🎁</span>
            </div>
            <h4 className="font-semibold mb-1">Earn 2% Cashback</h4>
            <p className="text-text-tertiary">
              Automatically receive BLAZE tokens back
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">💰</span>
            </div>
            <h4 className="font-semibold mb-1">Claim Rewards</h4>
            <p className="text-text-tertiary">
              Withdraw or stake your earned BLAZE
            </p>
          </div>
        </div>
      </div>

      {/* Recent Cashback */}
      <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Recent Cashback</h3>
        <div className="space-y-3">
          {recentCashback.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="font-semibold">{item.type} Cashback</div>
                  <div className="text-sm text-text-tertiary">{item.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-400">
                  +{item.amount} BLAZE
                </div>
                <a
                  href="#"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 justify-end"
                >
                  {item.tx} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Button */}
      {stats.pending > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-semibold text-lg transition-all"
        >
          Claim {stats.pending} BLAZE
        </motion.button>
      )}
    </div>
  );
}
