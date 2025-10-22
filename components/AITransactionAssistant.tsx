'use client';

import { useState } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, AlertCircle, CheckCircle, X, Flame } from 'lucide-react';

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
              <div className="sticky top-0 glass backdrop-blur-xl border-b border-white/10 px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
                    <p className="text-xs text-gray-600">Natural language transactions</p>
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
              <div className="p-6 space-y-4">
                {/* Examples */}
                {!response && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">Probeer bijvoorbeeld:</p>
                    <div className="space-y-2">
                      {examples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(example)}
                          className="w-full text-left px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 border border-gray-200 transition-colors"
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
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !input.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
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
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {response.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-3">
                          <p className="text-sm text-gray-900">{response.message}</p>
                          
                          {response.confidence && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>Zekerheid:</span>
                              <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-400 to-green-500 transition-all duration-300"
                                  style={{ width: `${response.confidence * 100}%` }}
                                />
                              </div>
                              <span className="font-medium">{(response.confidence * 100).toFixed(0)}%</span>
                            </div>
                          )}

                          {response.success && response.action && response.action.type !== 'none' && (
                            <button
                              onClick={handleExecute}
                              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium hover:from-orange-600 hover:to-yellow-600 transition-all"
                            >
                              Execute
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
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-colors"
                >
                  Close
                </button>
                {response && (
                  <button
                    onClick={() => {
                      setResponse(null);
                      setInput('');
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-colors"
                  >
                    New command
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
