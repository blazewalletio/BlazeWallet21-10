'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showText?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Laden...', 
  showText = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative">
        {/* Subtle glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-primary rounded-full blur-sm"
        />
        
        {/* Rotating logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`relative ${sizeClasses[size]} bg-gradient-primary rounded-full flex items-center justify-center shadow-lg`}
        >
          <Image
            src="/blaze-logo-official.png"
            alt="Blaze"
            width={size === 'lg' ? 32 : size === 'md' ? 24 : 16}
            height={size === 'lg' ? 32 : size === 'md' ? 24 : 16}
            className="object-contain"
          />
        </motion.div>
      </div>
      
      {showText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-slate-400 ${textSizeClasses[size]} font-medium`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}