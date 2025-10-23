'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Rocket, 
  Gift,
  Copy,
  Loader2,
  Trophy,
  Mail,
  Share2,
  X,
  Sparkles,
  Wallet
} from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';

interface PriorityListData {
  stats: {
    total_registered: number;
    verified_count: number;
    referral_count: number;
    early_bird_count: number;
    email_provided_count: number;
    last_registration: string | null;
  };
  isRegistrationOpen: boolean;
  isPriorityOnlyPhase: boolean;
  isPresaleOpenToAll: boolean;
  userEntry: any;
  userReferrals: any[];
  timing: {
    timeUntilRegistration: { days: number; hours: number; minutes: number; seconds: number };
    timeUntilPresale: { days: number; hours: number; minutes: number; seconds: number };
    timeUntilExclusivityEnd: { days: number; hours: number; minutes: number; seconds: number };
  };
}

export default function PriorityListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const wallet = useWalletStore();
  const address = wallet.address;
  
  console.log('🔍 PriorityListModal rendered');
  console.log('📍 Current wallet address:', address);
  console.log('🔐 Wallet state:', { address: wallet.address, isLocked: wallet.isLocked });
  
  const [data, setData] = useState<PriorityListData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [referralError, setReferralError] = useState('');
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

  // Validate email in real-time
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('');
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validate referral code in real-time
  const validateReferralCode = (code: string) => {
    if (!code) {
      setReferralError('');
      return true;
    }
    const codeRegex = /^BLAZE[A-Z0-9]{6}$/;
    if (!codeRegex.test(code)) {
      setReferralError('Invalid format (BLAZE + 6 characters)');
      return false;
    }
    setReferralError('');
    return true;
  };

  // Register for priority list
  const handleRegister = async () => {
    console.log('🔥 Priority List Registration Started');
    console.log('📍 Wallet address:', address);
    console.log('📧 Email:', email);
    console.log('📱 Telegram:', telegram);
    console.log('🐦 Twitter:', twitter);
    console.log('🎫 Referral code:', referralCode);
    
    if (!address) {
      console.error('❌ No wallet address found');
      setError('Please connect your wallet first');
      return;
    }

    // Validate fields
    if (email && !validateEmail(email)) {
      console.error('❌ Invalid email format');
      return;
    }
    if (referralCode && !validateReferralCode(referralCode)) {
      console.error('❌ Invalid referral code format');
      return;
    }

    setIsRegistering(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        walletAddress: address,
        email: email || undefined,
        telegram: telegram || undefined,
        twitter: twitter || undefined,
        referralCode: referralCode || undefined,
      };
      
      console.log('📤 Sending registration request:', payload);
      
      const response = await fetch('/api/priority-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('📥 Registration response:', result);
      
      if (result.success) {
        console.log('✅ Registration successful!');
        setSuccess(result.message);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        await loadPriorityListData(); // Reload data
      } else {
        console.error('❌ Registration failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('💥 Registration error:', err);
      setError('Failed to register for priority list');
    } finally {
      setIsRegistering(false);
    }
  };

  // Copy referral code
  const copyReferralCode = () => {
    if (data?.userEntry?.referral_code) {
      navigator.clipboard.writeText(data.userEntry.referral_code);
      setSuccess('Referral code copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Share on Twitter
  const shareOnTwitter = () => {
    if (!data?.userEntry?.referral_code) return;
    const text = `I just joined the @BlazeWallet Priority List! 🔥\n\nGet 48-hour early access to the presale with my referral code: ${data.userEntry.referral_code}\n\nJoin now:`;
    const url = `https://my.blazewallet.io?ref=${data.userEntry.referral_code}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
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
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
            />
          )}

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
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center z-10">
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
                  <X className="w-6 h-6" />
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
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      <Users className="w-5 h-5 text-blue-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{data.stats.total_registered}</div>
                      <div className="text-xs text-gray-600">Registered</div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{data.stats.early_bird_count}</div>
                      <div className="text-xs text-gray-600">Early Birds</div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      <Gift className="w-5 h-5 text-purple-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{data.stats.referral_count}</div>
                      <div className="text-xs text-gray-600">Referrals</div>
                    </motion.div>
                  </div>
                )}

                {/* User Status - Enhanced */}
                {data?.userEntry && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
                      <CheckCircle className="w-5 h-5" />
                      You're Registered! {data.userEntry.is_early_bird && '🎉 Early Bird!'}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-semibold text-lg text-orange-600">#{data.userEntry.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registered:</span>
                        <span className="font-semibold">{new Date(data.userEntry.registered_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold ${data.userEntry.email_verified_at ? 'text-green-600' : 'text-orange-600'}`}>
                          {data.userEntry.email_verified_at ? '✓ Verified' : 'Pending Verification'}
                        </span>
                      </div>
                      {data.userEntry.referral_code && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="font-semibold text-gray-900 mb-2">Your Referral Code:</div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-white rounded-lg border border-green-300 font-mono text-lg text-center text-orange-600">
                              {data.userEntry.referral_code}
                            </code>
                            <button
                              onClick={copyReferralCode}
                              className="p-2 bg-white hover:bg-green-100 rounded-lg border border-green-300 transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                              onClick={shareOnTwitter}
                              className="p-2 bg-white hover:bg-green-100 rounded-lg border border-green-300 transition-colors"
                              title="Share on Twitter"
                            >
                              <Share2 className="w-5 h-5 text-green-600" />
                            </button>
                          </div>
                          {data.userReferrals && data.userReferrals.length > 0 && (
                            <div className="mt-3 text-sm">
                              <Trophy className="w-4 h-4 inline mr-1 text-yellow-500" />
                              <span className="font-semibold">{data.userReferrals.length}</span> referrals
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Registration Form - Enhanced */}
                {data?.isRegistrationOpen && !data?.userEntry && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Register for Priority List</h3>
                    
                    {/* Wallet Address Display */}
                    {address && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Wallet className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-blue-600 font-medium">Connected Wallet</div>
                          <div className="text-sm font-mono text-blue-900 truncate">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!address && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Wallet Not Connected</p>
                          <p className="text-xs text-yellow-700 mt-1">Please unlock or connect your wallet first.</p>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700">{success}</p>
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address (Recommended)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateEmail(e.target.value);
                        }}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${emailError ? 'border-red-300' : 'border-gray-200'} focus:border-orange-500 focus:outline-none transition-colors`}
                        disabled={isRegistering}
                      />
                      {emailError && (
                        <div className="text-xs text-red-600 mt-1">{emailError}</div>
                      )}
                      <div className="text-xs text-gray-600 mt-1">
                        Get confirmation email and presale updates
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => {
                          const upper = e.target.value.toUpperCase();
                          setReferralCode(upper);
                          validateReferralCode(upper);
                        }}
                        placeholder="BLAZE123456"
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border ${referralError ? 'border-red-300' : 'border-gray-200'} focus:border-orange-500 focus:outline-none font-mono transition-colors`}
                        disabled={isRegistering}
                      />
                      {referralError && (
                        <div className="text-xs text-red-600 mt-1">{referralError}</div>
                      )}
                      <div className="text-xs text-gray-600 mt-1">
                        Enter a referral code if you were invited
                      </div>
                    </div>

                    {/* Extra Fields Toggle */}
                    <button
                      onClick={() => setShowExtraFields(!showExtraFields)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      {showExtraFields ? '− Hide' : '+ Add'} social media (optional)
                    </button>

                    {showExtraFields && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Telegram Username (Optional)
                          </label>
                          <input
                            type="text"
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                            placeholder="@username"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none"
                            disabled={isRegistering}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Twitter Handle (Optional)
                          </label>
                          <input
                            type="text"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="@username"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none"
                            disabled={isRegistering}
                          />
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || !address || !!emailError || !!referralError}
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
                      <span>Exclusive Telegram group access</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>First 500: Early Bird bonus!</span>
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
                        <div className="font-semibold">October 23, 2025 (NOW)</div>
                        <div className="text-gray-600">Priority list registration opens</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold">October 30, 2025</div>
                        <div className="text-gray-600">Presale starts - Priority list only</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold">November 1, 2025</div>
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
