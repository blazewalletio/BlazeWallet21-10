'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import QRCode from 'qrcode';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const { address } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && address) {
      generateQRCode();
    }
  }, [isOpen, address]);

  const generateQRCode = async () => {
    if (!address) return;
    
    try {
      const qr = await QRCode.toDataURL(address, {
        width: 300,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#00000000',
        },
      });
      setQrCode(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareAddress = async () => {
    if (!address) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mijn Ethereum adres',
          text: address,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyAddress();
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <div className="glass-card max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Crypto ontvangen</h2>
                <button
                  onClick={onClose}
                  className="glass p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-400 mb-6">
                    Scan deze QR code of deel je wallet adres
                  </p>

                  {/* QR Code */}
                  <div className="relative inline-block">
                    <div className="glass-card p-6 inline-block">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-primary blur-xl opacity-30" />
                        {qrCode && (
                          <img
                            src={qrCode}
                            alt="QR Code"
                            className="relative z-10 w-64 h-64 mx-auto"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-500 rounded-br-lg" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Jouw Ethereum adres
                  </label>
                  <div className="glass-card bg-slate-900/50">
                    <div className="font-mono text-sm break-all text-slate-300">
                      {address}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={copyAddress}
                    className="btn-secondary py-4 flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Gekopieerd!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Kopieer
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={shareAddress}
                    className="btn-secondary py-4 flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Delen
                  </button>
                </div>

                {/* Network warning */}
                <div className="glass-card bg-amber-500/10 border-amber-500/20">
                  <div className="flex gap-3">
                    <span className="text-xl">⚠️</span>
                    <div className="text-sm text-amber-200">
                      <strong>Belangrijk:</strong> Stuur alleen ETH en ERC-20 tokens 
                      naar dit adres op het Ethereum netwerk. Andere tokens kunnen verloren gaan.
                    </div>
                  </div>
                </div>

                {/* Network selector placeholder */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Netwerk
                  </label>
                  <div className="glass-card flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm">Ξ</span>
                    </div>
                    <div>
                      <div className="font-semibold">Ethereum</div>
                      <div className="text-xs text-slate-400">Mainnet</div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
