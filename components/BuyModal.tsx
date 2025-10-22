'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, ShieldCheck, Zap, ExternalLink } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { CHAINS } from '@/lib/chains';
import { TransakService } from '@/lib/transak-service';
import { useState } from 'react';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyModal({ isOpen, onClose }: BuyModalProps) {
  const { address, currentChain } = useWalletStore();
  const chain = CHAINS[currentChain];
  const supportedAssets = TransakService.getSupportedAssets(chain.id);

  const handleBuy = (currencyCode?: string) => {
    if (!address) return;

    // Validate wallet address format for the selected currency
    if (currencyCode && !TransakService.validateWalletAddress(address, currencyCode)) {
      alert(`⚠️ Invalid wallet address format for ${currencyCode}. Please ensure you're using the correct wallet for this cryptocurrency.`);
      return;
    }

    // Create multi-chain wallet addresses for better compatibility
    const walletAddresses = TransakService.createWalletAddresses(address, chain.id);

    TransakService.openWidget({
      walletAddress: address,
      walletAddresses: walletAddresses,
      currencyCode: currencyCode,
      baseCurrencyCode: 'EUR', // Default to EUR for Dutch market
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY, // Will be set when partner account is approved
      environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING',
      themeColor: '#F97316', // BLAZE orange
      disableWalletAddressForm: true, // Hide wallet address input since we provide it
      hideMenu: false, // Show Transak menu
      isAutoFillUserData: false, // Let users fill their own data
    });

    // Close modal after opening Transak
    setTimeout(() => onClose(), 500);
  };

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
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Buy crypto</h2>
                        <p className="text-xs text-gray-400">
                          Met iDEAL, creditcard of bankoverschrijving
                        </p>
                      </div>
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

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-gray-700">Instant</p>
              </div>
              <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-gray-700">Veilig</p>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-700">Makkelijk</p>
              </div>
            </div>

            {/* Popular Assets */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Popular crypto</h3>
              <div className="grid grid-cols-2 gap-3">
                {supportedAssets.slice(0, 6).map((currencyCode) => {
                  const displayName = TransakService.getDisplayName(currencyCode);
                  return (
                    <motion.button
                      key={currencyCode}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBuy(currencyCode)}
                      className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{displayName}</p>
                          <p className="text-xs text-gray-600">Buy</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Betaalmethodes</h3>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 bg-gray-50/50 rounded-lg text-sm">
                  <Banknote className="w-4 h-4 inline mr-1" />
                  iDEAL
                </div>
                <div className="px-3 py-2 bg-gray-50/50 rounded-lg text-sm">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Creditcard
                </div>
                <div className="px-3 py-2 bg-gray-50/50 rounded-lg text-sm">
                  Bank
                </div>
                <div className="px-3 py-2 bg-gray-50/50 rounded-lg text-sm">
                  SEPA
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">Powered by Transak</p>
                  <p className="text-gray-600 text-xs">
                    Globally trusted fiat-to-crypto service. Crypto is sent directly to your BLAZE Wallet.
                    Fees: ~0.99% - 2.99% per transaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBuy()}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-5 h-5" />
              Start buying
              <ExternalLink className="w-4 h-4" />
            </motion.button>

            {/* Disclaimer */}
            <p className="text-xs text-slate-500 text-center mt-4">
              Door te klikken ga je naar Transak. BLAZE Wallet slaat geen betalingsgegevens op.
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




