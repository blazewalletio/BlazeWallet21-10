'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, ShieldCheck, Zap, ExternalLink } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { CHAINS } from '@/lib/chains';
import { RampService } from '@/lib/ramp-service';
import { useState } from 'react';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyModal({ isOpen, onClose }: BuyModalProps) {
  const { address, currentChain } = useWalletStore();
  const chain = CHAINS[currentChain];
  const [selectedAsset, setSelectedAsset] = useState<string>('');

  const supportedAssets = RampService.getSupportedAssets(chain.id);

  const handleBuy = (asset?: string) => {
    if (!address) return;

    RampService.openWidget({
      hostAppName: 'Arc Wallet',
      hostLogoUrl: 'https://arcwallet.vercel.app/icon-512.png',
      userAddress: address,
      swapAsset: asset || selectedAsset || undefined,
    });

    // Close modal after opening Ramp
    setTimeout(() => onClose(), 500);
  };

  // Get asset display name
  const getAssetName = (asset: string): string => {
    const parts = asset.split('_');
    return parts[0]; // e.g., 'USDT_ETHEREUM' -> 'USDT'
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
              <div>
                <h2 className="text-2xl font-bold">Koop crypto</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Met iDEAL, creditcard of bankoverschrijving
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">Instant</p>
              </div>
              <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">Veilig</p>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">Makkelijk</p>
              </div>
            </div>

            {/* Popular Assets */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Populaire crypto</h3>
              <div className="grid grid-cols-2 gap-3">
                {supportedAssets.slice(0, 6).map((asset) => (
                  <motion.button
                    key={asset}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBuy(asset)}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
                        {getAssetName(asset).charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{getAssetName(asset)}</p>
                        <p className="text-xs text-slate-400">Kopen</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Betaalmethodes</h3>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-sm">
                  <Banknote className="w-4 h-4 inline mr-1" />
                  iDEAL
                </div>
                <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-sm">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Creditcard
                </div>
                <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-sm">
                  Bank
                </div>
                <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-sm">
                  SEPA
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">Powered by Ramp Network</p>
                  <p className="text-slate-400 text-xs">
                    Veilige en betrouwbare on-ramp service. Crypto wordt direct naar je Arc wallet gestuurd.
                    Fees: ~1-2% per transactie.
                  </p>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBuy()}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Start kopen
              <ExternalLink className="w-4 h-4" />
            </motion.button>

            {/* Disclaimer */}
            <p className="text-xs text-slate-500 text-center mt-4">
              Door te klikken ga je naar Ramp Network. Arc Wallet slaat geen betalingsgegevens op.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
