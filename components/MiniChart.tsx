'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPortfolioHistory } from '@/lib/portfolio-history';

interface MiniChartProps {
  currentValue: number;
  address: string;
}

export default function MiniChart({ currentValue, address }: MiniChartProps) {
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;
      const history = getPortfolioHistory(address);
      const data = await history.getDataForTimeframe('1D', currentValue);
      setChartData(data);
    };
    
    loadData();
  }, [currentValue, address]);

  if (chartData.length === 0) return null;

  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue || 1;
  const isPositive = chartData[chartData.length - 1] >= chartData[0];

  // Generate smooth SVG path
  const generatePath = () => {
    const width = 100;
    const height = 100;
    const padding = 10;
    
    const points = chartData.map((value, index) => {
      const x = (index / (chartData.length - 1)) * width;
      const y = height - ((value - minValue) / range) * (height - padding * 2) - padding;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;
      
      path += ` Q ${controlX} ${current.y}, ${controlX} ${controlY}`;
      path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    
    return path;
  };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="miniGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            style={{
              stopColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
              stopOpacity: 0.2,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
              stopOpacity: 0,
            }}
          />
        </linearGradient>
      </defs>

      {/* Area Fill */}
      <motion.path
        d={`${generatePath()} L 100 100 L 0 100 Z`}
        fill="url(#miniGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Line */}
      <motion.path
        d={generatePath()}
        fill="none"
        stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
    </svg>
  );
}
