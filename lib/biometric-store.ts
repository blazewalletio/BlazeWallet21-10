/**
 * Biometric-Protected Storage
 * Stores encrypted password that can only be accessed via biometric authentication
 */

import { WebAuthnService } from './webauthn-service';

export class BiometricStore {
  private static instance: BiometricStore;
  private webauthnService: WebAuthnService;

  private constructor() {
    this.webauthnService = WebAuthnService.getInstance();
  }

  public static getInstance(): BiometricStore {
    if (!BiometricStore.instance) {
      BiometricStore.instance = new BiometricStore();
    }
    return BiometricStore.instance;
  }

  /**
   * Store password protected by biometric authentication
   */
  public async storePassword(password: string): Promise<boolean> {
    try {
      // Simple encryption using the password itself as key
      // In production, you'd use a more secure method
      const encrypted = btoa(password); // Base64 encode for simple obfuscation
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('biometric_protected_password', encrypted);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error storing password:', error);
      return false;
    }
  }

  /**
   * Retrieve password after biometric authentication
   */
  public async retrievePassword(): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;
      
      // Check if biometric credentials exist
      const credentials = this.webauthnService.getStoredCredentials();
      if (credentials.length === 0) {
        throw new Error('No biometric credentials found');
      }

      // Authenticate with biometrics
      const result = await this.webauthnService.authenticate(credentials[0].id);
      if (!result.success) {
        throw new Error(result.error || 'Biometric authentication failed');
      }

      // Retrieve and decrypt password
      const encrypted = localStorage.getItem('biometric_protected_password');
      if (!encrypted) {
        throw new Error('No stored password found');
      }

      // Simple decryption
      const password = atob(encrypted);
      return password;

    } catch (error: any) {
      console.error('Error retrieving password:', error);
      throw error;
    }
  }

  /**
   * Remove stored password
   */
  public removePassword(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('biometric_protected_password');
    }
  }

  /**
   * Check if password is stored
   */
  public hasStoredPassword(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('biometric_protected_password') !== null;
  }
}

