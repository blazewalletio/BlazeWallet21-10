'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavigation, { navigationItems } from './BottomNavigation';

// Import tab components
import WalletTab from './tabs/WalletTab';
import AIToolsTab from './tabs/AIToolsTab';
import BlazeTab from './tabs/BlazeTab';
import HistoryTab from './tabs/HistoryTab';
import SettingsTab from './tabs/SettingsTab';

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('wallet');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletTab />;
      case 'ai-tools':
        return <AIToolsTab />;
      case 'blaze':
        return <BlazeTab />;
      case 'history':
        return <HistoryTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <WalletTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[calc(100vh-80px)]"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
