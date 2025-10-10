'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Vote, Plus, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface GovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  endTime: Date;
  status: 'active' | 'passed' | 'rejected';
  hasVoted: boolean;
}

export default function GovernanceModal({ isOpen, onClose }: GovernanceModalProps) {
  const [activeTab, setActiveTab] = useState<'vote' | 'create'>('vote');
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });

  // Mock proposals
  const proposals: Proposal[] = [
    {
      id: 1,
      title: 'Reduce swap fees from 0.5% to 0.3%',
      description: 'To stay competitive and attract more users, we propose reducing swap fees.',
      votesFor: 125000,
      votesAgainst: 45000,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'active',
      hasVoted: false,
    },
    {
      id: 2,
      title: 'Add Avalanche chain support',
      description: 'Integrate Avalanche C-Chain to expand our multi-chain ecosystem.',
      votesFor: 89000,
      votesAgainst: 12000,
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'active',
      hasVoted: true,
    },
    {
      id: 3,
      title: 'Increase staking rewards by 5%',
      description: 'Boost APY across all staking tiers to incentivize long-term holding.',
      votesFor: 156000,
      votesAgainst: 23000,
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'passed',
      hasVoted: true,
    },
  ];

  const handleVote = (proposalId: number, support: boolean) => {
    alert(`Voted ${support ? 'FOR' : 'AGAINST'} proposal ${proposalId}!`);
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

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff < 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700/50 pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Vote className="w-6 h-6 text-purple-400" />
                      Governance
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Vote with your BLAZE tokens to shape the future
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('vote')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      activeTab === 'vote'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Vote on Proposals
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      activeTab === 'create'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Create Proposal
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'vote' ? (
                  // Proposals List
                  <div className="space-y-4">
                    {proposals.map((proposal) => {
                      const totalVotes = proposal.votesFor + proposal.votesAgainst;
                      const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                      const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;

                      return (
                        <motion.div
                          key={proposal.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border rounded-xl p-6 ${
                            proposal.status === 'active'
                              ? 'bg-slate-800/50 border-slate-700'
                              : proposal.status === 'passed'
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-red-500/10 border-red-500/30'
                          }`}
                        >
                          {/* Header */}
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
                              <p className="text-sm text-slate-400">{proposal.description}</p>
                            </div>
                          </div>

                          {/* Voting Progress */}
                          <div className="space-y-3 mb-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-green-400 flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  For ({forPercentage.toFixed(1)}%)
                                </span>
                                <span className="font-semibold">{proposal.votesFor.toLocaleString()} BLAZE</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                  style={{ width: `${forPercentage}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-red-400 flex items-center gap-1">
                                  <TrendingDown className="w-4 h-4" />
                                  Against ({againstPercentage.toFixed(1)}%)
                                </span>
                                <span className="font-semibold">{proposal.votesAgainst.toLocaleString()} BLAZE</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                                  style={{ width: `${againstPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Clock className="w-4 h-4" />
                              {getTimeRemaining(proposal.endTime)}
                            </div>

                            {proposal.status === 'active' && !proposal.hasVoted && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleVote(proposal.id, false)}
                                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-colors"
                                >
                                  Vote Against
                                </button>
                                <button
                                  onClick={() => handleVote(proposal.id, true)}
                                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-colors"
                                >
                                  Vote For
                                </button>
                              </div>
                            )}

                            {proposal.hasVoted && (
                              <span className="text-sm text-slate-400">✓ You voted</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  // Create Proposal
                  <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-sm text-blue-300">
                        💡 You need at least 1,000 BLAZE to create a proposal. Voting will be open for 3 days.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Proposal Title</label>
                      <input
                        type="text"
                        value={newProposal.title}
                        onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                        placeholder="e.g., Add support for new blockchain"
                        className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={newProposal.description}
                        onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                        placeholder="Provide details about your proposal..."
                        rows={6}
                        className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-purple-500 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={handleCreateProposal}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all"
                    >
                      Create Proposal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
