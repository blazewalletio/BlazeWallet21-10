'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Shield, AlertCircle, CheckCircle, X } from 'lucide-react';
import { WebAuthnService } from '@/lib/webauthn-service';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onRegister?: () => void;
  mode: 'authenticate' | 'register';
  username?: string;
}

export default function BiometricAuthModal({ 
  isOpen, 
  onSuccess, 
  onCancel, 
  onRegister,
  mode,
  username = 'BLAZE User'
}: BiometricAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [webauthnService] = useState(() => WebAuthnService.getInstance());
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = webauthnService.isSupported();
      const available = await webauthnService.isPlatformAuthenticatorAvailable();
      
      setIsSupported(supported);
      setIsAvailable(available);
    };

    if (isOpen) {
      checkSupport();
    }
  }, [isOpen, webauthnService]);

  const handleBiometricAuth = async () => {
    if (!isSupported || !isAvailable) {
      setError('Biometrische authenticatie is niet beschikbaar op dit apparaat');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (mode === 'register') {
        // Register new biometric credential
        const result = await webauthnService.register('blaze-user', username);
        
        if (result.success && result.credential) {
          webauthnService.storeCredential(result.credential);
          setSuccess(true);
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          setError(result.error || 'Registratie mislukt');
        }
      } else {
        // Authenticate with existing credential
        const credentials = webauthnService.getStoredCredentials();
        
        if (credentials.length === 0) {
          setError('Geen biometrische credentials gevonden. Registreer eerst je biometrie.');
          return;
        }

        const result = await webauthnService.authenticate(credentials[0].id);
        
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          setError(result.error || 'Authenticatie mislukt');
        }
      }
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      setError(error.message || 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (mode === 'register' && onRegister) {
      onRegister();
    } else {
      onCancel();
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
              {success ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Fingerprint className="w-8 h-8 text-white" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'register' ? 'Biometrie instellen' : 'Biometrische toegang'}
            </h2>
            
            <p className="text-slate-400">
              {mode === 'register' 
                ? 'Stel vingerafdruk of Face ID in voor snelle toegang'
                : 'Gebruik je vingerafdruk of Face ID om toegang te krijgen'
              }
            </p>
          </div>

          {!isSupported && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">WebAuthn niet ondersteund</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                Biometrische authenticatie is niet beschikbaar in deze browser.
              </p>
            </div>
          )}

          {isSupported && !isAvailable && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Biometrie niet beschikbaar</span>
              </div>
              <p className="text-sm text-yellow-300 mt-1">
                Dit apparaat ondersteunt geen vingerafdruk of Face ID authenticatie.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">
                  {mode === 'register' ? 'Biometrie succesvol ingesteld!' : 'Toegang verleend!'}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleBiometricAuth}
              disabled={isLoading || !isSupported || !isAvailable}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  <span>
                    {mode === 'register' 
                      ? 'Biometrie instellen' 
                      : 'Vingerafdruk / Face ID'
                    }
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>
                {mode === 'register' ? 'Overslaan' : 'Annuleren'}
              </span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Je biometrische data blijft veilig op dit apparaat</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
