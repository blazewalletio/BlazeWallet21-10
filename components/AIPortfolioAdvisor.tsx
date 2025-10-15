'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { TrendingUp, Lightbulb, PieChart, AlertCircle, X } from 'lucide-react';

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
    if (analysis.riskScore < 40) return 'text-green-600';
    if (analysis.riskScore < 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getRiskBg = () => {
    if (analysis.riskScore < 40) return 'bg-green-50 border-green-200';
    if (analysis.riskScore < 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-xl pointer-events-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Portfolio Advisor</h2>
                <p className="text-xs text-gray-600">Gepersonaliseerde analyse en tips</p>
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
            {/* Portfolio Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Totale waarde</div>
                <div className="text-2xl font-bold text-gray-900">€{totalValue.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Assets</div>
                <div className="text-2xl font-bold text-gray-900">{tokens.length} tokens</div>
              </div>
            </div>

            {/* Risk Score */}
            <div className={`p-4 rounded-xl border ${getRiskBg()}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 font-medium">Risico profiel</span>
                <span className={`text-lg font-bold ${getRiskColor()}`}>
                  {getRiskLabel()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/50 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    analysis.riskScore < 40 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    analysis.riskScore < 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}
                  style={{ width: `${analysis.riskScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Score: {analysis.riskScore}/100
              </p>
            </div>

            {/* Insights */}
            {analysis.insights.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
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
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200"
                    >
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
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
                      className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200"
                    >
                      <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Holdings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Top holdings</h3>
              <div className="space-y-2">
                {tokens.slice(0, 5).map((token: any, i: number) => {
                  const percentage = (parseFloat(token.usdValue) / totalValue) * 100;
                  return (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{token.symbol}</span>
                        <span className="text-sm text-gray-600">
                          €{parseFloat(token.usdValue).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-12 text-right font-medium">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <p className="text-xs text-gray-700">
                ⚠️ <strong>Disclaimer:</strong> Dit is geen financieel advies. 
                Doe altijd je eigen onderzoek voordat je investeringsbeslissingen maakt.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all"
            >
              Sluiten
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
