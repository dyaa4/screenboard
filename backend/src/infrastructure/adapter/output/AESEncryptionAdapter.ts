// @ts-ignore
import CryptoJS from 'crypto-js';
import { EncryptionService } from '../../../application/services/EncryptionService';

/**
 * AES Encryption Adapter - Infrastructure Layer
 * Implements secure AES-256 encryption for sensitive token data
 * Part of Hexagonal Architecture - Infrastructure/Adapter Layer
 */
export class AESEncryptionAdapter implements EncryptionService {
    private readonly encryptionKey: string;

    constructor() {
        // Get encryption key from environment variables
        const envKey = process.env.TOKEN_ENCRYPTION_KEY;

        if (!envKey) {
            throw new Error(
                'TOKEN_ENCRYPTION_KEY environment variable is required for token encryption. ' +
                'Generate one using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
            );
        }

        this.encryptionKey = envKey;

        // Validate key length (should be 32 bytes when base64 decoded)
        try {
            const decodedKey = Buffer.from(this.encryptionKey, 'base64');
            if (decodedKey.length !== 32) {
                throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (256 bits) when base64 decoded');
            }
        } catch (error) {
            throw new Error('Invalid TOKEN_ENCRYPTION_KEY format. Must be a valid base64 string.');
        }

        console.log('✅ Token encryption initialized with AES-256');
    }

    /**
     * Encrypt sensitive data using AES-256-CBC
     * Uses a random IV for each encryption to ensure uniqueness
     */
    encrypt(plainText: string): string {
        try {
            if (!plainText || plainText.trim() === '') {
                throw new Error('Cannot encrypt empty or null text');
            }

            // Parse the base64 key to WordArray
            const key = CryptoJS.enc.Base64.parse(this.encryptionKey);

            // Generate random IV for this encryption
            const iv = CryptoJS.lib.WordArray.random(16); // 128-bit IV

            // Encrypt using AES-256-CBC with random IV
            const encrypted = CryptoJS.AES.encrypt(plainText, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            // Combine IV and encrypted data
            const combined = iv.concat(encrypted.ciphertext);

            // Return as base64 string
            return combined.toString(CryptoJS.enc.Base64);

        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt token data');
        }
    }

    /**
     * Decrypt data back to plain text
     */
    decrypt(encryptedText: string): string {
        try {
            if (!encryptedText || encryptedText.trim() === '') {
                throw new Error('Cannot decrypt empty or null text');
            }

            // Parse the base64 key to WordArray
            const key = CryptoJS.enc.Base64.parse(this.encryptionKey);

            // Parse the base64 encoded data
            const combined = CryptoJS.enc.Base64.parse(encryptedText);

            // Extract IV (first 16 bytes) and ciphertext (rest)
            const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4)); // 16 bytes = 4 words
            const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));

            // Create cipher params object
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: ciphertext
            });

            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            // Convert to UTF8 string
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);

            if (!plainText) {
                throw new Error('Decryption resulted in empty string - possible key mismatch');
            }

            return plainText;

        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt token data - data may be corrupted or key mismatch');
        }
    }

    /**
     * Generate a new 256-bit encryption key
     * Useful for key rotation scenarios
     */
    generateKey(): string {
        const key = CryptoJS.lib.WordArray.random(32); // 256 bits
        return key.toString(CryptoJS.enc.Base64);
    }
}