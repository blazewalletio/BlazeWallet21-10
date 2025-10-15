'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { Zap, Clock, TrendingDown, Loader2, X } from 'lucide-react';

interface AIGasOptimizerProps {
  onClose: () => void;
  currentGasPrice: number;
}

export default function AIGasOptimizer({ onClose, currentGasPrice }: AIGasOptimizerProps) {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
    setLoading(true);
    try {
      const result = await aiService.predictOptimalGasTime(currentGasPrice);
      setPrediction(result);
    } catch (error) {
      console.error('Gas prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = () => {
    if (!prediction) return 'text-gray-600';
    switch (prediction.recommendation) {
      case 'now': return 'text-green-600';
      case 'wait_short': return 'text-yellow-600';
      case 'wait_long': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRecommendationBg = () => {
    if (!prediction) return 'bg-gray-50 border-gray-200';
    switch (prediction.recommendation) {
      case 'now': return 'bg-green-50 border-green-200';
      case 'wait_short': return 'bg-yellow-50 border-yellow-200';
      case 'wait_long': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = () => {
    if (!prediction) return <Zap className="w-8 h-8" />;
    switch (prediction.recommendation) {
      case 'now': return <Zap className="w-8 h-8" />;
      case 'wait_short': return <Clock className="w-8 h-8" />;
      case 'wait_long': return <TrendingDown className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
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
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-xl pointer-events-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gas Optimizer</h2>
                <p className="text-xs text-gray-600">Bespaar op transactiekosten</p>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              </div>
            ) : prediction ? (
              <>
                {/* Current Gas */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Huidige gas prijs</p>
                    <p className="text-4xl font-bold text-gray-900">{currentGasPrice.toFixed(0)}</p>
                    <p className="text-sm text-gray-600 mt-1">gwei</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`text-center p-6 rounded-xl border ${getRecommendationBg()}`}>
                  <div className={`flex justify-center mb-4 ${getRecommendationColor()}`}>
                    {getRecommendationIcon()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {prediction.recommendation === 'now' && 'Transactie nu!'}
                    {prediction.recommendation === 'wait_short' && 'Overweeg te wachten'}
                    {prediction.recommendation === 'wait_long' && 'Wacht voor beste prijs'}
                  </h3>
                  <p className="text-sm text-gray-700">{prediction.message}</p>
                </div>

                {/* Savings */}
                {prediction.estimatedSavings > 0 && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-700 font-medium">Potentiële besparing</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          ~{prediction.estimatedSavings.toFixed(0)} gwei
                        </p>
                        <p className="text-xs text-gray-600">per transactie</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optimal Time */}
                {prediction.optimalTime && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Optimale tijd</span>
                    </div>
                    <p className="text-lg text-blue-700 font-medium">{prediction.optimalTime}</p>
                  </div>
                )}

                {/* Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">💡 Gas besparingstips:</h4>
                  <div className="space-y-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p>• Vroege ochtend (2-6 uur) is meestal goedkoopst</p>
                    <p>• Weekenden hebben vaak lagere gas prijzen</p>
                    <p>• Vermijd transacties tijdens US trading uren</p>
                    <p>• Gebruik Layer 2 networks (Polygon, Arbitrum) voor lagere kosten</p>
                  </div>
                </div>

                {/* Historical Context */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Gas prijzen vandaag</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Laag</p>
                      <p className="text-lg font-bold text-green-600">
                        {Math.floor(currentGasPrice * 0.7)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Gemiddeld</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {Math.floor(currentGasPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Hoog</p>
                      <p className="text-lg font-bold text-red-600">
                        {Math.floor(currentGasPrice * 1.5)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Kon geen gas voorspelling laden</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex gap-2 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-colors"
            >
              Sluiten
            </button>
            <button
              onClick={loadPrediction}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium transition-all disabled:opacity-50"
            >
              Ververs
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
