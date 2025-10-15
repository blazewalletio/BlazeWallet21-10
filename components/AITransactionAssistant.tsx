'use client';

import { useState } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AITransactionAssistantProps {
  onClose: () => void;
  context: {
    balance: string;
    tokens: any[];
    address: string;
    chain: string;
  };
  onExecuteAction?: (action: any) => void;
}

export default function AITransactionAssistant({ 
  onClose, 
  context,
  onExecuteAction 
}: AITransactionAssistantProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const examples = [
    "Stuur 50 USDC naar 0x...",
    "Swap 1 ETH naar USDC",
    "Wat is mijn grootste holding?",
    "Swap al mijn USDT naar ETH",
  ];

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const result = await aiService.processTransactionCommand(input, context);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        message: 'Er ging iets fout. Probeer het opnieuw.',
        confidence: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = () => {
    if (response?.action && onExecuteAction) {
      onExecuteAction(response.action);
      onClose();
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Transactie assistent</h2>
              <p className="text-sm text-gray-300">Spreek natuurlijk, ik begrijp je</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Examples */}
          {!response && (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Probeer bijvoorbeeld:</p>
              <div className="space-y-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="w-full text-left px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-200 transition-colors"
                  >
                    💬 {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Typ je commando..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Response */}
          <AnimatePresence mode="wait">
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-xl border ${
                  response.success
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {response.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-white">{response.message}</p>
                    
                    {response.confidence && (
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span>Zekerheid:</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-300"
                            style={{ width: `${response.confidence * 100}%` }}
                          />
                        </div>
                        <span>{(response.confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}

                    {response.success && response.action && response.action.type !== 'none' && (
                      <button
                        onClick={handleExecute}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:scale-105 transition-transform"
                      >
                        Voer uit
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Sluiten
          </button>
          {response && (
            <button
              onClick={() => {
                setResponse(null);
                setInput('');
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
            >
              Nieuw commando
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

