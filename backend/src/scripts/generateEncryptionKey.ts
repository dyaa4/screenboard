import { randomBytes } from 'crypto';

/**
 * Generate a secure 256-bit encryption key for token encryption
 * This script generates a new encryption key that should be added to your .env file
 */
function generateEncryptionKey(): void {
    console.log('🔑 Generating secure 256-bit encryption key for token encryption...\n');

    // Generate 32 bytes (256 bits) for AES-256
    const key = randomBytes(32);
    const base64Key = key.toString('base64');

    console.log('📋 Add this to your .env file:');
    console.log('=====================================');
    console.log(`TOKEN_ENCRYPTION_KEY=${base64Key}`);
    console.log('=====================================\n');

    console.log('🔐 This key will be used to encrypt:');
    console.log('  • OAuth access tokens (Google, Microsoft, Spotify)');
    console.log('  • OAuth refresh tokens');
    console.log('  • SmartThings access tokens\n');

    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('  • Keep this key SECRET and SECURE');
    console.log('  • Never commit this key to version control');
    console.log('  • Store it securely in production environments');
    console.log('  • Losing this key means losing access to all encrypted tokens');
    console.log('  • Use the same key across all environments to maintain data integrity\n');

    console.log('🔄 To rotate this key, you would need to:');
    console.log('  1. Decrypt all existing tokens with the old key');
    console.log('  2. Re-encrypt them with the new key');
    console.log('  3. Update all environment configurations\n');
}

// Run the generator
generateEncryptionKey();