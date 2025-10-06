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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-3xl">💎</span>
          </div>
          <div className="text-slate-400">CryptoVault laden...</div>
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
