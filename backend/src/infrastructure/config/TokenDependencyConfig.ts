import 'reflect-metadata';
import { container } from 'tsyringe';
import { EncryptionService } from '../../application/services/EncryptionService';
import { AESEncryptionAdapter } from '../adapter/output/AESEncryptionAdapter';
import { TokenRepository } from '../repositories/TokenRepository';

/**
 * Dependency Injection Container Setup for Token Management
 * Follows Hexagonal Architecture principles:
 * - Application Layer defines interfaces
 * - Infrastructure Layer provides implementations
 * - DI container wires them together at runtime
 */

// Injection tokens (symbols prevent string-based conflicts)
export const ENCRYPTION_SERVICE_TOKEN = Symbol('EncryptionService');
export const TOKEN_REPOSITORY_TOKEN = Symbol('TokenRepository');

/**
 * Configure all token-related dependencies
 * Call this during application startup
 */
export function configureTokenDependencies(): void {
    console.log('🔧 Configuring token encryption dependencies...');

    // Register EncryptionService implementation
    container.register<EncryptionService>(ENCRYPTION_SERVICE_TOKEN, {
        useClass: AESEncryptionAdapter
    });

    // Register TokenRepository with EncryptionService dependency
    container.register<TokenRepository>(TOKEN_REPOSITORY_TOKEN, {
        useFactory: (dependencyContainer) => {
            const encryptionService = dependencyContainer.resolve<EncryptionService>(ENCRYPTION_SERVICE_TOKEN);
            return new TokenRepository(encryptionService);
        }
    });

    console.log('✅ Token encryption dependencies configured');
}

/**
 * Get TokenRepository from DI container
 * This is the hexagonal-compliant way to resolve dependencies
 */
export function getTokenRepository(): TokenRepository {
    return container.resolve<TokenRepository>(TOKEN_REPOSITORY_TOKEN);
}

/**
 * Get EncryptionService from DI container
 * Useful for testing or direct service access
 */
export function getEncryptionService(): EncryptionService {
    return container.resolve<EncryptionService>(ENCRYPTION_SERVICE_TOKEN);
}