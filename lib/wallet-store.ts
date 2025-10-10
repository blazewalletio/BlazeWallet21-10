import { create } from 'zustand';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { Token, Chain } from './types';
import { CHAINS, DEFAULT_CHAIN } from './chains';

export interface WalletState {
  wallet: ethers.HDNodeWallet | null;
  address: string | null;
  balance: string;
  isLocked: boolean;
  mnemonic: string | null;
  currentChain: string;
  tokens: Token[];
  
  // Actions
  createWallet: () => Promise<string>;
  importWallet: (mnemonic: string) => Promise<void>;
  lockWallet: () => void;
  unlockWallet: (mnemonic: string) => Promise<void>;
  updateBalance: (balance: string) => void;
  resetWallet: () => void;
  switchChain: (chainKey: string) => void;
  addToken: (token: Token) => void;
  updateTokens: (tokens: Token[]) => void;
  removeToken: (tokenAddress: string) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  address: null,
  balance: '0',
  isLocked: false,
  mnemonic: null,
  currentChain: DEFAULT_CHAIN,
  tokens: [],

  createWallet: async () => {
    // Generate a new random wallet with 12-word mnemonic
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic?.phrase || '';
    
    set({
      wallet,
      address: wallet.address,
      mnemonic,
      isLocked: false,
    });

    // Store encrypted in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet_address', wallet.address);
      // In production, encrypt this!
      localStorage.setItem('wallet_mnemonic', mnemonic);
      localStorage.setItem('current_chain', DEFAULT_CHAIN);
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
    }
    set({
      wallet: null,
      address: null,
      balance: '0',
      isLocked: false,
      mnemonic: null,
      currentChain: DEFAULT_CHAIN,
      tokens: [],
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