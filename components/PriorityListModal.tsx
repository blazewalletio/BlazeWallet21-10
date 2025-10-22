'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Rocket, 
  Gift,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';

interface PriorityListData {
  stats: {
    totalRegistered: number;
    verifiedCount: number;
    referralCount: number;
    lastRegistration: string | null;
  };
  isRegistrationOpen: boolean;
  isPriorityOnlyPhase: boolean;
  isPresaleOpenToAll: boolean;
  userEntry: any;
  timing: {
    timeUntilRegistration: { days: number; hours: number; minutes: number; seconds: number };
    timeUntilPresale: { days: number; hours: number; minutes: number; seconds: number };
    timeUntilExclusivityEnd: { days: number; hours: number; minutes: number; seconds: number };
  };
}

export default function PriorityListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { address } = useWalletStore();
  const [data, setData] = useState<PriorityListData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Load priority list data
  const loadPriorityListData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/priority-list?wallet=${address}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setCountdown(result.data.timing.timeUntilRegistration);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load priority list data');
    } finally {
      setIsLoading(false);
    }
  };

  // Register for priority list
  const handleRegister = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsRegistering(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/priority-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          referralCode: referralCode || undefined,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message);
        await loadPriorityListData(); // Reload data
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to register for priority list');
    } finally {
      setIsRegistering(false);
    }
  };

  // Copy referral code
  const copyReferralCode = () => {
    if (data?.userEntry?.referralCode) {
      navigator.clipboard.writeText(data.userEntry.referralCode);
      setSuccess('Referral code copied to clipboard!');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!data) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && address) {
      loadPriorityListData();
    }
  }, [isOpen, address]);

  // Format countdown
  const formatCountdown = () => {
    if (countdown.days > 0) {
      return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`;
    } else if (countdown.hours > 0) {
      return `${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`;
    } else if (countdown.minutes > 0) {
      return `${countdown.minutes}m ${countdown.seconds}s`;
    } else {
      return `${countdown.seconds}s`;
    }
  };

  // Get status message
  const getStatusMessage = () => {
    if (!data) return '';
    
    if (data.isRegistrationOpen) {
      return 'Priority list registration is now open!';
    } else if (data.isPriorityOnlyPhase) {
      return 'Presale is live - Priority list members only!';
    } else if (data.isPresaleOpenToAll) {
      return 'Presale is open to everyone!';
    } else {
      return 'Priority list registration opens soon!';
    }
  };

  // Get status color
  const getStatusColor = () => {
    if (!data) return 'gray';
    
    if (data.isRegistrationOpen) return 'green';
    if (data.isPriorityOnlyPhase) return 'blue';
    if (data.isPresaleOpenToAll) return 'purple';
    return 'orange';
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-soft-xl pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-orange-500" />
                    BLAZE Priority List
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Early access to the presale</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Banner */}
                <div className={`rounded-xl p-4 border ${
                  getStatusColor() === 'green' ? 'bg-green-50 border-green-200' :
                  getStatusColor() === 'blue' ? 'bg-blue-50 border-blue-200' :
                  getStatusColor() === 'purple' ? 'bg-purple-50 border-purple-200' :
                  'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${
                      getStatusColor() === 'green' ? 'text-green-600' :
                      getStatusColor() === 'blue' ? 'text-blue-600' :
                      getStatusColor() === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{getStatusMessage()}</h3>
                      {!data?.isPresaleOpenToAll && (
                        <p className="text-sm text-gray-600 mt-1">
                          {data?.isRegistrationOpen ? 'Register now for 48-hour early access' : 
                           data?.isPriorityOnlyPhase ? 'Priority list members can contribute now' :
                           `Registration opens in ${formatCountdown()}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                {data && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <Users className="w-5 h-5 text-blue-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{data.stats.totalRegistered}</div>
                      <div className="text-xs text-gray-600">Registered</div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{data.stats.verifiedCount}</div>
                      <div className="text-xs text-gray-600">Verified</div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <Gift className="w-5 h-5 text-purple-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{data.stats.referralCount}</div>
                      <div className="text-xs text-gray-600">Referrals</div>
                    </div>
                  </div>
                )}

                {/* User Status */}
                {data?.userEntry && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                      <CheckCircle className="w-5 h-5" />
                      You're Registered!
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registered:</span>
                        <span className="font-semibold">{new Date(data.userEntry.registeredAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-green-600">
                          {data.userEntry.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>
                      {data.userEntry.referralCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Your Referral Code:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold font-mono">{data.userEntry.referralCode}</span>
                            <button
                              onClick={copyReferralCode}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Registration Form */}
                {data?.isRegistrationOpen && !data?.userEntry && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Register for Priority List</h3>
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="BLAZE123456"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none"
                        disabled={isRegistering}
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        Enter a referral code if you were invited by someone
                      </div>
                    </div>

                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || !address}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5" />
                          Register for Priority List
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Priority List Benefits</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>48-hour early access to presale</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Guaranteed allocation (first come, first served)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Referral rewards program</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Exclusive updates and announcements</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold">October 27, 2025</div>
                        <div className="text-gray-600">Priority list registration opens</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold">November 3, 2025</div>
                        <div className="text-gray-600">Presale starts - Priority list only</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold">November 5, 2025</div>
                        <div className="text-gray-600">Presale opens to everyone</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
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
