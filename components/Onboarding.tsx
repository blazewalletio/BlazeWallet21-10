'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, Copy, Check } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import BlazeLogo from './BlazeLogo';

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
    const phrase = await createWallet();
    setMnemonic(phrase);
    setStep('mnemonic');
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="inline-block"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-6">
                <BlazeLogo size={48} />
              </div>
            </motion.div>

            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 tracking-tight">
              Blaze
            </h1>
            <p className="text-slate-400 text-lg mb-2">
              Lightning fast crypto
            </p>
              <div className="flex gap-4 justify-center text-sm text-slate-500 mb-8">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Veilig
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Snel
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Mooi
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCreateWallet}
                className="w-full btn-primary py-4 text-lg"
              >
                Create new wallet
              </button>
              <button
                onClick={() => setStep('import')}
                className="w-full btn-secondary py-4 text-lg"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Import wallet
              </button>
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
  );
}




