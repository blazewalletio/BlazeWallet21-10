'use client';

import { motion } from 'framer-motion';
import { 
  Home, 
  Bot, 
  Flame, 
  History, 
  Settings
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Home,
  },
  {
    id: 'ai-tools',
    label: 'AI Tools',
    icon: Bot,
  },
  {
    id: 'blaze',
    label: 'Blaze',
    icon: Flame,
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 safe-area-pb">
      <div className="max-w-4xl mx-auto px-1">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-3 px-2 relative"
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Icon */}
                <div className={`relative z-10 transition-all duration-200 ${
                  isActive 
                    ? 'text-orange-500 scale-110' 
                    : 'text-gray-500 scale-100'
                }`}>
                  <Icon className={`w-6 h-6 transition-all duration-200 ${
                    isActive ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  
                  {/* Special effect for Blaze tab */}
                  {item.id === 'blaze' && isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-medium mt-1 transition-all duration-200 relative z-10 ${
                  isActive 
                    ? 'text-orange-500' 
                    : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                
                {/* Ripple effect on active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
    </div>
  );
}

export { navigationItems };
