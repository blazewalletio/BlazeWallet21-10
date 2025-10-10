'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, ArrowLeft } from 'lucide-react';

export default function NFTMintDashboard() {
  const [selectedSkin, setSelectedSkin] = useState<number | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Mock NFT skins
  const skins = [
    {
      id: 0,
      name: 'Classic Blue',
      description: 'The original Blaze Wallet design with a modern twist',
      price: 0.01,
      rarity: 'Common',
      gradient: 'from-blue-500 to-cyan-500',
      minted: 1250,
      supply: 5000,
      benefits: ['Exclusive blue theme', 'Priority support', 'Early access to features'],
    },
    {
      id: 1,
      name: 'Fire Red',
      description: 'Burning with passion and energy',
      price: 0.02,
      rarity: 'Rare',
      gradient: 'from-red-500 to-orange-500',
      minted: 450,
      supply: 2000,
      benefits: ['Exclusive red theme', 'Premium support', 'Beta access', 'Custom animations'],
    },
    {
      id: 2,
      name: 'Royal Purple',
      description: 'Fit for royalty and luxury',
      price: 0.05,
      rarity: 'Epic',
      gradient: 'from-purple-500 to-pink-500',
      minted: 180,
      supply: 1000,
      benefits: ['Exclusive purple theme', 'VIP support', 'Alpha access', 'Custom sounds', 'Special effects'],
    },
    {
      id: 3,
      name: 'Golden Legend',
      description: 'The ultimate Blaze Wallet experience',
      price: 0.1,
      rarity: 'Legendary',
      gradient: 'from-yellow-400 to-orange-500',
      minted: 25,
      supply: 100,
      benefits: ['Exclusive gold theme', 'Personal manager', 'All features unlocked', 'Custom everything', 'Exclusive events'],
    },
  ];

  const handleMint = async () => {
    if (selectedSkin === null) return;
    
    setIsMinting(true);
    // Simulate minting process
    setTimeout(() => {
      setIsMinting(false);
      alert(`Successfully minted ${skins[selectedSkin].name} NFT!`);
      setSelectedSkin(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          NFT Collection
        </h2>
        <p className="text-gray-600">
          Mint exclusive Blaze Wallet NFT skins and unlock premium features
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-400 mb-1">NFT Benefits</h3>
            <p className="text-sm text-purple-300">
              Each NFT skin unlocks exclusive themes, features, and benefits. The rarer the skin, the more perks you get!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Palette className="w-5 h-5" />
            <span className="text-sm font-semibold">Total Minted</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">1,905</div>
          <div className="text-sm text-gray-600 mt-1">
            NFT skins
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold">Your NFTs</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">0</div>
          <div className="text-sm text-gray-600 mt-1">
            Currently owned
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold">Floor Price</span>
          </div>
          <div className="text-3xl font-bold text-green-400">0.01</div>
          <div className="text-sm text-gray-600 mt-1">
            ETH
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold">Total Volume</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">45.2</div>
          <div className="text-sm text-gray-600 mt-1">
            ETH
          </div>
        </motion.div>
      </div>

      {/* NFT Collection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skins.map((skin, index) => {
          const isSelected = selectedSkin === index;
          
          return (
            <motion.div
              key={skin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedSkin(index)}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Rarity Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                skin.rarity === 'Legendary' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                skin.rarity === 'Epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                skin.rarity === 'Rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                'bg-gradient-to-r from-slate-500 to-slate-600'
              }`}>
                {skin.rarity}
              </div>

              {/* Preview */}
              <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${skin.gradient} mb-4 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white/80" />
                  </div>
                  <div className="text-white font-bold text-lg">{skin.name}</div>
                </div>
              </div>

              {/* Info */}
              <div>
                <h3 className="text-xl font-bold mb-1">{skin.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{skin.description}</p>

                {/* Benefits */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-semibold">Benefits:</h4>
                  {skin.benefits.map((benefit, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <div className="w-1 h-1 bg-purple-400 rounded-full" />
                      {benefit}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-bold">{skin.price} ETH</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Minted:</span>
                    <span className="font-semibold">{skin.minted}/{skin.supply}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full bg-gradient-to-r ${skin.gradient}`}
                      style={{ width: `${(skin.minted / skin.supply) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mint Button */}
      {selectedSkin !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">{skins[selectedSkin].name}</h3>
              <p className="text-sm text-gray-600">Ready to mint</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{skins[selectedSkin].price} ETH</div>
              <div className="text-sm text-gray-600">
                ≈ ${(skins[selectedSkin].price * 1700).toFixed(0)}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isMinting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Mint NFT
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
