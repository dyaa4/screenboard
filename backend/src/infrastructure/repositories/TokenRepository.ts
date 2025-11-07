import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { ITokenDocument } from '../../domain/types/ITokenDocument';
import { EncryptionService } from '../../application/services/EncryptionService';
import logger from '../../utils/logger';

import TokenModel from '../../infrastructure/database/TokenModel';

export class TokenRepository implements ITokenRepository {
    constructor(private encryptionService: EncryptionService) { }

    async create(token: ITokenDocument): Promise<ITokenDocument> {
        const timer = logger.startTimer('Token Creation');

        try {
            // Encrypt sensitive tokens before saving
            logger.token('encrypt', token.serviceId, token.userId);

            const encryptedToken = {
                ...token,
                accessToken: this.encryptionService.encrypt(token.accessToken),
                refreshToken: this.encryptionService.encrypt(token.refreshToken)
            };

            logger.token('create', token.serviceId, token.userId);
            const result = await TokenModel.create(encryptedToken);

            logger.database('CREATE', 'tokens', undefined, 1);
            timer();
            return result;
        } catch (error) {
            logger.error('Token creation failed', error as Error, 'TokenRepository');
            throw error;
        }
    }

    async findToken(
        userId: string,
        dashboardId: string,
        serviceId: string,
    ): Promise<ITokenDocument | null> {
        const timer = logger.startTimer('Token Lookup');

        try {
            logger.database('FIND', 'tokens');
            const encryptedToken = await TokenModel.findOne({ userId, dashboardId, serviceId }).exec();

            if (!encryptedToken) {
                logger.info('Token not found', { userId, dashboardId, serviceId }, 'TokenRepository');
                timer();
                return null;
            }

            // Decrypt tokens before returning
            logger.token('decrypt', serviceId, userId);
            const result = await this.decryptTokenDocument(encryptedToken);

            logger.database('FIND', 'tokens', undefined, 1);
            timer();
            return result;
        } catch (error) {
            logger.error('Token lookup failed', error as Error, 'TokenRepository');
            throw error;
        }
    }

    async findTokenById(
        tokenId: string
    ): Promise<ITokenDocument | null> {
        const encryptedToken = await TokenModel.findById(tokenId).exec();

        if (!encryptedToken) {
            return null;
        }

        // Decrypt tokens before returning
        return this.decryptTokenDocument(encryptedToken);
    }

    async findDashboardTokens(
        userId: string,
        dashboardId: string,
    ): Promise<ITokenDocument[]> {
        const encryptedTokens = await TokenModel.find({ userId, dashboardId }).exec();

        // Decrypt all tokens before returning
        return Promise.all(
            encryptedTokens.map(token => this.decryptTokenDocument(token))
        );
    }

    async deleteToken(
        userId: string,
        dashboardId: string,
        serviceId: string,
    ): Promise<void> {
        await TokenModel.deleteOne({ userId, dashboardId, serviceId }).exec();
    }

    async updateAccessToken(
        tokenId: string,
        newAccessToken: string,
        expiration: Date,
        newRefreshToken?: string
    ): Promise<ITokenDocument | null> {
        // Encrypt new tokens before updating
        const updateData: any = {
            accessToken: this.encryptionService.encrypt(newAccessToken),
            expiration: expiration
        };

        if (newRefreshToken) {
            updateData.refreshToken = this.encryptionService.encrypt(newRefreshToken);
        }

        console.log('🔐 Updating token with encrypted access token');

        const updatedToken = await TokenModel.findByIdAndUpdate(
            tokenId,
            updateData,
            { new: true }
        ).exec();

        if (!updatedToken) {
            return null;
        }

        // Decrypt tokens before returning
        return this.decryptTokenDocument(updatedToken);
    }

    /**
     * Decrypt a token document's sensitive fields
     * Private helper method to ensure consistent decryption
     */
    private async decryptTokenDocument(encryptedToken: ITokenDocument): Promise<ITokenDocument> {
        try {
            const decryptedAccessToken = this.encryptionService.decrypt(encryptedToken.accessToken);
            const decryptedRefreshToken = this.encryptionService.decrypt(encryptedToken.refreshToken);

            // Debug: Log token format after decryption (first/last 10 chars for security)
            console.log(`🔓 Decrypted access token format: ${decryptedAccessToken.substring(0, 10)}...${decryptedAccessToken.substring(decryptedAccessToken.length - 10)} (length: ${decryptedAccessToken.length})`);
            console.log(`🔓 Decrypted refresh token format: ${decryptedRefreshToken.substring(0, 10)}...${decryptedRefreshToken.substring(decryptedRefreshToken.length - 10)} (length: ${decryptedRefreshToken.length})`);

            const decryptedToken = {
                ...encryptedToken.toObject(),
                accessToken: decryptedAccessToken,
                refreshToken: decryptedRefreshToken
            };

            // Return as ITokenDocument (maintain the same type)
            return decryptedToken as ITokenDocument;

        } catch (error) {
            console.error('🚨 Failed to decrypt token:', error);
            throw new Error('Token decryption failed - data may be corrupted');
        }
    }
}