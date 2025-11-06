import { container } from 'tsyringe';
import { EncryptionService } from '../services/EncryptionService';
import { AESEncryptionAdapter } from '../../infrastructure/adapter/output/AESEncryptionAdapter';
import { TokenRepository } from '../../infrastructure/repositories/TokenRepository';
import { ENCRYPTION_SERVICE_NAME, TOKEN_REPOSITORY_NAME } from '../constants/EncryptionConstants';

/**
 * Configure Dependency Injection for Token Encryption
 * Sets up the encryption service and token repository with proper dependencies
 */
export function configureEncryption(): void {
    console.log('🔧 Configuring token encryption services...');

    // Register EncryptionService implementation
    container.registerSingleton<EncryptionService>(
        ENCRYPTION_SERVICE_NAME,
        AESEncryptionAdapter
    );

    // Register TokenRepository with EncryptionService dependency
    container.register(TOKEN_REPOSITORY_NAME, {
        useFactory: () => {
            const encryptionService = container.resolve<EncryptionService>(ENCRYPTION_SERVICE_NAME);
            return new TokenRepository(encryptionService);
        },
    });

    console.log('✅ Token encryption services configured successfully');
}