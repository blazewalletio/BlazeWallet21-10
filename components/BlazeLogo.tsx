'use client';

import { motion } from 'framer-motion';

interface BlazeLogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function BlazeLogo({ size = 48, animate = true, className = '' }: BlazeLogoProps) {
  if (animate) {
    return (
      <motion.div 
        className={`inline-block ${className}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <defs>
            <linearGradient id="blazeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316">
                <animate
                  attributeName="stop-color"
                  values="#f97316; #ef4444; #f59e0b; #f97316"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#ef4444">
                <animate
                  attributeName="stop-color"
                  values="#ef4444; #f59e0b; #f97316; #ef4444"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#f59e0b">
                <animate
                  attributeName="stop-color"
                  values="#f59e0b; #f97316; #ef4444; #f59e0b"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
            
            {/* Glow effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Flame shape - iconic and bold */}
          <path
            d="M 50 10 
               C 35 25, 30 40, 30 55
               C 30 70, 38 82, 50 90
               C 62 82, 70 70, 70 55
               C 70 40, 65 25, 50 10 Z
               M 50 35
               C 45 42, 42 48, 42 55
               C 42 62, 45 68, 50 72
               C 55 68, 58 62, 58 55
               C 58 48, 55 42, 50 35 Z"
            fill="url(#blazeGradient)"
            stroke="url(#blazeGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />
        </motion.svg>
      </motion.div>
    );
  }

  // Static version
  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blazeGradientStatic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <path
          d="M 50 10 
             C 35 25, 30 40, 30 55
             C 30 70, 38 82, 50 90
             C 62 82, 70 70, 70 55
             C 70 40, 65 25, 50 10 Z
             M 50 35
             C 45 42, 42 48, 42 55
             C 42 62, 45 68, 50 72
             C 55 68, 58 62, 58 55
             C 58 48, 55 42, 50 35 Z"
          fill="url(#blazeGradientStatic)"
          stroke="url(#blazeGradientStatic)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}