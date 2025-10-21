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
      
      // After importing wallet, we need to set a password
      // Force the password setup modal to show immediately
      console.log('🔄 Wallet imported successfully, forcing password setup');
      
      // Set a flag to indicate we just imported a wallet without password
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_just_imported', 'true');
        console.log('✅ Set wallet_just_imported flag');
        
        // Also set a more direct flag
        localStorage.setItem('force_password_setup', 'true');
        console.log('✅ Set force_password_setup flag');
      }
      
      // Don't call onComplete() - we need to stay in onboarding to show password modal
      // Instead, trigger a page reload to force the main app to detect the flags
      console.log('🔄 Reloading page to trigger password setup');
      window.location.reload();
      
    } catch (err) {
      setError('Invalid recovery phrase. Check your input.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mnemonicWords = mnemonic.split(' ');
  const wordsToVerify = [2, 6, 10]; // Verify 3rd, 7th, and 11th word

  const handleVerify = () => {
    const isValid = wordsToVerify.every(
      (index) => verifyWords[index] === mnemonicWords[index]
    );
    
    if (isValid) {
      // Set flag to indicate we just created a wallet without password
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_just_created', 'true');
        localStorage.setItem('force_password_setup', 'true');
        console.log('✅ Set wallet_just_created and force_password_setup flags');
      }
      
      // Don't call onComplete() - we need to reload to show password modal
      // Instead, trigger a page reload to force the main app to detect the flags
      console.log('🔄 Reloading page to trigger password setup');
      window.location.reload();
    } else {
      setError('Onjuiste woorden. Probeer het opnieuw.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-yellow-500/5 to-orange-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full space-y-8"
          >
            {/* Logo Section - No background */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <BlazeLogoImage size={80} />
            </motion.div>

            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4 tracking-tight">
                Blaze
              </h1>
              <p className="text-slate-300 text-xl font-medium mb-2">
                Lightning fast crypto
              </p>
              <p className="text-slate-400 text-sm">
                Set your finances ablaze 🔥
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-4 justify-center text-sm"
            >
              <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Veilig</span>
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">Snel</span>
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium">Mooi</span>
              </span>
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
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Create new wallet
              </button>
              <button
                onClick={() => setStep('import')}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Import wallet
              </button>
            </motion.div>
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
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Je recovery phrase</h2>
              <p className="text-slate-400">
                Save these 12 words safely. You need them to recover your wallet.
              </p>
            </div>

            <div className="glass-card">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {mnemonicWords.map((word, index) => (
                  <div
                    key={index}
                    className="glass p-3 rounded-lg text-center"
                  >
                    <div className="text-xs text-slate-500 mb-1">{index + 1}</div>
                    <div className="font-mono text-slate-200">{word}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Kopieer alle woorden
                  </>
                )}
              </button>
            </div>

            <div className="glass-card bg-amber-500/10 border-amber-500/20">
              <p className="text-amber-200 text-sm">
                <strong>Important:</strong> Write these words on paper and store them in a safe place. 
                Deel ze nooit met anderen. Als je ze verliest, verlies je toegang tot je wallet.
              </p>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full btn-primary py-4 text-lg"
            >
              Ik heb ze opgeschreven →
            </button>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Verificatie</h2>
              <p className="text-slate-400">
                Fill in the correct words to confirm you have written them down.
              </p>
            </div>

            <div className="space-y-4">
              {wordsToVerify.map((index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm text-slate-400">
                    Woord #{index + 1}
                  </label>
                  <input
                    type="text"
                    value={verifyWords[index] || ''}
                    onChange={(e) =>
                      setVerifyWords({ ...verifyWords, [index]: e.target.value.toLowerCase() })
                    }
                    className="input-field"
                    placeholder="Vul het woord in"
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="glass-card bg-rose-500/10 border-rose-500/20">
                <p className="text-rose-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              className="w-full btn-primary py-4 text-lg"
            >
              Verifieer en start
            </button>
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
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Import wallet</h2>
              <p className="text-slate-400">
                Vul je 12-woorden recovery phrase in om je wallet te herstellen.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="input-field min-h-[120px] font-mono text-sm"
                placeholder="word1 word2 word3 ..."
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="glass-card bg-rose-500/10 border-rose-500/20">
                <p className="text-rose-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleImportWallet}
                className="w-full btn-primary py-4 text-lg"
                disabled={!importInput.trim()}
              >
                Importeer wallet
              </button>
              <button
                onClick={() => setStep('welcome')}
                className="w-full btn-secondary py-3"
              >
                Terug
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}




