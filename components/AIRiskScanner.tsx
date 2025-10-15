'use client';

import { useState } from 'react';
import { aiService } from '@/lib/ai-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AIRiskScannerProps {
  onClose: () => void;
  initialAddress?: string;
}

export default function AIRiskScanner({ onClose, initialAddress = '' }: AIRiskScannerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [type, setType] = useState<'contract' | 'wallet'>('contract');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!address.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const analysis = await aiService.analyzeRisk(address, type);
      setResult(analysis);
    } catch (error) {
      setResult({
        risk: 'critical',
        warnings: ['Kon scan niet voltooien'],
        score: 0,
        details: 'Er ging iets fout tijdens de scan.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-8 h-8" />;
      case 'medium': return <AlertTriangle className="w-8 h-8" />;
      case 'high': return <AlertTriangle className="w-8 h-8" />;
      case 'critical': return <XCircle className="w-8 h-8" />;
      default: return <Shield className="w-8 h-8" />;
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Scam detector</h2>
              <p className="text-sm text-gray-300">Scan adressen en contracts voor risico's</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setType('contract')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                type === 'contract'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Smart contract
            </button>
            <button
              onClick={() => setType('wallet')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                type === 'wallet'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Wallet adres
            </button>
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              placeholder="0x... adres om te scannen"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled={loading}
            />
            <button
              onClick={handleScan}
              disabled={loading || !address.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Risk Level */}
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className={`flex justify-center mb-3 ${getRiskColor(result.risk)}`}>
                    {getRiskIcon(result.risk)}
                  </div>
                  <h3 className={`text-2xl font-bold uppercase ${getRiskColor(result.risk)}`}>
                    {result.risk === 'low' && 'Laag risico'}
                    {result.risk === 'medium' && 'Gemiddeld risico'}
                    {result.risk === 'high' && 'Hoog risico'}
                    {result.risk === 'critical' && 'Kritiek risico'}
                  </h3>
                  <p className="text-sm text-gray-300 mt-2">{result.details}</p>
                </div>

                {/* Score */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Veiligheids score</span>
                    <span className="text-lg font-bold text-white">{result.score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.score >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        result.score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                        result.score >= 30 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                        'bg-gradient-to-r from-red-500 to-red-700'
                      }`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Bevindingen:</h4>
                    {result.warnings.map((warning: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <span className="text-sm text-gray-200">{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          {!result && !loading && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-gray-200">
                💡 <strong>Tip:</strong> Scan altijd nieuwe contracts voordat je ermee interacteert.
                Deze tool controleert op bekende scam patronen en rode vlaggen.
              </p>
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
          {result && (
            <button
              onClick={() => {
                setResult(null);
                setAddress('');
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Nieuwe scan
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

