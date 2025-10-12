'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, QrCode, CreditCard, Scan, Check } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import QRCode from 'qrcode';
import ParticleEffect from './ParticleEffect';

interface QuickPayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS_EUR = [5, 10, 20, 50, 100];

export default function QuickPayModal({ isOpen, onClose }: QuickPayModalProps) {
  const [mode, setMode] = useState<'select' | 'lightning' | 'card' | 'scan' | 'processing' | 'success'>('select');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [lightningQR, setLightningQR] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { address } = useWalletStore();

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const generateLightningQR = async () => {
    if (!selectedAmount && !customAmount) return;
    
    const amount = selectedAmount || parseFloat(customAmount);
    // Lightning Network invoice format (simplified for demo)
    const lightningInvoice = `lightning:lnbc${amount * 10000}u1...`;
    
    try {
      const qr = await QRCode.toDataURL(lightningInvoice, {
        width: 400,
        margin: 2,
        color: {
          dark: '#8b5cf6',
          light: '#FFFFFF',
        },
      });
      setLightningQR(qr);
      setMode('lightning');
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const handleQuickPay = (method: 'lightning' | 'card' | 'scan') => {
    if (method === 'lightning') {
      generateLightningQR();
    } else if (method === 'card') {
      setMode('card');
    } else {
      setMode('scan');
    }
  };

  const simulatePayment = () => {
    setMode('processing');
    setTimeout(() => {
      setMode('success');
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        setMode('select');
        setSelectedAmount(null);
        setCustomAmount('');
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  const amount = selectedAmount || parseFloat(customAmount) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg"
            >
              <div className="glass-card max-h-[90vh] overflow-y-auto relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Quick Pay</h2>
                </div>
                <button
                  onClick={onClose}
                  className="glass p-2 rounded-lg hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Selection */}
              {mode === 'select' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select amount</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_AMOUNTS_EUR.map((amt) => (
                        <motion.button
                          key={amt}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAmountSelect(amt)}
                          className={`glass-card p-6 text-center rounded-2xl transition-all ${
                            selectedAmount === amt
                              ? 'ring-2 ring-primary-500 bg-primary-500/20'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-3xl font-bold">€{amt}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-600 mb-2">Or custom amount</h3>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">
                        €
                      </span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        placeholder="0.00"
                        className="input-field pl-12 text-2xl font-bold"
                      />
                    </div>
                  </div>

                  {amount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-semibold">Betaalmethode</h3>
                      
                      {/* Lightning Network */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickPay('lightning')}
                        className="w-full glass-card p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Lightning Network</div>
                            <div className="text-sm text-gray-600">Instant Bitcoin betaling</div>
                          </div>
                        </div>
                        <div className="text-emerald-400 text-sm font-semibold">
                          Gratis
                        </div>
                      </motion.button>

                      {/* Virtual Card */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickPay('card')}
                        className="w-full glass-card p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Virtual Card</div>
                            <div className="text-sm text-gray-600">Crypto → Fiat auto-convert</div>
                          </div>
                        </div>
                      </motion.button>

                      {/* Scan QR */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickPay('scan')}
                        className="w-full glass-card p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                            <Scan className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Scan Merchant QR</div>
                            <div className="text-sm text-gray-600">Betaal bij winkel</div>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Lightning Network Payment */}
              {mode === 'lightning' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">€{amount}</div>
                    <div className="text-gray-600">Lightning Network Payment</div>
                  </div>

                  {lightningQR && (
                    <div className="glass-card p-6 text-center">
                      <div className="mb-4 text-sm text-gray-600">
                        Scan met Lightning wallet
                      </div>
                      <img 
                        src={lightningQR} 
                        alt="Lightning QR" 
                        className="mx-auto rounded-xl"
                      />
                      <div className="mt-4 p-3 glass rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Invoice</div>
                        <div className="text-xs font-mono break-all">
                          lnbc{amount * 10000}u1...
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode('select')}
                      className="flex-1 btn-secondary py-3"
                    >
                      Terug
                    </button>
                    <button
                      onClick={simulatePayment}
                      className="flex-1 btn-primary py-3"
                    >
                      Betaling ontvangen
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Virtual Card Integration */}
              {mode === 'card' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="glass-card bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl">
                    <div className="text-white/60 text-sm mb-8">Virtual Debit Card</div>
                    <div className="text-white font-mono text-lg mb-4 tracking-wider">
                      **** **** **** 4242
                    </div>
                    <div className="flex justify-between text-white/80 text-sm">
                      <div>
                        <div className="text-white/60 text-xs">Naam</div>
                        <div>CRYPTOVAULT USER</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-xs">Geldig tot</div>
                        <div>12/28</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Te betalen</span>
                      <span className="text-2xl font-bold">€{amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Auto-convert</span>
                      <span className="text-sm">~{(amount / 1700).toFixed(6)} ETH</span>
                    </div>
                  </div>

                  <div className="glass-card bg-blue-500/10 border-blue-500/20 p-4">
                    <div className="text-blue-700 text-sm">
                      💳 Voeg toe aan Apple Wallet voor instant payments bij elke pin automaat!
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode('select')}
                      className="flex-1 btn-secondary py-3"
                    >
                      Terug
                    </button>
                    <button
                      onClick={simulatePayment}
                      className="flex-1 btn-primary py-3"
                    >
                      Activeer Card
                    </button>
                  </div>
                </motion.div>
              )}

              {/* QR Scanner */}
              {mode === 'scan' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="glass-card aspect-square rounded-2xl flex items-center justify-center bg-white/50">
                    <div className="text-center">
                      <Scan className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
                      <div className="text-lg font-semibold mb-2">Scan Merchant QR</div>
                      <div className="text-sm text-gray-600">
                        Richt camera op betaal-QR code
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMode('select')}
                    className="w-full btn-secondary py-3"
                  >
                    Annuleren
                  </button>
                </motion.div>
              )}

              {/* Processing */}
              {mode === 'processing' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <div className="text-lg font-semibold">Verwerken...</div>
                </div>
              )}

              {/* Success */}
              {mode === 'success' && (
                <div className="text-center py-12">
                  <ParticleEffect trigger={showSuccess} type="celebration" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                  <div className="text-2xl font-bold mb-2">Betaling geslaagd!</div>
                  <div className="text-4xl font-bold text-primary-600">€{amount}</div>
                </div>
              )}
              </div>
            </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}




