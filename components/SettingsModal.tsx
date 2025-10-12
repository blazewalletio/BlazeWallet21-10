'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Key, Trash2, Download, 
  Eye, EyeOff, Copy, Check, Bell, Moon, Sun 
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { mnemonic, resetWallet, address } = useWalletStore();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const copyMnemonic = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    resetWallet();
    onClose();
    window.location.reload();
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] z-50 overflow-hidden"
          >
            <div className="glass-card h-full overflow-y-auto">
              <div className="sticky top-0 glass backdrop-blur-xl pb-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Instellingen</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="glass p-2 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Account Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Account
                  </h3>
                  <div className="glass-card">
                    <div className="text-sm text-gray-600 mb-1">Wallet address</div>
                    <div className="font-mono text-sm break-all">{address}</div>
                  </div>
                </div>

                {/* Recovery Phrase */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Security
                  </h3>
                  
                  <div className="glass-card">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-semibold">Recovery phrase</div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMnemonic(!showMnemonic)}
                        className="text-primary-600 text-sm flex items-center gap-1"
                      >
                        {showMnemonic ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Verberg
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Toon
                          </>
                        )}
                      </motion.button>
                    </div>

                    {showMnemonic && mnemonic && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="glass p-4 rounded-lg mb-3">
                          <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                            {mnemonic.split(' ').map((word, index) => (
                              <div key={index} className="glass p-2 rounded text-center">
                                <span className="text-slate-500 text-xs">{index + 1}.</span>
                                {' '}{word}
                              </div>
                            ))}
                          </div>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={copyMnemonic}
                          className="w-full btn-secondary py-2 flex items-center justify-center gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Kopieer phrase
                            </>
                          )}
                        </motion.button>

                        <div className="mt-3 glass-card bg-amber-500/10 border-amber-500/20">
                          <p className="text-amber-200 text-xs">
                            ⚠️ Deel deze woorden nooit met anderen. Ze geven volledige toegang tot je wallet.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    Voorkeuren
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="glass-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-semibold text-sm">Notificaties</div>
                          <div className="text-xs text-gray-600">Transactie updates</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>

                    <div className="glass-card flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-semibold text-sm">Dark mode</div>
                          <div className="text-xs text-gray-600">Standaard aan</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Danger zone
                  </h3>
                  
                  {!showResetConfirm ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full glass-card bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Reset wallet
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card bg-rose-500/10 border-rose-500/20"
                    >
                      <p className="text-rose-700 text-sm mb-3">
                        Weet je het zeker? Deze actie kan niet ongedaan worden gemaakt.
                        Zorg dat je je recovery phrase hebt!
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 btn-secondary py-2 text-sm"
                        >
                          Annuleer
                        </button>
                        <button
                          onClick={handleReset}
                          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl font-semibold text-sm"
                        >
                          Ja, reset
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* App Info */}
                <div className="text-center text-sm text-gray-600 pb-8">
                  <div className="mb-2 font-semibold text-lg bg-gradient-primary bg-clip-text text-transparent">Blaze v2.0</div>
                  <div className="text-xs">Lightning fast crypto</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}




