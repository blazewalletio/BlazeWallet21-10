'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Key, CheckCircle, AlertCircle, Eye, EyeOff, X, Flame } from 'lucide-react';

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
    <AnimatePresence>
      {(
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card rounded-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 glass backdrop-blur-xl border-b border-white/10 px-6 py-4 rounded-t-2xl flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">AI Settings</h2>
                    <p className="text-xs text-gray-600">Configure your AI functions</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* API Key Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">OpenAI API Key</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    For advanced AI functions (conversational assistant and improved command parsing).
                    Basic features work without API key.
                  </p>
                  
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {hasExistingKey && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>API key is saved</span>
                    </div>
                  )}
                </div>

                {/* How to get API key */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    How do I get an API key?
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">platform.openai.com/api-keys</a></li>
                    <li>Create an account (or log in)</li>
                    <li>Click on "Create new secret key"</li>
                    <li>Copy the key and paste it here</li>
                  </ol>
                </div>

                {/* AI Features Status */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">AI Functionaliteit</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-sm text-gray-700">Transaction Assistant</span>
                      <span className="text-xs text-green-600 font-medium">✓ Actief (offline mode)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-sm text-gray-700">Scam Detector</span>
                      <span className="text-xs text-green-600 font-medium">✓ Actief (basis)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-sm text-gray-700">Portfolio Advisor</span>
                      <span className="text-xs text-green-600 font-medium">✓ Actief</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-sm text-gray-700">Gas Optimizer</span>
                      <span className="text-xs text-green-600 font-medium">✓ Actief</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-sm text-gray-700">Conversational AI</span>
                      <span className={`text-xs font-medium ${hasExistingKey ? 'text-green-600' : 'text-yellow-600'}`}>
                        {hasExistingKey ? '✓ Fully active' : '⚠ Basic mode (API key needed)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">🔒 Privacy</h4>
                  <p className="text-xs text-gray-700">
                    Your API key is only stored locally in your browser. 
                    We never send your private keys or sensitive wallet data to AI services.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex gap-2 sticky bottom-0 bg-white">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-colors"
                >
                  Close
                </button>
                {apiKey && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium transition-colors"
                  >
                    Remove key
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
