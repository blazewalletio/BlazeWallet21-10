'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { CHAINS } from '@/lib/chains';

interface ChainSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChainSelector({ isOpen, onClose }: ChainSelectorProps) {
  const { currentChain, switchChain } = useWalletStore();

  const handleSelectChain = (chainKey: string) => {
    switchChain(chainKey);
    onClose();
  };

  const chains = Object.entries(CHAINS);

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
          
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-hidden"
          >
            <div className="glass-card rounded-t-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Kies netwerk</h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="glass p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[60vh]">
                {chains.map(([key, chain]) => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectChain(key)}
                    className={`w-full glass p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all ${
                      currentChain === key ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                        style={{ background: chain.color }}
                      >
                        {chain.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold flex items-center gap-2">
                          {chain.name}
                          {chain.isTestnet && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                              Testnet
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{chain.nativeCurrency.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {key === 'polygon' && (
                        <div className="flex items-center gap-1 text-xs text-emerald-400">
                          <Zap className="w-3 h-3" />
                          Goedkoop
                        </div>
                      )}
                      {currentChain === key && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 glass-card bg-blue-500/10 border-blue-500/20">
                <p className="text-blue-200 text-sm">
                  💡 Tip: Gebruik Polygon of Base voor goedkope transacties!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
