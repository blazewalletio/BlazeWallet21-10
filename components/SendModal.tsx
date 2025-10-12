'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { BlockchainService } from '@/lib/blockchain';
import ParticleEffect from './ParticleEffect';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendModal({ isOpen, onClose }: SendModalProps) {
  const { wallet, balance } = useWalletStore();
  const [step, setStep] = useState<'input' | 'confirm' | 'sending' | 'success'>('input');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [gasPrice, setGasPrice] = useState<{ slow: string; standard: string; fast: string } | null>(null);
  const [selectedGas, setSelectedGas] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [showSuccessParticles, setShowSuccessParticles] = useState(false);

  const blockchain = new BlockchainService('ethereum');

  useEffect(() => {
    if (isOpen) {
      fetchGasPrice();
    }
  }, [isOpen]);

  const fetchGasPrice = async () => {
    const prices = await blockchain.getGasPrice();
    setGasPrice(prices);
  };

  const handleMaxAmount = () => {
    // Reserve some for gas
    const max = Math.max(0, parseFloat(balance) - 0.001);
    setAmount(max.toFixed(6));
  };

  const handleContinue = () => {
    setError('');
    
    if (!BlockchainService.isValidAddress(toAddress)) {
      setError('Invalid Ethereum address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Invalid amount');
      return;
    }

    if (amountNum > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    setStep('confirm');
  };

  const handleSend = async () => {
    if (!wallet || !gasPrice) return;

    setStep('sending');
    setError('');

    try {
      const gas = gasPrice[selectedGas];
      const tx = await blockchain.sendTransaction(wallet, toAddress, amount, gas);
      setTxHash(tx.hash);
      setStep('success');
      setShowSuccessParticles(true);
      
      // Wait for confirmation
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Transactie mislukt');
      setStep('confirm');
    }
  };

  const handleClose = () => {
    setStep('input');
    setToAddress('');
    setAmount('');
    setError('');
    setTxHash('');
    setShowSuccessParticles(false);
    onClose();
  };

  const estimatedFee = gasPrice ? 
    (parseFloat(gasPrice[selectedGas]) * 21000 / 1e9).toFixed(6) : '0';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto">
              <div className="w-full max-w-md glass-card rounded-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 glass backdrop-blur-xl border-b border-white/10 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold">Crypto versturen</h2>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">

              {step === 'input' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      To address
                    </label>
                    <input
                      type="text"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      placeholder="0x..."
                      className="input-field font-mono text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-600">
                        Bedrag (ETH)
                      </label>
                      <span className="text-sm text-gray-600">
                        Available: {parseFloat(balance).toFixed(6)} ETH
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.000001"
                        className="input-field pr-20"
                      />
                      <button
                        onClick={handleMaxAmount}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700 text-sm font-semibold"
                      >
                        MAX
                      </button>
                    </div>
                    {amount && (
                      <div className="text-sm text-gray-600 mt-2">
                        ≈ ${(parseFloat(amount) * 1700).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-3 block">
                      Gas snelheid
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {gasPrice && ['slow', 'standard', 'fast'].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setSelectedGas(speed as any)}
                          className={`glass p-3 rounded-lg text-center transition-all ${
                            selectedGas === speed
                              ? 'bg-primary-500/20 border-primary-500/50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs text-gray-600 capitalize mb-1">
                            {speed === 'slow' ? 'Langzaam' : speed === 'standard' ? 'Normaal' : 'Snel'}
                          </div>
                          <div className="font-semibold text-sm">
                            {gasPrice[speed as keyof typeof gasPrice]} Gwei
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="glass-card bg-rose-500/10 border-rose-500/20">
                      <p className="text-rose-700 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleContinue}
                    disabled={!toAddress || !amount}
                    className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Doorgaan
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-6">
                  <div className="glass-card bg-primary-500/10 border-primary-500/20">
                    <div className="text-sm text-gray-600 mb-1">Je stuurt</div>
                    <div className="text-3xl font-bold mb-1">{amount} ETH</div>
                    <div className="text-sm text-gray-600">
                      ≈ ${(parseFloat(amount) * 1700).toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Naar</span>
                      <span className="font-mono">{BlockchainService.formatAddress(toAddress)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas fee</span>
                      <span>{estimatedFee} ETH</span>
                    </div>
                    <div className="h-px bg-slate-700" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>{(parseFloat(amount) + parseFloat(estimatedFee)).toFixed(6)} ETH</span>
                    </div>
                  </div>

                  {error && (
                    <div className="glass-card bg-rose-500/10 border-rose-500/20">
                      <p className="text-rose-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('input')}
                      className="flex-1 btn-secondary py-4"
                    >
                      Terug
                    </button>
                    <button
                      onClick={handleSend}
                      className="flex-1 btn-primary py-4"
                    >
                      Verstuur
                    </button>
                  </div>
                </div>
              )}

              {step === 'sending' && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Versturen...</h3>
                  <p className="text-gray-600">Your transaction is being processed</p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-12">
                  <ParticleEffect trigger={showSuccessParticles} type="celebration" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 bounce-in"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Verstuurd!</h3>
                  <p className="text-gray-600 mb-6">
                    Your transaction was sent successfully
                  </p>
                  
                  {txHash && (
                    <a
                      href={`https://etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-mono block mb-6 break-all"
                    >
                      {txHash.slice(0, 20)}...
                    </a>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold transition-all"
                  >
                    Sluiten
                  </button>
                </div>
              )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}





