import { ethers } from 'ethers';
import * as crypto from 'crypto-js';

/**
 * Secure encryption utilities for wallet storage
 * Uses AES-256 encryption with PBKDF2 key derivation
 */

export interface EncryptedWallet {
  encryptedData: string;
  salt: string;
  iv: string;
}

/**
 * Derive a secure key from password using PBKDF2
 */
export function deriveKey(password: string, salt: string): string {
  return crypto.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
}

/**
 * Encrypt wallet data with password
 */
export function encryptWallet(mnemonic: string, password: string): EncryptedWallet {
  // Generate random salt and IV
  const salt = crypto.lib.WordArray.random(128 / 8).toString();
  const iv = crypto.lib.WordArray.random(128 / 8).toString();
  
  // Derive key from password
  const key = deriveKey(password, salt);
  
  // Encrypt mnemonic
  const encryptedData = crypto.AES.encrypt(mnemonic, key, {
    iv: crypto.enc.Hex.parse(iv),
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7
  }).toString();
  
  return {
    encryptedData,
    salt,
    iv
  };
}

/**
 * Decrypt wallet data with password
 */
export function decryptWallet(encryptedWallet: EncryptedWallet, password: string): string {
  try {
    // Derive key from password
    const key = deriveKey(password, encryptedWallet.salt);
    
    // Decrypt mnemonic
    const decrypted = crypto.AES.decrypt(encryptedWallet.encryptedData, key, {
      iv: crypto.enc.Hex.parse(encryptedWallet.iv),
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7
    });
    
    const mnemonic = decrypted.toString(crypto.enc.Utf8);
    
    if (!mnemonic) {
      throw new Error('Invalid password or corrupted data');
    }
    
    return mnemonic;
  } catch (error) {
    throw new Error('Invalid password or corrupted data');
  }
}

/**
 * Hash password for secure storage
 */
export function hashPassword(password: string): string {
  const salt = crypto.lib.WordArray.random(128 / 8).toString();
  const hash = crypto.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
  
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const computedHash = crypto.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
    
    return computedHash === hash;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a secure random password for biometric fallback
 */
export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < 32; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}
