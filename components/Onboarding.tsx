'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, Copy, Check } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import BlazeLogoImage from './BlazeLogoImage';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'create' | 'import' | 'mnemonic' | 'verify'>('welcome');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [importInput, setImportInput] = useState<string>('');
  const [verifyWords, setVerifyWords] = useState<{ [key: number]: string }>({});
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');

  const { createWallet, importWallet } = useWalletStore();

  const handleCreateWallet = async () => {
    try {
      setError('');
      const phrase = await createWallet();
      setMnemonic(phrase);
      setStep('mnemonic');
      
      console.log('🔄 New wallet created successfully, setting flags for password setup');
      
      // Set flags to indicate we just created a new wallet without password
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_just_created', 'true');
        console.log('✅ Set wallet_just_created flag');
        
        // Also set a more direct flag
        localStorage.setItem('force_password_setup', 'true');
        console.log('✅ Set force_password_setup flag');
      }
      
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Er ging iets fout bij het aanmaken van de wallet.');
    }
  };

  const handleImportWallet = async () => {
    try {
      setError('');
      await importWallet(importInput.trim());
      setStep('welcome');
      onComplete();
      
      console.log('🔄 Wallet imported successfully, setting flags for password setup');
      
      // Set flags to indicate we just imported a wallet without password
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_just_imported', 'true');
        console.log('✅ Set wallet_just_imported flag');
        
        // Also set a more direct flag
        localStorage.setItem('force_password_setup', 'true');
        console.log('✅ Set force_password_setup flag');
      }
      
    } catch (err) {
      console.error('Error importing wallet:', err);
      setError('Ongeldige recovery phrase. Controleer de woorden en probeer opnieuw.');
    }
  };

  const handleVerifyMnemonic = () => {
    const words = Object.values(verifyWords);
    if (words.length !== 12 || words.some(word => !word.trim())) {
      setError('Vul alle 12 woorden in.');
      return;
    }
    
    const userPhrase = words.join(' ');
    if (userPhrase !== mnemonic) {
      setError('De woorden komen niet overeen. Probeer opnieuw.');
      return;
    }
    
    setStep('welcome');
    onComplete();
  };

  const copyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const words = mnemonic.split(' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/3 via-yellow-500/3 to-orange-500/3" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg w-full"
            >
              {/* Header Section - Logo + Title */}
              <div className="text-center mb-12">
                {/* Logo - Clean and perfectly centered */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-8 flex justify-center"
                >
                  <BlazeLogoImage size={120} />
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <h1 className="text-7xl font-bold text-black mb-4 tracking-tight">
                    Blaze
                  </h1>
                  <p className="text-gray-600 text-2xl font-medium mb-3">
                    Lightning fast crypto
                  </p>
                  <p className="text-gray-500 text-lg">
                    Set your finances ablaze 🔥
                  </p>
                </motion.div>
              </div>

              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-12"
              >
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-700 font-semibold text-lg">Secure</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-700 font-semibold text-lg">Fast</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-purple-50 rounded-2xl border border-purple-200">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    <span className="text-purple-700 font-semibold text-lg">Smart</span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="space-y-4"
              >
                <button
                  onClick={handleCreateWallet}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-xl"
                >
                  Create new wallet
                </button>
                <button
                  onClick={() => setStep('import')}
                  className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-bold py-5 px-8 rounded-2xl hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-xl"
                >
                  <Download className="w-6 h-6 inline mr-3" />
                  Import wallet
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Wallet</h2>
                <p className="text-gray-600">Enter your 12-word recovery phrase</p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="Enter your 12-word recovery phrase..."
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                
                {error && (
                  <div className="text-red-600 text-sm text-center">{error}</div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('welcome')}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImportWallet}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                  >
                    Import
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'mnemonic' && (
            <motion.div
              key="mnemonic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Save Your Recovery Phrase</h2>
                <p className="text-gray-600">Write down these 12 words in order. Store them safely!</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                      <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{word}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={copyMnemonic}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-orange-800 text-sm font-medium mb-2">⚠️ Important Security Notice</p>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• Never share your recovery phrase with anyone</li>
                  <li>• Store it offline in a secure location</li>
                  <li>• Anyone with these words can access your wallet</li>
                </ul>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                I've Saved My Recovery Phrase
              </button>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Recovery Phrase</h2>
                <p className="text-gray-600">Enter the words in the correct order to verify</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 12 }, (_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={verifyWords[index] || ''}
                        onChange={(e) => setVerifyWords(prev => ({ ...prev, [index]: e.target.value }))}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="word"
                      />
                    </div>
                  ))}
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm text-center mt-4">{error}</div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('mnemonic')}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyMnemonic}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                >
                  Verify
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}