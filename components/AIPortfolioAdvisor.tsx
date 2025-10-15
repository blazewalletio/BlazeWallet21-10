'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { TrendingUp, Lightbulb, PieChart, AlertCircle } from 'lucide-react';

interface AIPortfolioAdvisorProps {
  onClose: () => void;
  tokens: any[];
  totalValue: number;
}

export default function AIPortfolioAdvisor({ onClose, tokens, totalValue }: AIPortfolioAdvisorProps) {
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const result = aiService.analyzePortfolio(tokens, totalValue);
    setAnalysis(result);
  }, [tokens, totalValue]);

  if (!analysis) return null;

  const getRiskColor = () => {
    if (analysis.riskScore < 40) return 'text-green-400';
    if (analysis.riskScore < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLabel = () => {
    if (analysis.riskScore < 40) return 'Laag risico';
    if (analysis.riskScore < 70) return 'Gemiddeld risico';
    return 'Hoog risico';
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
        className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl rounded-3xl w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 sticky top-0 bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Portfolio advisor</h2>
              <p className="text-sm text-gray-300">Gepersonaliseerde analyse en tips</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Portfolio Summary */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Totale waarde</span>
              <span className="text-2xl font-bold text-white">€{totalValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Assets</span>
              <span className="text-lg font-semibold text-white">{tokens.length} tokens</span>
            </div>
          </div>

          {/* Risk Score */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Risico profiel</span>
              <span className={`text-lg font-bold ${getRiskColor()}`}>
                {getRiskLabel()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  analysis.riskScore < 40 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  analysis.riskScore < 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                  'bg-gradient-to-r from-orange-400 to-red-500'
                }`}
                style={{ width: `${analysis.riskScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Score: {analysis.riskScore}/100
            </p>
          </div>

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Inzichten</h3>
              </div>
              <div className="space-y-2">
                {analysis.insights.map((insight: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30"
                  >
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-200">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-semibold">Aanbevelingen</h3>
              </div>
              <div className="space-y-2">
                {analysis.recommendations.map((rec: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30"
                  >
                    <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-200">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Top Holdings */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Top holdings</h3>
            <div className="space-y-2">
              {tokens.slice(0, 5).map((token: any, i: number) => {
                const percentage = (parseFloat(token.usdValue) / totalValue) * 100;
                return (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{token.symbol}</span>
                      <span className="text-sm text-gray-300">
                        €{parseFloat(token.usdValue).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-xs text-gray-300">
              ⚠️ <strong>Disclaimer:</strong> Dit is geen financieel advies. 
              Doe altijd je eigen onderzoek voordat je investeringsbeslissingen maakt.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 sticky bottom-0 bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all"
          >
            Sluiten
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

