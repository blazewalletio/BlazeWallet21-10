'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPortfolioHistory } from '@/lib/portfolio-history';

interface PortfolioChartProps {
  currentValue: number;
  address: string;
  timeframe?: '1D' | '1W' | '1M' | '1Y' | 'ALL';
}

export default function PortfolioChart({ currentValue, address, timeframe = '1D' }: PortfolioChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>(timeframe);
  const [chartData, setChartData] = useState<number[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; value: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const history = getPortfolioHistory(address);
      const data = await history.getDataForTimeframe(selectedTimeframe, currentValue);
      setChartData(data);
    };
    
    loadData();
  }, [selectedTimeframe, currentValue, address]);

  const maxValue = chartData.length > 0 ? Math.max(...chartData) : currentValue;
  const minValue = chartData.length > 0 ? Math.min(...chartData) : currentValue;
  const range = maxValue - minValue || 1;

  const timeframes: Array<'1D' | '1W' | '1M' | '1Y' | 'ALL'> = ['1D', '1W', '1M', '1Y', 'ALL'];

  // Generate smooth SVG path
  const generatePath = () => {
    if (chartData.length === 0) return '';
    
    const width = 100;
    const height = 100;
    const padding = 5;
    
    const points = chartData.map((value, index) => {
      const x = (index / (chartData.length - 1)) * width;
      const y = height - ((value - minValue) / range) * (height - padding * 2) - padding;
      return { x, y };
    });

    // Create smooth curve using quadratic bezier curves
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

  // Generate area path (same as line but closed at bottom)
  const generateAreaPath = () => {
    const linePath = generatePath();
    if (!linePath) return '';
    return `${linePath} L 100 100 L 0 100 Z`;
  };

  const isPositive = chartData.length > 1 && chartData[chartData.length - 1] >= chartData[0];

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
      <div className="relative h-48">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
          onMouseMove={(e) => {
            if (!svgRef.current || chartData.length === 0) return;
            const rect = svgRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const index = Math.round((x / 100) * (chartData.length - 1));
            const clampedIndex = Math.max(0, Math.min(chartData.length - 1, index));
            
            setHoveredPoint({
              index: clampedIndex,
              value: chartData[clampedIndex],
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{
                  stopColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                  stopOpacity: 0.3,
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
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area Fill */}
          <motion.path
            d={generateAreaPath()}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={generatePath()}
            fill="none"
            stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Data Points */}
          {chartData.map((value, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((value - minValue) / range) * 95 - 2.5;
            const isHovered = hoveredPoint?.index === index;
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r={isHovered ? 1.5 : 0.8}
                fill={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isHovered ? 1 : 0.6 }}
                transition={{ delay: index * 0.01, duration: 0.3 }}
                filter={isHovered ? 'url(#glow)' : undefined}
                className="cursor-pointer transition-all"
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute pointer-events-none z-10"
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y - 50,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="glass-card px-3 py-2 rounded-lg border border-white/20 backdrop-blur-xl">
                <div className="text-xs text-white/60 mb-1">Portfolio Value</div>
                <div className="text-lg font-bold text-white">
                  ${hoveredPoint.value.toFixed(2)}
                </div>
              </div>
              {/* Arrow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-white/10 backdrop-blur-xl rotate-45 border-r border-b border-white/20"
                style={{ bottom: -4 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
