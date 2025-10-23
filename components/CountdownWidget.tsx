'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Rocket, Users, Sparkles } from 'lucide-react';

interface CountdownWidgetProps {
  targetDate: Date;
  title: string;
  subtitle?: string;
  onComplete?: () => void;
  variant?: 'compact' | 'full';
  showStats?: boolean;
  totalRegistered?: number;
}

export default function CountdownWidget({
  targetDate,
  title,
  subtitle,
  onComplete,
  variant = 'compact',
  showStats = false,
  totalRegistered = 0,
}: CountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsComplete(true);
        if (onComplete && !isComplete) {
          onComplete();
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete, isComplete]);

  if (isComplete && variant === 'compact') {
    return null;
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <div>
              <div className="font-semibold">{title}</div>
              {subtitle && <div className="text-xs opacity-90 mt-0.5">{subtitle}</div>}
            </div>
          </div>
          <div className="flex gap-2 font-mono font-bold">
            {timeLeft.days > 0 && (
              <div className="text-center">
                <div className="text-2xl">{timeLeft.days}</div>
                <div className="text-xs opacity-75">days</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs opacity-75">hrs</div>
            </div>
            <div className="text-2xl">:</div>
            <div className="text-center">
              <div className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs opacity-75">min</div>
            </div>
            <div className="text-2xl">:</div>
            <div className="text-center">
              <div className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs opacity-75">sec</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 border border-orange-200 rounded-2xl p-8"
    >
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Rocket className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{title}</h3>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {/* Countdown */}
        {!isComplete ? (
          <div className="flex justify-center gap-4">
            {timeLeft.days > 0 && (
              <motion.div
                key="days"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl p-4 min-w-[80px] shadow-sm"
              >
                <div className="text-4xl font-bold text-orange-600">{timeLeft.days}</div>
                <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Days</div>
              </motion.div>
            )}
            <motion.div
              key="hours"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="bg-white rounded-xl p-4 min-w-[80px] shadow-sm"
            >
              <div className="text-4xl font-bold text-orange-600">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Hours</div>
            </motion.div>
            <motion.div
              key="minutes"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="bg-white rounded-xl p-4 min-w-[80px] shadow-sm"
            >
              <div className="text-4xl font-bold text-orange-600">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Minutes</div>
            </motion.div>
            <motion.div
              key="seconds"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="bg-white rounded-xl p-4 min-w-[80px] shadow-sm"
            >
              <div className="text-4xl font-bold text-orange-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Seconds</div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-green-600"
          >
            🎉 It's live!
          </motion.div>
        )}

        {/* Stats */}
        {showStats && totalRegistered > 0 && (
          <div className="flex justify-center gap-6 pt-6 border-t border-orange-200">
            <div className="text-center">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Registered</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalRegistered}</div>
            </div>
            {totalRegistered < 500 && (
              <div className="text-center">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Early Bird Spots</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{500 - totalRegistered}</div>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar (Early Bird) */}
        {showStats && totalRegistered > 0 && totalRegistered < 500 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Early Bird Progress</span>
              <span className="font-semibold">{Math.round((totalRegistered / 500) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(totalRegistered / 500) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
            <div className="text-xs text-center text-gray-600">
              {500 - totalRegistered} spots left for Early Bird bonus!
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

