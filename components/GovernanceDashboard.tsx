'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Plus, TrendingUp, TrendingDown, Clock, ArrowLeft } from 'lucide-react';

export default function GovernanceDashboard() {
  const [activeTab, setActiveTab] = useState<'vote' | 'create'>('vote');
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });

  // Mock proposals
  const proposals = [
    {
      id: 1,
      title: 'Reduce swap fees from 0.5% to 0.3%',
      description: 'To stay competitive and attract more users, we propose reducing swap fees.',
      votesFor: 125000,
      votesAgainst: 45000,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'active' as const,
      hasVoted: false,
    },
    {
      id: 2,
      title: 'Add Avalanche chain support',
      description: 'Integrate Avalanche C-Chain to expand our multi-chain ecosystem.',
      votesFor: 89000,
      votesAgainst: 12000,
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'active' as const,
      hasVoted: true,
    },
    {
      id: 3,
      title: 'Increase staking rewards by 5%',
      description: 'Boost APY across all staking tiers to incentivize long-term holding.',
      votesFor: 156000,
      votesAgainst: 23000,
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'passed' as const,
      hasVoted: true,
    },
  ];

  const handleVote = (proposalId: number, vote: 'for' | 'against') => {
    alert(`Voted ${vote} on proposal ${proposalId}`);
  };

  const handleCreateProposal = () => {
    if (!newProposal.title || !newProposal.description) {
      alert('Please fill in all fields');
      return;
    }
    alert('Proposal created! It will be active in 24 hours.');
    setNewProposal({ title: '', description: '' });
    setActiveTab('vote');
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Vote className="w-6 h-6 text-purple-400" />
          Governance
        </h2>
        <p className="text-gray-600">
          Vote on proposals and shape the future of BLAZE ecosystem
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Vote className="w-5 h-5" />
            <span className="text-sm font-semibold">Voting Power</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">1,250</div>
          <div className="text-sm text-gray-600 mt-1">
            BLAZE tokens
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">Active Proposals</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">2</div>
          <div className="text-sm text-gray-600 mt-1">
            Currently voting
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">Votes Cast</span>
          </div>
          <div className="text-3xl font-bold text-green-400">8</div>
          <div className="text-sm text-gray-600 mt-1">
            Total participation
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-semibold">Proposals Passed</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">5</div>
          <div className="text-sm text-gray-600 mt-1">
            Successfully implemented
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('vote')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'vote'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vote on Proposals
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'create'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create Proposal
        </button>
      </div>

      {/* Vote Tab */}
      {activeTab === 'vote' && (
        <div className="space-y-6">
          {proposals.map((proposal) => {
            const totalVotes = proposal.votesFor + proposal.votesAgainst;
            const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
            const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
            
            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{proposal.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        proposal.status === 'active'
                          ? 'bg-blue-500/20 text-blue-400'
                          : proposal.status === 'passed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {proposal.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{proposal.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeRemaining(proposal.endTime)}
                      </div>
                      <div>
                        {proposal.hasVoted ? '✓ Voted' : 'Not voted'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vote Results */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Votes For</span>
                    <span className="text-sm font-bold text-green-400">
                      {proposal.votesFor.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Votes Against</span>
                    <span className="text-sm font-bold text-red-400">
                      {proposal.votesAgainst.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${againstPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Vote Buttons */}
                {proposal.status === 'active' && !proposal.hasVoted && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleVote(proposal.id, 'for')}
                      className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Vote For
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'against')}
                      className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <TrendingDown className="w-4 h-4" />
                      Vote Against
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="glass-card p-6">
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-blue-300">
                💡 Create proposals to improve the BLAZE ecosystem. Proposals require 10,000 BLAZE tokens to submit and will be active for 7 days.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Proposal Title</label>
              <input
                type="text"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                placeholder="e.g., Add support for new blockchain"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Description</label>
              <textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                placeholder="Describe your proposal in detail..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleCreateProposal}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Proposal (10,000 BLAZE)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
