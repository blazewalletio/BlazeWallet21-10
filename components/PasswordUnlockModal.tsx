'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, AlertCircle, Fingerprint } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';

interface PasswordUnlockModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onFallback: () => void;
}

export default function PasswordUnlockModal({ isOpen, onComplete, onFallback }: PasswordUnlockModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const { unlockWithPassword } = useWalletStore();
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Check if biometric is available on mount
  useEffect(() => {
    const checkBiometric = async () => {
      if (typeof window !== 'undefined') {
        // Check both localStorage flag and if credentials/password are stored
        const enabled = localStorage.getItem('biometric_enabled') === 'true';
        const hasStoredPassword = localStorage.getItem('biometric_protected_password') !== null;
        
        // Also check for WebAuthn credentials
        const credentialsStr = localStorage.getItem('webauthn_credentials');
        const hasCredentials = !!(credentialsStr && JSON.parse(credentialsStr).length > 0);
        
        console.log('🔍 Biometric check:', { enabled, hasStoredPassword, hasCredentials });
        
        // Show biometric button if enabled AND (has stored password OR has credentials)
        const available = enabled && (hasStoredPassword || hasCredentials);
        setBiometricAvailable(available);
      }
    };
    
    if (isOpen) {
      checkBiometric();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (attempts >= 3) {
      setError('Te veel mislukte pogingen. Gebruik je recovery phrase om opnieuw te beginnen.');
      return;
    }

    setIsLoading(true);
    try {
      await unlockWithPassword(password);
      onComplete();
    } catch (error) {
      setAttempts(prev => prev + 1);
      setError(`Ongeldig wachtwoord. Poging ${attempts + 1}/3`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { unlockWithBiometric } = useWalletStore.getState();
      await unlockWithBiometric();
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Biometrische authenticatie mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Ontgrendel wallet
            </h2>
            <p className="text-slate-400">
              Voer je wachtwoord in om toegang te krijgen tot je wallet
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Voer je wachtwoord in"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Ontgrendelen'
              )}
            </button>

            {/* Biometric Authentication Button - Only show if enabled */}
            {biometricAvailable && (
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed border border-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Fingerprint className="w-5 h-5" />
                <span>Vingerafdruk / Face ID</span>
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onFallback}
              className="text-slate-400 hover:text-white text-sm underline"
            >
              Herstel met recovery phrase
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Je wallet is versleuteld opgeslagen op dit apparaat.
              <br />
              Je wachtwoord wordt niet naar onze servers verzonden.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
