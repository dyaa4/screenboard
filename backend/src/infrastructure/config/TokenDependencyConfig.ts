import { EncryptionService } from '../../application/services/EncryptionService';
import { AESEncryptionAdapter } from '../adapter/output/AESEncryptionAdapter';
import { TokenRepository } from '../repositories/TokenRepository';

/**
 * Simple Factory Pattern for Token Management Dependencies
 * Follows Hexagonal Architecture principles without external DI container
 */

// Singleton instances
let encryptionService: EncryptionService | null = null;
let tokenRepository: TokenRepository | null = null;

/**
 * Configure token encryption dependencies
 * Call this during application startup
 */
export function configureTokenDependencies(): void {
    console.log('🔧 Configuring token encryption dependencies...');

    // Initialize singleton instances
    encryptionService = new AESEncryptionAdapter();
    tokenRepository = new TokenRepository(encryptionService);

    console.log('✅ Token encryption dependencies configured');
}

/**
 * Get TokenRepository instance
 * Creates encrypted TokenRepository following factory pattern
 */
export function getTokenRepository(): TokenRepository {
    if (!tokenRepository) {
        throw new Error('Token dependencies not configured. Call configureTokenDependencies() first.');
    }
    return tokenRepository;
}

/**
 * Get EncryptionService instance
 * Useful for testing or direct service access
 */
export function getEncryptionService(): EncryptionService {
    if (!encryptionService) {
        throw new Error('Token dependencies not configured. Call configureTokenDependencies() first.');
    }
    return encryptionService;
}