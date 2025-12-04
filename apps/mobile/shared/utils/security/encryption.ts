import CryptoJS from 'crypto-js';

// Encryption configuration
const ENCRYPTION_CONFIG = {
  // In production, these should be stored securely (Keychain, Keystore, etc.)
  SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY || 'your-fallback-secret-key-32-chars-long!',
  IV_LENGTH: 16, // AES block size
  SALT_LENGTH: 64,
  KEY_SIZE: 256,
  ITERATIONS: 10000,
} as const;

// Encryption utility class
class EncryptionService {
  private secretKey: string;
  
  constructor(secretKey?: string) {
    this.secretKey = secretKey || ENCRYPTION_CONFIG.SECRET_KEY;
    
    // Validate key length for AES
    if (this.secretKey.length !== 32) {
      console.warn('Encryption key should be 32 characters long for optimal security');
    }
  }
  
  /**
   * Generate a random initialization vector (IV)
   */
  private generateIV(): string {
    return (CryptoJS as any).lib.WordArray.random(ENCRYPTION_CONFIG.IV_LENGTH).toString();
  }
  
  /**
   * Generate a random salt
   */
  private generateSalt(): string {
    return (CryptoJS as any).lib.WordArray.random(ENCRYPTION_CONFIG.SALT_LENGTH).toString();
  }
  
  /**
   * Derive a key from password using PBKDF2
   */
  private deriveKey(password: string, salt: string): any {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: ENCRYPTION_CONFIG.KEY_SIZE / 32,
      iterations: ENCRYPTION_CONFIG.ITERATIONS,
    });
  }
  
  /**
   * Encrypt data using AES
   */
  encrypt(data: string, customKey?: string): string {
    try {
      const key = customKey || this.secretKey;
      const iv = this.generateIV();
      
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      // Combine IV and encrypted data
      const result = {
        iv: iv,
        data: encrypted.toString(),
      };
      
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(result)));
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }
  
  /**
   * Decrypt data using AES
   */
  decrypt(encryptedData: string, customKey?: string): string {
    try {
      const key = customKey || this.secretKey;
      
      // Parse the encrypted data
      const decoded = CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Utf8);
      const encryptedObject = JSON.parse(decoded);
      
      const decrypted = CryptoJS.AES.decrypt(encryptedObject.data, key, {
        iv: CryptoJS.enc.Utf8.parse(encryptedObject.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
  
  /**
   * Encrypt data with password-based key derivation
   */
  encryptWithPassword(data: string, password: string): string {
    try {
      const salt = this.generateSalt();
      const key = this.deriveKey(password, salt);
      const iv = this.generateIV();
      
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      const result = {
        salt: salt,
        iv: iv,
        data: encrypted.toString(),
      };
      
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(result)));
    } catch (error) {
      throw new Error(`Password-based encryption failed: ${error}`);
    }
  }
  
  /**
   * Decrypt data with password-based key derivation
   */
  decryptWithPassword(encryptedData: string, password: string): string {
    try {
      const decoded = CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Utf8);
      const encryptedObject = JSON.parse(decoded);
      
      const key = this.deriveKey(password, encryptedObject.salt);
      
      const decrypted = CryptoJS.AES.decrypt(encryptedObject.data, key, {
        iv: CryptoJS.enc.Utf8.parse(encryptedObject.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`Password-based decryption failed: ${error}`);
    }
  }
  
  /**
   * Generate SHA-256 hash
   */
  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
  
  /**
   * Generate HMAC signature
   */
  hmac(data: string, key?: string): string {
    const hmacKey = key || this.secretKey;
    return CryptoJS.HmacSHA256(data, hmacKey).toString();
  }
  
  /**
   * Generate random token
   */
  generateToken(length: number = 32): string {
    return (CryptoJS as any).lib.WordArray.random(length).toString();
  }
  
  /**
   * Secure compare (to prevent timing attacks)
   */
  secureCompare(a: string, b: string): boolean {
    const aBuffer = CryptoJS.enc.Utf8.parse(a);
    const bBuffer = CryptoJS.enc.Utf8.parse(b);
    
    if (aBuffer.sigBytes !== bBuffer.sigBytes) {
      return false;
    }
    
    let result = 0;
    const wordsA = aBuffer.words;
    const wordsB = bBuffer.words;
    
    for (let i = 0; i < aBuffer.sigBytes / 4; i++) {
      result |= wordsA[i] ^ wordsB[i];
    }
    
    return result === 0;
  }
  
  /**
   * Obfuscate email address
   */
  obfuscateEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    
    const obfuscatedLocal = 
      localPart[0] + 
      '*'.repeat(localPart.length - 2) + 
      localPart[localPart.length - 1];
    
    return `${obfuscatedLocal}@${domain}`;
  }
  
  /**
   * Obfuscate phone number
   */
  obfuscatePhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length <= 4) {
      return '***' + cleanPhone.slice(-1);
    }
    
    return '***' + cleanPhone.slice(-4);
  }
}

// Create singleton instance
export const encryptionService = new EncryptionService();

// Utility functions
export const EncryptionUtils = {
  // Quick encrypt/decrypt functions
  quickEncrypt: (data: string): string => encryptionService.encrypt(data),
  quickDecrypt: (encryptedData: string): string => encryptionService.decrypt(encryptedData),
  
  // Hash utility
  createHash: (data: string): string => encryptionService.hash(data),
  
  // Token generation
  generateSecureToken: (length?: number): string => encryptionService.generateToken(length),
  
  // Data masking
  maskSensitiveData: (data: string, visibleChars: number = 4): string => {
    if (data.length <= visibleChars * 2) {
      return '*'.repeat(data.length);
    }
    return (
      data.substring(0, visibleChars) +
      '*'.repeat(data.length - visibleChars * 2) +
      data.substring(data.length - visibleChars)
    );
  },
};

// Type definitions
export type EncryptionServiceType = InstanceType<typeof EncryptionService>;
export type EncryptionConfig = typeof ENCRYPTION_CONFIG;

export default encryptionService;