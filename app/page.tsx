'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/lib/wallet-store';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import PasswordSetupModal from '@/components/PasswordSetupModal';
import PasswordUnlockModal from '@/components/PasswordUnlockModal';

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showPasswordUnlock, setShowPasswordUnlock] = useState(false);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const { importWallet, hasPassword, isLocked, wallet } = useWalletStore();

  useEffect(() => {
    // Hide splash immediately - no delay
    setShowSplash(false);
  }, []);

  useEffect(() => {
    // Check wallet state on load
    const checkWallet = async () => {
      const storedAddress = localStorage.getItem('wallet_address');
      const hasPasswordStored = localStorage.getItem('has_password') === 'true';
      
      if (storedAddress) {
        if (hasPasswordStored) {
          // Wallet exists with password protection
          setHasWallet(true);
          setShowPasswordUnlock(true);
        } else {
          // Wallet exists but no password set - check for old unencrypted mnemonic
          const storedMnemonic = localStorage.getItem('wallet_mnemonic');
          if (storedMnemonic) {
            try {
              await importWallet(storedMnemonic);
              setHasWallet(true);
              setShowPasswordSetup(true); // Prompt to set password
            } catch (error) {
              console.error('Error importing wallet:', error);
              setHasWallet(false);
            }
          } else {
            setHasWallet(false);
          }
        }
      } else {
        setHasWallet(false);
      }
    };

    checkWallet();
  }, []);

  // Auto-lock check
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const { checkAutoLock } = useWalletStore.getState();
        checkAutoLock();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
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
        <>
          <Dashboard />
          
          {/* Password Setup Modal */}
          <PasswordSetupModal
            isOpen={showPasswordSetup}
            onComplete={() => {
              setShowPasswordSetup(false);
              setShowPasswordUnlock(false);
            }}
          />
          
          {/* Password Unlock Modal */}
          <PasswordUnlockModal
            isOpen={showPasswordUnlock}
            onComplete={() => {
              setShowPasswordUnlock(false);
            }}
            onFallback={() => {
              setShowPasswordUnlock(false);
              setShowRecoveryPhrase(true);
            }}
          />
        </>
      )}
    </>
  );
}



