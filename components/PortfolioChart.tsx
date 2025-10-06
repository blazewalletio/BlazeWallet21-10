'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPortfolioHistory } from '@/lib/portfolio-history';

interface PortfolioChartProps {
  currentValue: number;
  address: string;
  timeframe?: '1D' | '1W' | '1M' | '1Y' | 'ALL';
}

export default function PortfolioChart({ currentValue, address, timeframe = '1D' }: PortfolioChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>(timeframe);
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    // Haal echte portfolio history data op van server
    const loadData = async () => {
      const history = getPortfolioHistory(address);
      const data = await history.getDataForTimeframe(selectedTimeframe, currentValue);
      setChartData(data);
    };
    
    loadData();
  }, [selectedTimeframe, currentValue, address]);

  const maxValue = chartData.length > 0 ? Math.max(...chartData) : currentValue;
  const minValue = chartData.length > 0 ? Math.min(...chartData) : currentValue;

  const timeframes: Array<'1D' | '1W' | '1M' | '1Y' | 'ALL'> = ['1D', '1W', '1M', '1Y', 'ALL'];

  return (
    <div className="glass-card">
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Portfolio</h3>
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <motion.button
              key={tf}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                selectedTimeframe === tf
                  ? 'bg-primary-500 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {tf}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 flex items-end gap-1">
        {chartData.map((value, index) => {
          const height = ((value - minValue) / (maxValue - minValue)) * 100;
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.02, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t cursor-pointer hover:opacity-80 transition-opacity"
              title={`$${value.toFixed(2)}`}
            />
          );
        })}
      </div>
    </div>
  );
}
