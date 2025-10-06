'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useThemeStore, THEMES } from '@/lib/theme-store';

export default function ThemeSelector() {
  const { currentTheme, setTheme } = useThemeStore();

  const handleThemeClick = (themeId: string) => {
    console.log('🎨 Theme clicked:', themeId);
    console.log('📦 Current theme before:', currentTheme);
    setTheme(themeId);
    console.log('✅ setTheme called');
    console.log('📦 Current theme after:', useThemeStore.getState().currentTheme);
  };

  console.log('🔍 ThemeSelector render - current theme:', currentTheme);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Wallet thema</h3>
        <p className="text-sm text-slate-400 mb-4">
          Kies je favoriete kleurenthema voor de wallet
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.values(THEMES).map((theme) => {
          const isActive = currentTheme === theme.id;
          
          return (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isActive 
                  ? 'border-white bg-slate-800/80 scale-105' 
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient preview */}
              <div 
                className="w-full h-12 rounded-lg mb-3"
                style={{ 
                  background: theme.gradient,
                  boxShadow: isActive ? '0 0 20px rgba(255,255,255,0.3)' : 'none'
                }}
              />

              {/* Theme name */}
              <div className="text-left">
                <div className="font-semibold text-sm flex items-center justify-between">
                  <span>{theme.name}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-white rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-slate-900" />
                    </motion.div>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {theme.description}
                </div>
              </div>

              {/* Glow effect for active theme */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{
                    background: theme.gradient,
                    filter: 'blur(20px)',
                    opacity: 0.3,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
        <div className="text-sm text-slate-300">
          💡 <span className="font-semibold">Tip:</span> Het thema wordt toegepast op alle onderdelen van de wallet!
        </div>
      </div>
    </div>
  );
}
