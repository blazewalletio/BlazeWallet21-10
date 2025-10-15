'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Shield, PieChart, Zap, MessageSquare, X, ArrowRight } from 'lucide-react';

interface AIBrainAssistantProps {
  onClose: () => void;
  onOpenFeature: (feature: 'assistant' | 'scanner' | 'advisor' | 'optimizer' | 'chat') => void;
  context?: any;
}

export default function AIBrainAssistant({ 
  onClose,
  onOpenFeature,
  context 
}: AIBrainAssistantProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'chat'>('overview');

  const aiFeatures = [
    {
      id: 'assistant' as const,
      icon: Sparkles,
      title: 'Transaction Assistant',
      description: 'Natuurlijke taal transacties',
      gradient: 'from-yellow-400 to-orange-500',
      tag: '🔥 Populair',
    },
    {
      id: 'scanner' as const,
      icon: Shield,
      title: 'Scam Detector',
      description: 'Real-time security scanning',
      gradient: 'from-blue-400 to-cyan-500',
      tag: '🛡️ Essentieel',
    },
    {
      id: 'advisor' as const,
      icon: PieChart,
      title: 'Portfolio Advisor',
      description: 'Gepersonaliseerde analyse',
      gradient: 'from-purple-400 to-pink-500',
      tag: '📊 Smart',
    },
    {
      id: 'optimizer' as const,
      icon: Zap,
      title: 'Gas Optimizer',
      description: 'Bespaar op transactiekosten',
      gradient: 'from-yellow-400 to-orange-500',
      tag: '💰 Bespaar',
    },
    {
      id: 'chat' as const,
      icon: MessageSquare,
      title: 'Crypto Expert',
      description: '24/7 AI support chat',
      gradient: 'from-cyan-400 to-blue-500',
      tag: '💬 Altijd bereikbaar',
    },
  ];

  const insights = [
    { icon: '💎', text: `Portfolio waarde: €${context?.totalValue?.toFixed(2) || '0.00'}` },
    { icon: '🪙', text: `${context?.tokens?.length || 0} tokens in je wallet` },
    { icon: '⚡', text: 'Gas prijzen momenteel gemiddeld' },
    { icon: '✅', text: 'Alle AI features actief' },
  ];

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
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-xl pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">AI Brain</h2>
                      <p className="text-sm text-gray-600">All-in-one AI command center</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Quick Insights */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
                    >
                      <div className="text-2xl mb-1">{insight.icon}</div>
                      <p className="text-xs text-gray-700 font-medium">{insight.text}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Welcome Message */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Welkom bij AI Brain 🧠</h3>
                  <p className="text-sm text-gray-700">
                    Je centrale AI command center. Alle AI functies samengevoegd in één krachtige interface.
                    Kies hieronder welke AI tool je wilt gebruiken, of gebruik de shortcuts voor snelle acties.
                  </p>
                </div>

                {/* AI Features Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Tools</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {aiFeatures.map((feature, i) => (
                      <motion.button
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onOpenFeature(feature.id);
                          onClose();
                        }}
                        className="group relative p-5 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 transition-all text-left overflow-hidden"
                      >
                        {/* Background gradient on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                              <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                              {feature.tag}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                          
                          <div className="flex items-center gap-1 text-sm text-indigo-600 font-medium group-hover:gap-2 transition-all">
                            <span>Open tool</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        onOpenFeature('assistant');
                        onClose();
                      }}
                      className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:border-yellow-300 transition-all text-left"
                    >
                      <div className="text-2xl mb-2">💬</div>
                      <div className="text-sm font-medium text-gray-900">Verstuur met AI</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        onOpenFeature('scanner');
                        onClose();
                      }}
                      className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-300 transition-all text-left"
                    >
                      <div className="text-2xl mb-2">🔍</div>
                      <div className="text-sm font-medium text-gray-900">Scan adres</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        onOpenFeature('advisor');
                        onClose();
                      }}
                      className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300 transition-all text-left"
                    >
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm font-medium text-gray-900">Check portfolio</div>
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <p className="text-sm text-gray-700">
                    💡 <strong>Pro tip:</strong> AI Brain combineert alle AI functies in één interface.
                    Perfect voor power users die snel willen schakelen tussen verschillende AI tools.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium transition-all"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

