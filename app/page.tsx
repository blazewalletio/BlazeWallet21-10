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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 text-center">
          {/* Logo Animation */}
          <div className="relative mb-6">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl animate-pulse" />
            
            {/* Main Icon */}
            <div className="relative w-20 h-20 mx-auto bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="text-4xl">🔥</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 tracking-tight">
            Blaze
          </h1>

          {/* Loading Text */}
          <div className="text-slate-400 text-lg mb-4">
            Wallet laden...
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
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
