'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/wallet-store';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import SplashScreen from '@/components/SplashScreen';

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const { importWallet } = useWalletStore();

  useEffect(() => {
    // Hide splash after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if user has a wallet in localStorage
    const checkWallet = async () => {
      const storedMnemonic = localStorage.getItem('wallet_mnemonic');
      
      if (storedMnemonic) {
        try {
          await importWallet(storedMnemonic);
          setHasWallet(true);
        } catch (error) {
          console.error('Error importing wallet:', error);
          setHasWallet(false);
        }
      } else {
        setHasWallet(false);
      }
    };

    checkWallet();
  }, []);

  // Loading state
  if (hasWallet === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <div className="relative mb-6">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="w-20 h-20 mx-auto"
            >
              <img 
                src="/blazelogooff.png" 
                alt="Blaze" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>
          <div className="text-slate-400 text-lg">BlazeWallet laden...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSplash && <SplashScreen />}
      {!hasWallet ? (
        <Onboarding onComplete={() => setHasWallet(true)} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}

