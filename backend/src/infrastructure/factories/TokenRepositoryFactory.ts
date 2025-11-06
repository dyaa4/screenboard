import { TokenRepository } from '../repositories/TokenRepository';
import { EncryptionService } from '../../application/services/EncryptionService';

/**
 * Factory function to create a properly configured TokenRepository
 * with encryption service dependency injection
 * Follows Hexagonal Architecture - depends only on interfaces, not implementations
 */
export function createTokenRepository(encryptionService: EncryptionService): TokenRepository {
    return new TokenRepository(encryptionService);
}

/**
 * Alternative: Get TokenRepository from DI container
 * This is the preferred hexagonal approach
 */
export function getTokenRepositoryFromContainer(): TokenRepository {
    // This would use your DI container to resolve dependencies
    // Example: return container.resolve<TokenRepository>('TokenRepository');
    throw new Error('Implement DI container resolution here');
}