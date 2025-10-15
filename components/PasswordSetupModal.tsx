'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { BiometricStore } from '@/lib/biometric-store';

interface PasswordSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function PasswordSetupModal({ isOpen, onComplete }: PasswordSetupModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setPassword: setWalletPassword } = useWalletStore();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password moet minimaal 8 karakters zijn';
    if (!/(?=.*[a-z])/.test(pwd)) return 'Password moet minimaal 1 kleine letter bevatten';
    if (!/(?=.*[A-Z])/.test(pwd)) return 'Password moet minimaal 1 hoofdletter bevatten';
    if (!/(?=.*\d)/.test(pwd)) return 'Password moet minimaal 1 cijfer bevatten';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passworden komen niet overeen');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Setting up password...');
      await setWalletPassword(password);
      
      console.log('💾 Storing password for biometric access...');
      // Also store password for biometric access if available
      const biometricStore = BiometricStore.getInstance();
      await biometricStore.storePassword(password);
      console.log('✅ Password stored for biometric access');
      
      // Clear import flags
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet_just_imported');
        localStorage.removeItem('force_password_setup');
      }
      
      console.log('✅ Password setup complete!');
      onComplete();
    } catch (error: any) {
      console.error('Password setup error:', error);
      const errorMessage = error?.message || 'Er is een fout opgetreden. Probeer opnieuw.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[!@#$%^&*])/.test(password)) score++;

    if (score <= 2) return { strength: score * 20, label: 'Zwak', color: 'bg-red-500' };
    if (score <= 3) return { strength: score * 20, label: 'Matig', color: 'bg-yellow-500' };
    return { strength: score * 20, label: 'Sterk', color: 'bg-green-500' };
  };

  const strength = passwordStrength();

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
              Secure your wallet
            </h2>
            <p className="text-slate-400">
              Stel een wachtwoord in om je wallet te beschermen tegen ongeautoriseerde toegang
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Minimaal 8 karakters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Sterkte:</span>
                    <span className={strength.label === 'Sterk' ? 'text-green-400' : strength.label === 'Matig' ? 'text-yellow-400' : 'text-red-400'}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bevestig wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Herhaal je wachtwoord"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              disabled={isLoading || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Password instellen'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Your password is encrypted and stored locally. 
              <br />
              Wij hebben geen toegang tot je wachtwoord.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
