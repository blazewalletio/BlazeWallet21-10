'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Zap, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { CHAINS, POPULAR_TOKENS } from '@/lib/chains';
import { SwapService } from '@/lib/swap-service';
import { ethers } from 'ethers';
import { BlockchainService } from '@/lib/blockchain';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
  const { address, currentChain, balance } = useWalletStore();
  const [fromToken, setFromToken] = useState<string>('native');
  const [toToken, setToToken] = useState<string>('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState<any>(null);

  const chain = CHAINS[currentChain];
  const popularTokens = POPULAR_TOKENS[currentChain] || [];
  const swapService = new SwapService(chain.id);

  // Set default toToken when modal opens
  useEffect(() => {
    if (isOpen && !toToken && popularTokens.length > 0) {
      setToToken(popularTokens[0].address);
    }
  }, [isOpen, popularTokens]);

  // Get quote when amount changes
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
      fetchQuote();
    } else {
      setToAmount('');
      setQuote(null);
    }
  }, [fromAmount, fromToken, toToken]);

  const fetchQuote = async () => {
    if (!fromAmount || !fromToken || !toToken) return;

    setIsLoading(true);
    setError('');

    try {
      const amountInWei = ethers.parseEther(fromAmount).toString();
      const fromAddress = fromToken === 'native' 
        ? SwapService.getNativeTokenAddress()
        : fromToken;
      
      const quoteData = await swapService.getQuote(
        fromAddress,
        toToken,
        amountInWei
      );

      if (quoteData) {
        setQuote(quoteData);
        setToAmount(ethers.formatEther(quoteData.toAmount));
      } else {
        setError('Kan geen quote ophalen. Probeer het opnieuw.');
      }
    } catch (err) {
      console.error('Quote error:', err);
      setError('Fout bij ophalen van quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    // Direct swapping temporarily disabled - show price quotes only
    setError('Direct swappen is momenteel in onderhoud. Gebruik Uniswap.app of PancakeSwap voor nu. Quotes blijven beschikbaar voor prijsinformatie.');
  };

  const getTokenSymbol = (address: string): string => {
    if (address === 'native') return chain.nativeCurrency.symbol;
    const token = popularTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token?.symbol || 'Token';
  };

  const getTokenName = (address: string): string => {
    if (address === 'native') return chain.nativeCurrency.name;
    const token = popularTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token?.name || 'Unknown';
  };

  const getExchangeRate = (): string => {
    if (!quote || !fromAmount || !toAmount) return '---';
    const rate = parseFloat(toAmount) / parseFloat(fromAmount);
    return rate.toFixed(6);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-card rounded-3xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary-500" />
                Swap
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* From Token */}
            <div className="glass-card mb-2">
              <div className="text-xs text-slate-400 mb-2">Van</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-2xl font-bold outline-none min-w-0"
                />
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-slate-700 px-3 py-2 rounded-xl font-semibold outline-none flex-shrink-0 max-w-[120px]"
                >
                  <option value="native">{chain.nativeCurrency.symbol}</option>
                  {popularTokens.map(token => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Balance: {fromToken === 'native' ? balance : '0.00'} {getTokenSymbol(fromToken)}
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center -my-2 relative z-10">
              <motion.button
                whileTap={{ scale: 0.9, rotate: 180 }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full border-4 border-slate-900"
                onClick={() => {
                  // Swap tokens
                  const temp = fromToken;
                  setFromToken(toToken || 'native');
                  setToToken(temp);
                  setFromAmount(toAmount);
                }}
              >
                <ArrowDown className="w-5 h-5" />
              </motion.button>
            </div>

            {/* To Token */}
            <div className="glass-card mb-4">
              <div className="text-xs text-slate-400 mb-2">Naar</div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-2xl font-bold outline-none text-emerald-400 min-w-0"
                />
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-slate-700 px-3 py-2 rounded-xl font-semibold outline-none flex-shrink-0 max-w-[120px]"
                >
                  <option value="">Token</option>
                  {popularTokens.map(token => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exchange Rate Info */}
            {quote && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card mb-4 text-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Koers:</span>
                  <span className="font-medium">
                    1 {getTokenSymbol(fromToken)} = {getExchangeRate()} {getTokenSymbol(toToken)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Geschatte gas:</span>
                  <span className="font-medium">{(parseInt(quote.estimatedGas) / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Powered by:
                  </span>
                  <span className="font-medium text-primary-400">Live prices</span>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-primary-400 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Ophalen van quote...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4 flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{error}</p>
              </motion.div>
            )}

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-300">
                <Zap className="w-3 h-3 inline mr-1" />
                Arc berekent swap prijzen op basis van live marktdata. Direct swappen is momenteel in onderhoud.
              </p>
            </div>

            {/* Swap Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSwap}
              disabled={!quote || isLoading || !fromAmount || !toToken}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Swappen...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Swap nu
                </>
              )}
            </motion.button>

            {/* Disclaimer */}
            <p className="text-xs text-slate-500 text-center mt-4">
              Controleer altijd de details voor je swapped. Slippage: 1%
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}