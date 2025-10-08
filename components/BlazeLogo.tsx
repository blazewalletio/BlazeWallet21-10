'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface BlazeLogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
  variant?: 'full' | 'icon' | 'text';
}

export default function BlazeLogo({ 
  size = 48, 
  animate = true, 
  className = '',
  variant = 'full'
}: BlazeLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={`inline-block ${className}`}>
        <motion.div
          initial={animate ? { scale: 0, rotate: -180 } : undefined}
          animate={animate ? { scale: 1, rotate: 0 } : undefined}
          transition={animate ? { duration: 0.6, type: "spring", bounce: 0.3 } : undefined}
          className="relative"
          style={{ width: size, height: size }}
        >
          <Image
            src="/blaze-logo.png"
            alt="Blaze Logo"
            width={size}
            height={size}
            className="rounded-lg"
            priority
          />
        </motion.div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <BlazeLogo size={size * 0.6} animate={animate} variant="icon" />
        <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Blaze
        </span>
      </div>
    );
  }

  // Full logo (icon + text)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <BlazeLogo size={size * 0.6} animate={animate} variant="icon" />
      <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Blaze
      </span>
    </div>
  );
}

// Simple static version for small icons
export function BlazeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`inline-block ${className}`}>
      <Image
        src="/blaze-logo.png"
        alt="Blaze Logo"
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
    </div>
  );
}
