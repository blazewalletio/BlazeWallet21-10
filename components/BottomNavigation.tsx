'use client';

import { motion } from 'framer-motion';
import { 
  Home, 
  Bot, 
  Flame, 
  History, 
  Settings 
} from 'lucide-react';

export type TabType = 'wallet' | 'ai' | 'blaze' | 'history' | 'settings';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  {
    id: 'wallet' as TabType,
    label: 'Wallet',
    icon: Home,
    color: 'text-gray-600',
    activeColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'ai' as TabType,
    label: 'AI Tools',
    icon: Bot,
    color: 'text-gray-600',
    activeColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'blaze' as TabType,
    label: 'Blaze',
    icon: Flame,
    color: 'text-gray-600',
    activeColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'history' as TabType,
    label: 'History',
    icon: History,
    color: 'text-gray-600',
    activeColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'settings' as TabType,
    label: 'Settings',
    icon: Settings,
    color: 'text-gray-600',
    activeColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
  },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center flex-1 py-2 relative"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 mx-2 rounded-xl ${tab.bgColor}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? 5 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? tab.activeColor : tab.color
                    }`} 
                  />
                </motion.div>
                
                {/* Label */}
                <motion.span
                  className={`text-xs font-medium mt-0.5 transition-colors duration-200 relative z-10 ${
                    isActive ? tab.activeColor : tab.color
                  }`}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {tab.label}
                </motion.span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className={`absolute top-1 w-1 h-1 rounded-full ${tab.activeColor.replace('text-', 'bg-')}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Home indicator for iOS */}
      <div className="h-1 bg-gray-300 rounded-full mx-2 mb-1 max-w-12 mx-auto" />
    </div>
  );
}
