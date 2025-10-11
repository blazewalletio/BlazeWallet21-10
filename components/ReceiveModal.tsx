'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, ArrowDownLeft } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import QRCode from 'qrcode';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const { address } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [qrDataURL, setQrDataURL] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && address) {
      generateQRCode();
    }
  }, [isOpen, address]);

  const generateQRCode = async () => {
    if (!address) return;
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrDataURL(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const shareAddress = async () => {
    if (!address) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wallet Address',
          text: address,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyAddress();
    }
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
                        <ArrowDownLeft className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold">Crypto ontvangen</h2>
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
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-6">
                        Scan deze QR code of deel je wallet adres
                      </p>
                      
                      {/* QR Code */}
                      <div className="glass-card p-6 rounded-xl mb-6">
                        {qrDataURL ? (
                          <img
                            src={qrDataURL}
                            alt="QR Code"
                            className="w-48 h-48 mx-auto"
                          />
                        ) : (
                          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-gray-400">Loading QR...</div>
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="glass-card p-4 rounded-xl mb-6">
                        <div className="font-mono text-sm break-all text-gray-700 mb-4">
                          {address}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={copyAddress}
                            className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                Gekopieerd!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Kopiëren
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={shareAddress}
                            className="flex-1 py-2 px-4 glass-card hover:bg-white/10 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Delen
                          </button>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-amber-700 text-sm">
                          ⚠️ Alleen crypto naar dit adres sturen. Andere assets kunnen verloren gaan.
                        </p>
                      </div>
                    </div>

                    {/* Network selector placeholder */}
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Netwerk
                      </label>
                      <div className="glass-card flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-sm">Ξ</span>
                        </div>
                        <div>
                          <div className="font-semibold">Ethereum</div>
                          <div className="text-xs text-gray-600">Mainnet</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


