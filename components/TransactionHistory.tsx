'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  Clock, 
  CheckCircle2,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { BlockchainService } from '@/lib/blockchain';
import { CHAINS } from '@/lib/chains';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  isError: boolean;
}

export default function TransactionHistory() {
  const { address, currentChain } = useWalletStore();
  const chain = CHAINS[currentChain];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string>('');

  useEffect(() => {
    loadTransactions();
  }, [address, currentChain]);

  const loadTransactions = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const blockchain = new BlockchainService(currentChain as any);
      const txs = await blockchain.getTransactionHistory(address, 10);
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setLoading(false);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Net nu';
    if (minutes < 60) return `${minutes}m geleden`;
    if (hours < 24) return `${hours}u geleden`;
    return `${days}d geleden`;
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recente transacties</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-white border-2 border-gray-900 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recente transacties</h3>
        <div className="text-center py-8 text-gray-600">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nog geen transacties</p>
          <p className="text-sm mt-1">Je transacties verschijnen hier zodra je ze maakt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Recente transacties</h3>
      <div className="space-y-2">
        <AnimatePresence>
          {transactions.map((tx, index) => {
            const isSent = tx.from.toLowerCase() === address?.toLowerCase();
            const otherAddress = isSent ? tx.to : tx.from;
            const value = parseFloat(tx.value);

            return (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-4 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.isError 
                      ? 'bg-rose-500/20' 
                      : isSent 
                        ? 'bg-orange-500/20' 
                        : 'bg-emerald-500/20'
                  }`}>
                    {tx.isError ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : isSent ? (
                      <ArrowUpRight className="w-5 h-5 text-orange-400" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {tx.isError ? 'Mislukt' : isSent ? 'Verzonden' : 'Ontvangen'}
                      </span>
                      {!tx.isError && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-mono truncate">
                        {BlockchainService.formatAddress(otherAddress)}
                      </span>
                      <button
                        onClick={() => copyHash(tx.hash)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Kopieer transaction hash"
                      >
                        {copiedHash === tx.hash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTime(tx.timestamp)}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <div className={`font-semibold ${
                      tx.isError 
                        ? 'text-slate-500' 
                        : isSent 
                          ? 'text-orange-400' 
                          : 'text-emerald-400'
                    }`}>
                      {isSent ? '-' : '+'}{value.toFixed(6)} {chain.nativeCurrency.symbol}
                    </div>
                    <a
                      href={`${chain.explorerUrl}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span>Bekijk</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
