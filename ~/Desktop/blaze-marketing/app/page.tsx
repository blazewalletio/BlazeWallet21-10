'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Zap, Lock, Gift, Vote, Users, Palette, ArrowRight, Download,
  Check, Twitter, Github, Send as TelegramIcon, MessageCircle,
  Rocket, CreditCard, Shield, TrendingUp, ChevronDown, Menu, X,
  ArrowUp, Mail, ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import NewsletterSignup from '@/components/NewsletterSignup';
import PriceTicker from '@/components/PriceTicker';
import BlazeLogo from '@/components/BlazeLogo';
import TeamSection from '@/components/TeamSection';
import ComparisonTable from '@/components/ComparisonTable';
import UseCasesSection from '@/components/UseCasesSection';
import TokenomicsSection from '@/components/TokenomicsSection';
import RoadmapSection from '@/components/RoadmapSection';
import WhitepaperSection from '@/components/WhitepaperSection';
import LiveDemo from '@/components/LiveDemo';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <PriceTicker />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-500/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block p-4 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl border border-orange-500/30 mb-6"
                >
                  <BlazeLogo size={80} variant="icon" />
                </motion.div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Blaze
                </span>
                <br />
                <span className="text-white">Wallet</span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                The fastest, most feature-rich crypto wallet on earth. 
                <span className="text-orange-400 font-semibold">Lightning-fast transactions</span>, 
                <span className="text-pink-400 font-semibold">built-in swapping</span>, and 
                <span className="text-purple-400 font-semibold">cashback rewards</span> in one beautiful app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <motion.a
                  href="https://my.blazewallet.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-6 h-6" />
                  Launch App
                </motion.a>
                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-slate-600 hover:border-orange-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-6 h-6" />
                  Learn More
                </motion.a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">8+</div>
                  <div className="text-slate-400">Blockchains</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">25%</div>
                  <div className="text-slate-400">Max APY</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">5%</div>
                  <div className="text-slate-400">Cashback</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">0.1s</div>
                  <div className="text-slate-400">Tx Speed</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Blaze</span>?
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Built for speed, security, and simplicity. Experience the future of crypto wallets.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Transactions in milliseconds, not minutes" },
                { icon: Shield, title: "Bank-Grade Security", desc: "Your keys, your crypto. Always." },
                { icon: Gift, title: "Cashback Rewards", desc: "Earn BLAZE tokens on every transaction" },
                { icon: Vote, title: "Governance", desc: "Vote on protocol changes and earn rewards" },
                { icon: Users, title: "Multi-Chain", desc: "Support for 8+ major blockchains" },
                { icon: Palette, title: "Beautiful UI", desc: "Stunning design that makes crypto fun" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <TeamSection />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* Use Cases Section */}
        <UseCasesSection />

        {/* Tokenomics Section */}
        <TokenomicsSection />

        {/* Roadmap Section */}
        <RoadmapSection />

        {/* Whitepaper Section */}
        <WhitepaperSection />

        {/* Live Demo Section */}
        <LiveDemo />

        {/* Countdown Timer Section */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Mainnet Launch in
              </h2>
              <p className="text-xl text-slate-400">
                Get ready for the most revolutionary crypto wallet launch
              </p>
            </motion.div>
            <CountdownTimer />
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4">
            <NewsletterSignup />
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <BlazeLogo size={40} variant="icon" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    Blaze Wallet
                  </span>
                </div>
                <p className="text-slate-400 mb-6 max-w-md">
                  The fastest, most feature-rich crypto wallet on earth. Built for the future of decentralized finance.
                </p>
                <div className="flex gap-4">
                  <a href="https://twitter.com/blazewallet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/blazewallet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://t.me/blazewallet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                    <TelegramIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Product</h3>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="https://my.blazewallet.io" className="hover:text-orange-400 transition-colors">Launch App</a></li>
                  <li><a href="#features" className="hover:text-orange-400 transition-colors">Features</a></li>
                  <li><a href="#whitepaper" className="hover:text-orange-400 transition-colors">Whitepaper</a></li>
                  <li><a href="#roadmap" className="hover:text-orange-400 transition-colors">Roadmap</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Community</h3>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="https://twitter.com/blazewallet" className="hover:text-orange-400 transition-colors">Twitter</a></li>
                  <li><a href="https://t.me/blazewallet" className="hover:text-orange-400 transition-colors">Telegram</a></li>
                  <li><a href="https://discord.gg/blazewallet" className="hover:text-orange-400 transition-colors">Discord</a></li>
                  <li><a href="mailto:hello@blazewallet.io" className="hover:text-orange-400 transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
              <p>&copy; 2024 Blaze Wallet. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-full flex items-center justify-center shadow-lg transition-all z-50"
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </main>
  );
}
