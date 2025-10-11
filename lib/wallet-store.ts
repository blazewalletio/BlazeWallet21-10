import { create } from 'zustand';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { Token, Chain } from './types';
import { CHAINS, DEFAULT_CHAIN } from './chains';
import { encryptWallet, decryptWallet, hashPassword, verifyPassword, EncryptedWallet } from './crypto-utils';

export interface WalletState {
  wallet: ethers.HDNodeWallet | null;
  address: string | null;
  balance: string;
  isLocked: boolean;
  mnemonic: string | null;
  currentChain: string;
  tokens: Token[];
  hasPassword: boolean;
  lastActivity: number;
  
  // Actions
  createWallet: () => Promise<string>;
  importWallet: (mnemonic: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  unlockWithPassword: (password: string) => Promise<void>;
  lockWallet: () => void;
  unlockWallet: (mnemonic: string) => Promise<void>;
  updateBalance: (balance: string) => void;
  resetWallet: () => void;
  switchChain: (chainKey: string) => void;
  addToken: (token: Token) => void;
  updateTokens: (tokens: Token[]) => void;
  removeToken: (tokenAddress: string) => void;
  updateActivity: () => void;
  checkAutoLock: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  address: null,
  balance: '0',
  isLocked: false,
  mnemonic: null,
  currentChain: DEFAULT_CHAIN,
  tokens: [],
  hasPassword: false,
  lastActivity: Date.now(),

  createWallet: async () => {
    // Generate a new random wallet with 12-word mnemonic
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic?.phrase || '';
    
    set({
      wallet,
      address: wallet.address,
      mnemonic,
      isLocked: false,
      lastActivity: Date.now(),
    });

    // Store address and chain preference (safe to store unencrypted)
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet_address', wallet.address);
      localStorage.setItem('current_chain', DEFAULT_CHAIN);
      // Mnemonic will be stored encrypted when user sets password
    }

    return mnemonic;
  },

