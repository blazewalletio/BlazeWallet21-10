/**
 * WebAuthn Service for Biometric Authentication
 * Provides secure biometric authentication using WebAuthn API
 */

export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
  createdAt: number;
  lastUsed: number;
}

export interface WebAuthnResponse {
  success: boolean;
  credential?: WebAuthnCredential;
  error?: string;
}

export class WebAuthnService {
  private static instance: WebAuthnService;
  
  public static getInstance(): WebAuthnService {
    if (!WebAuthnService.instance) {
      WebAuthnService.instance = new WebAuthnService();
    }
    return WebAuthnService.instance;
  }

  /**
   * Check if WebAuthn is supported
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.navigator !== 'undefined' && 
           typeof window.navigator.credentials !== 'undefined' &&
           typeof window.PublicKeyCredential !== 'undefined';
  }

  /**
   * Check if platform authenticator (biometrics) is available
   */
  public async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.error('Error checking platform authenticator:', error);
      return false;
    }
  }

  /**
   * Register a new biometric credential
   */
  public async register(userId: string, username: string): Promise<WebAuthnResponse> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn not supported' };
    }

    try {
      // Check if platform authenticator is available
      const isAvailable = await this.isPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        return { success: false, error: 'Biometric authentication not available on this device' };
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "BLAZE Wallet",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Require platform authenticator (biometrics)
            userVerification: "required",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "direct"
        }
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Failed to create credential' };
      }

      // Convert to storage format
      const publicKeyCredential = credential.response as AuthenticatorAttestationResponse;
      const credentialData: WebAuthnCredential = {
        id: credential.id,
        publicKey: this.arrayBufferToBase64(publicKeyCredential.getPublicKey()!),
        counter: 0,
        createdAt: Date.now(),
        lastUsed: 0
      };

      return { success: true, credential: credentialData };

    } catch (error: any) {
      console.error('WebAuthn registration error:', error);
      
      // Handle specific error cases
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Biometric registration was cancelled or not allowed' };
      } else if (error.name === 'NotSupportedError') {
        return { success: false, error: 'Biometric authentication not supported on this device' };
      } else if (error.name === 'SecurityError') {
        return { success: false, error: 'Security error occurred during registration' };
      }
      
      return { success: false, error: error.message || 'Unknown error during registration' };
    }
  }

  /**
   * Authenticate using biometric credential
   */
  public async authenticate(credentialId: string): Promise<WebAuthnResponse> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn not supported' };
    }

    try {
      // Generate challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Convert credential ID
      const credentialIdBuffer = this.base64ToArrayBuffer(credentialId);

      // Authenticate
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          allowCredentials: [{
            id: credentialIdBuffer,
            type: 'public-key',
            transports: ['internal']
          }],
          timeout: 60000,
          userVerification: "required"
        }
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Authentication failed' };
      }

      // Update last used time
      const credentialData: WebAuthnCredential = {
        id: credential.id,
        publicKey: '', // Not needed for authentication
        counter: 0,
        createdAt: 0,
        lastUsed: Date.now()
      };

      return { success: true, credential: credentialData };

    } catch (error: any) {
      console.error('WebAuthn authentication error:', error);
      
      // Handle specific error cases
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Biometric authentication was cancelled or not allowed' };
      } else if (error.name === 'NotSupportedError') {
        return { success: false, error: 'Biometric authentication not supported' };
      } else if (error.name === 'SecurityError') {
        return { success: false, error: 'Security error during authentication' };
      }
      
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  /**
   * Get available authenticator types
   */
  public async getAvailableAuthenticators(): Promise<string[]> {
    const authenticators = [];

    if (await this.isPlatformAuthenticatorAvailable()) {
      authenticators.push('biometric');
    }

    // Check for other authenticator types
    try {
      // Use get() instead of getAll() for WebAuthn compatibility
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 1000,
          allowCredentials: []
        }
      });
      if (credential) {
        authenticators.push('passkey');
      }
    } catch (error) {
      // Ignore errors
    }

    return authenticators;
  }

  /**
   * Check if user has registered biometric credentials
   */
  public async hasRegisteredCredentials(): Promise<boolean> {
    try {
      const credentials = await this.getStoredCredentials();
      return credentials.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Store credential data securely
   */
  public storeCredential(credential: WebAuthnCredential): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = this.getStoredCredentials();
      const existingIndex = stored.findIndex(c => c.id === credential.id);
      
      if (existingIndex >= 0) {
        stored[existingIndex] = credential;
      } else {
        stored.push(credential);
      }
      
      localStorage.setItem('webauthn_credentials', JSON.stringify(stored));
    } catch (error) {
      console.error('Error storing WebAuthn credential:', error);
    }
  }

  /**
   * Get stored credentials
   */
  public getStoredCredentials(): WebAuthnCredential[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('webauthn_credentials');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving WebAuthn credentials:', error);
      return [];
    }
  }

  /**
   * Remove stored credentials
   */
  public removeCredentials(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('webauthn_credentials');
  }

  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
