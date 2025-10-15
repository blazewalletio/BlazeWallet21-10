'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { Settings, Key, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AISettingsModalProps {
  onClose: () => void;
}

export default function AISettingsModal({ onClose }: AISettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    const existingKey = aiService.getApiKey();
    if (existingKey) {
      setHasExistingKey(true);
      setApiKey(existingKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      aiService.setApiKey(apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    }
  };

  const handleClear = () => {
    setApiKey('');
    aiService.setApiKey('');
    setHasExistingKey(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai_api_key');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl rounded-3xl w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Instellingen</h2>
              <p className="text-sm text-gray-300">Configureer je AI functies</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-gray-300" />
              <h3 className="font-semibold text-white">OpenAI API Key</h3>
            </div>
            <p className="text-sm text-gray-300">
              Voor geavanceerde AI functies (conversational assistant en verbeterde command parsing).
              Basis features werken zonder API key.
            </p>
            
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4 text-gray-300" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-300" />
                )}
              </button>
            </div>

            {hasExistingKey && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>API key is opgeslagen</span>
              </div>
            )}
          </div>

          {/* How to get API key */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Hoe krijg ik een API key?
            </h4>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Ga naar <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">platform.openai.com/api-keys</a></li>
              <li>Maak een account aan (of log in)</li>
              <li>Klik op "Create new secret key"</li>
              <li>Kopieer de key en plak deze hier</li>
            </ol>
          </div>

          {/* AI Features Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white">AI Functionaliteit</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm text-gray-200">Transaction Assistant</span>
                <span className="text-xs text-green-400">✓ Actief (offline mode)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm text-gray-200">Scam Detector</span>
                <span className="text-xs text-green-400">✓ Actief (basis)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm text-gray-200">Portfolio Advisor</span>
                <span className="text-xs text-green-400">✓ Actief</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm text-gray-200">Gas Optimizer</span>
                <span className="text-xs text-green-400">✓ Actief</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm text-gray-200">Conversational AI</span>
                <span className={`text-xs ${hasExistingKey ? 'text-green-400' : 'text-yellow-400'}`}>
                  {hasExistingKey ? '✓ Volledig actief' : '⚠ Basis mode (API key nodig)'}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <h4 className="text-sm font-medium text-white mb-2">🔒 Privacy</h4>
            <p className="text-xs text-gray-300">
              Je API key wordt alleen lokaal opgeslagen in je browser. 
              We versturen nooit je private keys of gevoelige wallet data naar AI services.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Sluiten
          </button>
          {apiKey && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            >
              Verwijder key
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Opgeslagen!
              </>
            ) : (
              'Opslaan'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

