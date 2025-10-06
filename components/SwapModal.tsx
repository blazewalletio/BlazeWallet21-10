'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Settings as SettingsIcon, Zap } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { CHAINS } from '@/lib/chains';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
  const { currentChain } = useWalletStore();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);

  const chain = CHAINS[currentChain];

  // Mock exchange rate
  const exchangeRate = 1700; // 1 ETH = 1700 USDC

  const handleFromChange = (value: string) => {
    setFromAmount(value);
    if (value) {
      setToAmount((parseFloat(value) * exchangeRate).toFixed(2));
    } else {
      setToAmount('');
    }
  };

  const handleSwapClick = () => {
    // Swap functionaliteit - in productie zou dit een DEX aggregator aanroepen
    console.log('Swap:', fromAmount, chain.nativeCurrency.symbol, '→', toAmount, 'USDC');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <div className="glass-card max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Swap tokens</h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="glass p-2 rounded-lg hover:bg-white/10"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="glass p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {/* From Token */}
                <div className="glass-card">
                  <div className="text-sm text-slate-400 mb-2">Van</div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => handleFromChange(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-3xl font-bold outline-none"
                    />
                    <button className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                        style={{ background: chain.color }}
                      >
                        {chain.icon}
                      </div>
                      <span className="font-semibold">{chain.nativeCurrency.symbol}</span>
                    </button>
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    ≈ ${fromAmount ? (parseFloat(fromAmount) * exchangeRate).toFixed(2) : '0.00'}
                  </div>
                </div>

                {/* Swap Direction */}
                <div className="flex justify-center -my-2 relative z-10">
                  <motion.button
                    whileTap={{ scale: 0.9, rotate: 180 }}
                    className="glass-card p-3 rounded-xl hover:bg-white/10"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* To Token */}
                <div className="glass-card">
                  <div className="text-sm text-slate-400 mb-2">Naar</div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={toAmount}
                      readOnly
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-3xl font-bold outline-none"
                    />
                    <button className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-sm">
                        💲
                      </div>
                      <span className="font-semibold">USDC</span>
                    </button>
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    ≈ ${toAmount || '0.00'}
                  </div>
                </div>

                {/* Swap Info */}
                {fromAmount && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card space-y-2 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wisselkoers</span>
                      <span>1 {chain.nativeCurrency.symbol} = {exchangeRate} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slippage tolerance</span>
                      <span>{slippage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Netwerk kosten</span>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Zap className="w-3 h-3" />
                        <span>~$2.50</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Swap Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSwapClick}
                  disabled={!fromAmount || parseFloat(fromAmount) <= 0}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Swap
                </motion.button>

                {/* Info Banner */}
                <div className="glass-card bg-purple-500/10 border-purple-500/20">
                  <p className="text-purple-200 text-sm">
                    ⚡ Swap wordt mogelijk gemaakt door DEX aggregators voor de beste prijs
                  </p>
                </div>
              </div>
              </div>
            </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
