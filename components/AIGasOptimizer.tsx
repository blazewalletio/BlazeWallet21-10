'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { Zap, Clock, TrendingDown, Loader2 } from 'lucide-react';

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
    if (!prediction) return 'text-gray-400';
    switch (prediction.recommendation) {
      case 'now': return 'text-green-400';
      case 'wait_short': return 'text-yellow-400';
      case 'wait_long': return 'text-orange-400';
      default: return 'text-gray-400';
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
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Gas optimizer</h2>
              <p className="text-sm text-gray-300">Bespaar op transactiekosten met AI</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            </div>
          ) : prediction ? (
            <>
              {/* Current Gas */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-2">Huidige gas prijs</p>
                  <p className="text-4xl font-bold text-white">{currentGasPrice.toFixed(0)}</p>
                  <p className="text-sm text-gray-400 mt-1">gwei</p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
                <div className={`flex justify-center mb-4 ${getRecommendationColor()}`}>
                  {getRecommendationIcon()}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {prediction.recommendation === 'now' && 'Transactie nu!'}
                  {prediction.recommendation === 'wait_short' && 'Overweeg te wachten'}
                  {prediction.recommendation === 'wait_long' && 'Wacht voor beste prijs'}
                </h3>
                <p className="text-sm text-gray-300">{prediction.message}</p>
              </div>

              {/* Savings */}
              {prediction.estimatedSavings > 0 && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-200">Potentiële besparing</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">
                        ~{prediction.estimatedSavings.toFixed(0)} gwei
                      </p>
                      <p className="text-xs text-gray-400">per transactie</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimal Time */}
              {prediction.optimalTime && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">Optimale tijd</span>
                  </div>
                  <p className="text-lg text-blue-300">{prediction.optimalTime}</p>
                </div>
              )}

              {/* Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">💡 Gas besparingstips:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Vroege ochtend (2-6 uur) is meestal goedkoopst</p>
                  <p>• Weekenden hebben vaak lagere gas prijzen</p>
                  <p>• Vermijd transacties tijdens US trading uren</p>
                  <p>• Gebruik Layer 2 networks (Polygon, Arbitrum) voor lagere kosten</p>
                </div>
              </div>

              {/* Historical Context */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Gas prijzen vandaag</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Laag</p>
                    <p className="text-lg font-bold text-green-400">
                      {Math.floor(currentGasPrice * 0.7)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Gemiddeld</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {Math.floor(currentGasPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Hoog</p>
                    <p className="text-lg font-bold text-red-400">
                      {Math.floor(currentGasPrice * 1.5)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-300">Kon geen gas voorspelling laden</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Sluiten
          </button>
          <button
            onClick={loadPrediction}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white transition-all disabled:opacity-50"
          >
            Ververs
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

