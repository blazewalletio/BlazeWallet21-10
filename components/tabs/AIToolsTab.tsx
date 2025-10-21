'use client';

import { motion } from 'framer-motion';
import { 
  Bot, 
  Shield, 
  Brain, 
  Zap, 
  Sparkles,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';

const aiTools = [
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Natuurlijke taal transacties',
    icon: Sparkles,
    gradient: 'from-orange-500 to-red-500',
    status: 'active',
  },
  {
    id: 'scam-detector',
    title: 'Scam Detector',
    description: 'Real-time risico scanning',
    icon: Shield,
    gradient: 'from-blue-500 to-cyan-500',
    status: 'active',
  },
  {
    id: 'portfolio-advisor',
    title: 'Portfolio Advisor',
    description: 'Gepersonaliseerde tips',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
    status: 'coming-soon',
  },
  {
    id: 'gas-optimizer',
    title: 'Gas Optimizer',
    description: 'Bespaar op gas fees',
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    status: 'active',
  },
];

export default function AIToolsTab() {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Tools</h1>
                <p className="text-sm text-gray-500">Smart crypto assistance</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="glass-card p-3 rounded-xl hover:bg-gray-50"
            >
              <SettingsIcon className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* AI Tools Grid */}
        <div className="space-y-4">
          {aiTools.map((tool, index) => {
            const Icon = tool.icon;
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card card-hover relative overflow-hidden"
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center relative`}>
                      <Icon className="w-8 h-8 text-white" />
                      
                      {/* Status indicator */}
                      {tool.status === 'active' && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.7, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{tool.title}</h3>
                        {tool.status === 'coming-soon' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{tool.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {tool.status === 'active' ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        <span className="text-sm font-medium">Open</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        In development
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>

        {/* AI Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">AI-Powered Wallet</h3>
              <p className="text-sm text-gray-600">Smart features for safer crypto management</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Real-time protection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Smart optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Natural language</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-gray-600">Learning mode</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Threats blocked', value: '127', icon: Shield },
            { label: 'Fees saved', value: '$342', icon: Zap },
            { label: 'AI suggestions', value: '23', icon: Brain },
            { label: 'Accuracy rate', value: '94%', icon: Sparkles },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
