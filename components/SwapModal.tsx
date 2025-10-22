'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Flame, AlertCircle, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { CHAINS, POPULAR_TOKENS } from '@/lib/chains';
import { SwapService } from '@/lib/swap-service';
import { ethers } from 'ethers';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SwapProvider = '1inch' | 'price-estimate';

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
  const { address, currentChain, balance, wallet } = useWalletStore();
  const [fromToken, setFromToken] = useState<string>('native');
  const [toToken, setToToken] = useState<string>('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [swapProvider, setSwapProvider] = useState<SwapProvider>('price-estimate');

  const chain = CHAINS[currentChain];
  const popularTokens = POPULAR_TOKENS[currentChain] || [];

  // Set default toToken when modal opens
  useEffect(() => {
    if (isOpen && !toToken && popularTokens.length > 0) {
      setToToken(popularTokens[0].address);
    }
  }, [isOpen, popularTokens]);

  // Get quote when amount changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
        fetchQuote();
      } else {
        setToAmount('');
        setQuote(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken]);

  const fetchQuote = async () => {
    if (!fromAmount || !fromToken || !toToken) return;

    setIsLoadingQuote(true);
    setError('');
    setQuote(null);

    try {
      const amountInWei = ethers.parseEther(fromAmount).toString();
      const fromAddress = fromToken === 'native' 
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : fromToken;

      // Get quote from server (1inch or price estimate)
      const swapService = new SwapService(chain.id);
      const quoteData = await swapService.getQuote(
        fromAddress,
        toToken,
        amountInWei
      );

      // API can return either 'toAmount' or 'toTokenAmount' depending on source
      const outputAmount = (quoteData as any)?.toTokenAmount || (quoteData as any)?.toAmount;
      const sourceProvider = (quoteData as any)?.source;
      
      console.log('Quote received:', {
        outputAmount,
        source: sourceProvider,
        protocols: (quoteData as any)?.protocols
      });
      
      if (quoteData && outputAmount && outputAmount !== '0') {
        console.log('✅ Quote success!');
        setQuote(quoteData);
        
        // Format output amount based on token decimals
        const decimals = toToken === '0xdAC17F958D2ee523a2206206994597C13D831ec7' ? 6 : 18;
        const formatted = ethers.formatUnits(outputAmount, decimals);
        setToAmount(formatted);
        
        setSwapProvider(sourceProvider === '1inch' ? '1inch' : 'price-estimate');
      } else {
        console.error('Quote check failed:', {
          hasQuoteData: !!quoteData,
          outputAmount,
          sourceProvider
        });
        setError('No quote available for this token pair');
      }
    } catch (err: any) {
      console.error('Quote error:', err);
      setError(err.message || 'Error fetching quote');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSwap = async () => {
    if (!wallet || !quote || !fromAmount) {
      setError('Wallet, quote of amount ontbreekt');
      return;
    }

    setIsSwapping(true);
    setError('');

    try {
      const amountInWei = ethers.parseEther(fromAmount).toString();
      const fromAddress = fromToken === 'native' 
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : fromToken;

      let txHash: string;

      // Execute swap via 1inch
      if (swapProvider === '1inch') {
        console.log('Executing 1inch swap...');
        const swapService = new SwapService(chain.id);
        
        const txData = await swapService.getSwapTransaction(
          fromAddress,
          toToken,
          amountInWei,
          wallet.address,
          1 // 1% slippage
        );

        if (!txData || !txData.tx) {
          throw new Error('Could not get swap transaction from 1inch');
        }

        // Send transaction
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
        const signer = wallet.connect(provider);

        const tx = await signer.sendTransaction({
          to: txData.tx.to,
          data: txData.tx.data,
          value: txData.tx.value || '0',
          gasLimit: txData.tx.gas || '300000',
        });

        await tx.wait();
        txHash = tx.hash;
      } else {
        throw new Error('Direct swappen niet mogelijk. Voeg 1inch API key toe (zie ONEINCH_API_SETUP.md) of gebruik een externe DEX.');
      }

      console.log('✅ Swap successful:', txHash);
      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFromAmount('');
        setToAmount('');
        setQuote(null);
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Swap error:', err);
      setError(err.message || 'Swap mislukt');
    } finally {
      setIsSwapping(false);
    }
  };

  const getTokenSymbol = (address: string): string => {
    if (address === 'native') return chain.nativeCurrency.symbol;
    const token = popularTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token?.symbol || 'Token';
  };

  const getExchangeRate = (): string => {
    if (!quote || !fromAmount || parseFloat(fromAmount) === 0 || !toAmount || parseFloat(toAmount) === 0) return '0.0';
    const rate = parseFloat(toAmount) / parseFloat(fromAmount);
    return rate.toFixed(6);
  };

  const getProviderLabel = (): string => {
    switch (swapProvider) {
      case '1inch':
        return '1inch';
      case 'price-estimate':
        return 'Price estimate';
      default:
        return 'Unknown';
    }
  };

  const getProviderColor = (): string => {
    switch (swapProvider) {
      case '1inch':
        return 'text-orange-400';
      case 'price-estimate':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const canSwap = (): boolean => {
    return quote && 
           fromAmount && 
           parseFloat(fromAmount) > 0 && 
           swapProvider === '1inch' &&
           !isLoadingQuote &&
           !isSwapping;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold">Swap</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <p className="text-sm text-emerald-300">Swap successful!</p>
            </motion.div>
          )}

          {/* From Token */}
          <div className="glass-card mb-2">
            <div className="text-xs text-gray-600 mb-2">From</div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-bold outline-none min-w-0"
                disabled={isSwapping}
              />
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="bg-gray-100/50 px-3 py-2 rounded-xl font-semibold outline-none flex-shrink-0 max-w-[120px] border border-gray-200 hover:bg-gray-100 transition-colors"
                disabled={isSwapping}
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
              Balance: {balance} {chain.nativeCurrency.symbol}
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={() => {
                // Swap tokens
                const temp = fromToken;
                setFromToken(toToken === '' ? 'native' : toToken);
                setToToken(temp === 'native' ? (popularTokens[0]?.address || '') : temp);
              }}
              className="p-3 glass-card hover:bg-gray-50 rounded-full transition-colors"
              disabled={isSwapping}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Token */}
          <div className="glass-card mb-4">
            <div className="text-xs text-gray-600 mb-2">To</div>
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
                className="bg-gray-100/50 px-3 py-2 rounded-xl font-semibold outline-none flex-shrink-0 max-w-[120px] border border-gray-200 hover:bg-gray-100 transition-colors"
                disabled={isSwapping}
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
          {quote && !error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card mb-4 text-sm"
            >
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Rate:</span>
                <span className="font-medium">
                  1 {getTokenSymbol(fromToken)} = {getExchangeRate()} {getTokenSymbol(toToken)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Estimated gas:</span>
                <span className="font-medium">{(parseInt(quote.estimatedGas || '180000') / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Powered by:
                </span>
                <span className={`font-medium ${getProviderColor()}`}>
                  {getProviderLabel()}
                </span>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoadingQuote && (
            <div className="flex items-center justify-center gap-2 text-orange-600 mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Fetching quote...</span>
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
          <div className={`${swapProvider === '1inch' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-amber-500/10 border-amber-500/20'} border rounded-xl p-3 mb-4`}>
            <p className={`text-xs ${swapProvider === '1inch' ? 'text-orange-300' : 'text-amber-300'}`}>
              <Flame className="w-3 h-3 inline mr-1" />
              {swapProvider === '1inch' ? 
                '1inch: Best rates by comparing 100+ DEXes 🚀' : 
                'Add 1inch API key for real swaps (see ONEINCH_API_SETUP.md)'
              }
            </p>
          </div>

          {/* Swap Button */}
          <motion.button
            whileTap={{ scale: canSwap() ? 0.98 : 1 }}
            onClick={handleSwap}
            disabled={!canSwap()}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Swapping...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                {canSwap() ? 'Swap now' : 'Not available'}
              </>
            )}
          </motion.button>

                  {/* Additional Info */}
                  <p className="text-xs text-slate-500 mt-3 text-center">
                    Always check the details before you swap. Slippage: 1%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}





