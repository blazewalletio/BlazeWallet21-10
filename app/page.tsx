'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/lib/wallet-store';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import SplashScreen from '@/components/SplashScreen';

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const { importWallet } = useWalletStore();

  useEffect(() => {
    // Hide splash immediately - no delay
    setShowSplash(false);
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

  // Loading state - subtle loader
  if (hasWallet === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
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


