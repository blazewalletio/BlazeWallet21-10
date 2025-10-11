'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/lib/wallet-store';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import PasswordSetupModal from '@/components/PasswordSetupModal';
import PasswordUnlockModal from '@/components/PasswordUnlockModal';
import BiometricAuthModal from '@/components/BiometricAuthModal';
import QRLoginModal from '@/components/QRLoginModal';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showPasswordUnlock, setShowPasswordUnlock] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [showQRLogin, setShowQRLogin] = useState(false);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { importWallet, hasPassword, isLocked, wallet, hasBiometric, isBiometricEnabled } = useWalletStore();

  useEffect(() => {
    // Hide splash immediately - no delay
    setShowSplash(false);
    
    // Detect if device is mobile
    const checkMobile = () => {
      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    console.log('🔍 Device detection:', { 
      userAgent: navigator.userAgent,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });
  }, []);

  useEffect(() => {
    // Check wallet state on load - wait for isMobile to be set
    const checkWallet = async () => {
      const storedAddress = localStorage.getItem('wallet_address');
      const hasPasswordStored = localStorage.getItem('has_password') === 'true';
      const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true';
      
            console.log('🔍 Checking wallet state:', { storedAddress, hasPasswordStored, biometricEnabled, isMobile });
            console.log('🔍 LocalStorage check:', {
              wallet_address: localStorage.getItem('wallet_address'),
              wallet_mnemonic: localStorage.getItem('wallet_mnemonic'),
              has_password: localStorage.getItem('has_password'),
              biometric_enabled: localStorage.getItem('biometric_enabled'),
              wallet_just_imported: localStorage.getItem('wallet_just_imported'),
              wallet_just_created: localStorage.getItem('wallet_just_created'),
              force_password_setup: localStorage.getItem('force_password_setup')
            });
      
      if (storedAddress) {
        if (hasPasswordStored) {
          // Wallet exists with password protection
          setHasWallet(true);
          
          // Check device and authentication method
          console.log('🔍 Auth flow decision:', { biometricEnabled, isMobile });
          if (biometricEnabled && isMobile) {
            // Try biometric authentication first on mobile
            console.log('📱 Mobile with biometric - showing biometric auth');
            setShowBiometricAuth(true);
          } else if (!isMobile) {
            // Desktop users get QR login option
            console.log('🖥️ Desktop - showing QR login');
            setShowQRLogin(true);
          } else {
            // Fallback to password
            console.log('🔑 Fallback to password unlock');
            setShowPasswordUnlock(true);
          }
        } else {
          // Wallet exists but no password set - check for old unencrypted mnemonic
          const storedMnemonic = localStorage.getItem('wallet_mnemonic');
          const justImported = localStorage.getItem('wallet_just_imported') === 'true';
          const justCreated = localStorage.getItem('wallet_just_created') === 'true';
          const forcePasswordSetup = localStorage.getItem('force_password_setup') === 'true';
          
          if (storedMnemonic || justImported || justCreated || forcePasswordSetup) {
            try {
              if (forcePasswordSetup) {
                // Clear the flag
                localStorage.removeItem('force_password_setup');
                localStorage.removeItem('wallet_just_imported');
                console.log('🚨 FORCE: Password setup required after wallet import');
              } else if (justImported) {
                // Clear the flag
                localStorage.removeItem('wallet_just_imported');
                console.log('🔄 Wallet just imported - showing password setup');
              } else if (justCreated) {
                // Clear the flag
                localStorage.removeItem('wallet_just_created');
                console.log('🔄 Wallet just created - showing password setup');
              } else if (storedMnemonic) {
                // Legacy case - re-import from stored mnemonic
                await importWallet(storedMnemonic);
                console.log('🔄 Legacy wallet found - re-importing and showing password setup');
              }
              
              setHasWallet(true);
              console.log('🎯 Triggering password setup modal');
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

    // Only check wallet after isMobile is determined
    if (isMobile !== null) {
      checkWallet();
    }
  }, [isMobile]);

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
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
          
          {/* Password Setup Modal */}
          <PasswordSetupModal
            isOpen={showPasswordSetup}
            onComplete={() => {
              setShowPasswordSetup(false);
              // After password setup, offer biometric setup on mobile
              if (isMobile) {
                setShowBiometricSetup(true);
              }
            }}
          />
          
          {/* Biometric Setup Modal */}
          <BiometricAuthModal
            isOpen={showBiometricSetup}
            mode="register"
            username="BLAZE User"
            onSuccess={() => {
              setShowBiometricSetup(false);
            }}
            onCancel={() => {
              setShowBiometricSetup(false);
            }}
            onRegister={() => {
              setShowBiometricSetup(false);
            }}
          />
          
          {/* Biometric Authentication Modal */}
          <BiometricAuthModal
            isOpen={showBiometricAuth}
            mode="authenticate"
            username="BLAZE User"
            onSuccess={() => {
              setShowBiometricAuth(false);
            }}
            onCancel={() => {
              setShowBiometricAuth(false);
              setShowPasswordUnlock(true);
            }}
          />
          
          {/* QR Login Modal */}
          <QRLoginModal
            isOpen={showQRLogin}
            onSuccess={() => {
              setShowQRLogin(false);
            }}
            onCancel={() => {
              setShowQRLogin(false);
              setShowPasswordUnlock(true);
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