  importWallet: async (mnemonic: string) => {
    try {
      // ⚠️ CRITICAL: Validate BIP39 mnemonic BEFORE creating wallet
      const cleanMnemonic = mnemonic.trim().toLowerCase();
      
      if (!bip39.validateMnemonic(cleanMnemonic)) {
        throw new Error('Ongeldige recovery phrase. Controleer je woorden en checksum.');
      }
      
      // Create wallet from validated mnemonic
      const wallet = ethers.Wallet.fromPhrase(cleanMnemonic);
      
      // Restore chain preference
      const savedChain = typeof window !== 'undefined' 
        ? localStorage.getItem('current_chain') || DEFAULT_CHAIN
        : DEFAULT_CHAIN;
      
      set({
        wallet,
        address: wallet.address,
        mnemonic: cleanMnemonic,
        isLocked: false,
        currentChain: savedChain,
      });

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_address', wallet.address);
        localStorage.setItem('wallet_mnemonic', cleanMnemonic);
      }
    } catch (error) {
      throw new Error('Ongeldige recovery phrase. Controleer je woorden en checksum.');
    }
  },

  setPassword: async (password: string) => {
    const { mnemonic, address } = get();
    
    if (!mnemonic || !address) {
      throw new Error('Geen wallet gevonden om te versleutelen');
    }

    // Encrypt the mnemonic with the password
    const encryptedWallet = encryptWallet(mnemonic, password);
    const passwordHash = hashPassword(password);

    // Store encrypted data
    if (typeof window !== 'undefined') {
      localStorage.setItem('encrypted_wallet', JSON.stringify(encryptedWallet));
      localStorage.setItem('password_hash', passwordHash);
      localStorage.setItem('has_password', 'true');
    }

    set({
      hasPassword: true,
      lastActivity: Date.now(),
    });

    // Clear mnemonic from memory for security
    set({ mnemonic: null });
  },

  unlockWithPassword: async (password: string) => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Niet beschikbaar op server');
      }

      // Check if password is correct
      const storedHash = localStorage.getItem('password_hash');
      if (!storedHash || !verifyPassword(password, storedHash)) {
        throw new Error('Ongeldig wachtwoord');
      }

      // Decrypt wallet
      const encryptedWalletData = localStorage.getItem('encrypted_wallet');
      if (!encryptedWalletData) {
        throw new Error('Geen versleutelde wallet gevonden');
      }

      const encryptedWallet: EncryptedWallet = JSON.parse(encryptedWalletData);
      const mnemonic = decryptWallet(encryptedWallet, password);
      
      // Validate and create wallet
      const cleanMnemonic = mnemonic.trim().toLowerCase();
      if (!bip39.validateMnemonic(cleanMnemonic)) {
        throw new Error('Beschadigde wallet data');
      }

      const wallet = ethers.Wallet.fromPhrase(cleanMnemonic);
      const savedChain = localStorage.getItem('current_chain') || DEFAULT_CHAIN;

      set({
        wallet,
        address: wallet.address,
        mnemonic: cleanMnemonic,
        isLocked: false,
        currentChain: savedChain,
        lastActivity: Date.now(),
      });

    } catch (error) {
      throw new Error('Ongeldig wachtwoord of beschadigde data');
    }
  },

  lockWallet: () => {
    set({
      wallet: null,
      isLocked: true,
    });
  },

  unlockWallet: async (mnemonic: string) => {
    try {
      // ⚠️ CRITICAL: Validate BIP39 mnemonic
      const cleanMnemonic = mnemonic.trim().toLowerCase();
      
      if (!bip39.validateMnemonic(cleanMnemonic)) {
        throw new Error('Ongeldige recovery phrase. Controleer je woorden en checksum.');
      }
      
      const wallet = ethers.Wallet.fromPhrase(cleanMnemonic);
      set({
        wallet,
        address: wallet.address,
        isLocked: false,
      });
    } catch (error) {
      throw new Error('Ongeldige recovery phrase. Controleer je woorden en checksum.');
    }
  },

  updateBalance: (balance: string) => {
    set({ balance });
  },

  resetWallet: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wallet_address');
      localStorage.removeItem('wallet_mnemonic');
      localStorage.removeItem('current_chain');
      localStorage.removeItem('custom_tokens');
      localStorage.removeItem('encrypted_wallet');
      localStorage.removeItem('password_hash');
      localStorage.removeItem('has_password');
    }
    set({
      wallet: null,
      address: null,
      balance: '0',
      isLocked: false,
      mnemonic: null,
      currentChain: DEFAULT_CHAIN,
      tokens: [],
      hasPassword: false,
      lastActivity: Date.now(),
    });
  },

  switchChain: (chainKey: string) => {
    set({ currentChain: chainKey, balance: '0' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_chain', chainKey);
    }
  },

  addToken: (token: Token) => {
    const { tokens } = get();
    const exists = tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase());
    
    if (!exists) {
      const newTokens = [...tokens, token];
      set({ tokens: newTokens });
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('custom_tokens', JSON.stringify(newTokens));
      }
    }
  },

  updateTokens: (tokens: Token[]) => {
    set({ tokens });
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },

  checkAutoLock: () => {
    const { lastActivity, wallet } = get();
    const AUTO_LOCK_TIME = 30 * 60 * 1000; // 30 minutes
    
    if (wallet && Date.now() - lastActivity > AUTO_LOCK_TIME) {
      set({
        wallet: null,
        mnemonic: null,
        isLocked: true,
      });
    }
  },

  removeToken: (tokenAddress: string) => {
    const { tokens } = get();
    const newTokens = tokens.filter(
      t => t.address.toLowerCase() !== tokenAddress.toLowerCase()
    );
    set({ tokens: newTokens });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_tokens', JSON.stringify(newTokens));
    }
  },
}));




