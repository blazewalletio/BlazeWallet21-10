'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, TrendingUp, Zap, Crown, Gift, ArrowLeft } from 'lucide-react';

export default function StakingDashboard() {
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'flexible' | 'six-month' | 'one-year'>('flexible');
  const [isStaking, setIsStaking] = useState(false);

  const stakingPlans = [
    {
      id: 'flexible' as const,
      name: 'Flexible',
      apy: 8,
      lockDays: 0,
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      description: 'Unstake anytime',
    },
    {
      id: 'six-month' as const,
      name: '6 Months',
      apy: 15,
      lockDays: 180,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      description: 'Higher rewards',
    },
    {
      id: 'one-year' as const,
      name: '1 Year',
      apy: 25,
      lockDays: 365,
      icon: Crown,
      color: 'from-orange-500 to-red-500',
      description: 'Maximum rewards',
    },
  ];

  const calculateRewards = () => {
    if (!amount || parseFloat(amount) === 0) return 0;
    const plan = stakingPlans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    
    const amountNum = parseFloat(amount);
    return (amountNum * plan.apy) / 100;
  };

  const handleStake = async () => {
    setIsStaking(true);
    // Simulate staking process
    setTimeout(() => {
      setIsStaking(false);
      alert('Staking successful! Your tokens are now earning rewards.');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Lock className="w-6 h-6 text-orange-400" />
          Stake BLAZE
        </h2>
        <p className="text-gray-600">
          Lock your BLAZE tokens and earn up to 25% APY rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-semibold">Total Staked</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">0 BLAZE</div>
          <div className="text-sm text-gray-600 mt-1">
            ≈ $0.00
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">Total Rewards</span>
          </div>
          <div className="text-3xl font-bold text-green-400">0 BLAZE</div>
          <div className="text-sm text-gray-600 mt-1">
            ≈ $0.00
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-semibold">Pending</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">0 BLAZE</div>
          <div className="text-sm text-gray-600 mt-1">
            Claimable now
          </div>
        </motion.div>
      </div>

      {/* Staking Plans */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Choose Your Staking Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stakingPlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <motion.button
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  relative p-6 rounded-xl border-2 text-left transition-all
                  ${isSelected 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="mb-4">
                  <h4 className="text-lg font-bold mb-1">{plan.name}</h4>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">APY</span>
                    <span className="text-2xl font-bold text-orange-400">{plan.apy}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lock Period</span>
                    <span className="text-sm font-semibold">
                      {plan.lockDays === 0 ? 'Flexible' : `${plan.lockDays} days`}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Amount Input */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Stake Amount</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Amount to stake (BLAZE)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none text-xl"
            />
          </div>

          {/* Rewards Preview */}
          {amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-6"
            >
              <h4 className="font-semibold mb-3 text-orange-400">Rewards Preview</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Yearly Rewards</div>
                  <div className="text-2xl font-bold text-orange-400">
                    +{calculateRewards().toFixed(2)} BLAZE
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">USD Value (est.)</div>
                  <div className="text-2xl font-bold text-green-400">
                    ${(calculateRewards() * 0.01).toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="glass-card p-6">
        <h4 className="font-semibold mb-3">Staking Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h5 className="font-semibold mb-1">Passive Income</h5>
              <p className="text-sm text-gray-600">Earn rewards automatically without active trading</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h5 className="font-semibold mb-1">Secure & Safe</h5>
              <p className="text-sm text-gray-600">Your tokens are secured by smart contracts</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h5 className="font-semibold mb-1">Bonus Rewards</h5>
              <p className="text-sm text-gray-600">Get extra BLAZE tokens as staking bonuses</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h5 className="font-semibold mb-1">Flexible Options</h5>
              <p className="text-sm text-gray-600">Choose between flexible and fixed-term staking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          className="flex-1 py-3 bg-gray-50 hover:bg-slate-700 rounded-xl font-semibold transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleStake}
          disabled={!amount || parseFloat(amount) === 0 || isStaking}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isStaking ? 'Staking...' : 'Stake BLAZE'}
        </button>
      </div>
    </div>
  );
}
