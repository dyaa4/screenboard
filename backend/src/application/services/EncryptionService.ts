/**
 * Encryption Service Interface - Application Layer
 * Defines contract for token encryption/decryption operations
 * Part of Hexagonal Architecture - Application Layer
 */
export interface EncryptionService {
    /**
     * Encrypt sensitive data (access tokens, refresh tokens)
     * @param plainText The plain text to encrypt
     * @returns Encrypted string
     */
    encrypt(plainText: string): string;

    /**
     * Decrypt sensitive data back to plain text
     * @param encryptedText The encrypted text to decrypt
     * @returns Plain text string
     */
    decrypt(encryptedText: string): string;

    /**
     * Generate a secure encryption key
     * Used for key rotation scenarios
     * @returns Base64 encoded encryption key
     */
    generateKey(): string;
}