import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { ITokenDocument } from '../../domain/types/ITokenDocument';
import { EncryptionService } from '../../application/services/EncryptionService';

import TokenModel from '../../infrastructure/database/TokenModel';

export class TokenRepository implements ITokenRepository {
    constructor(private encryptionService: EncryptionService) { }

    async create(token: ITokenDocument): Promise<ITokenDocument> {
        // Encrypt sensitive tokens before saving
        const encryptedToken = {
            ...token,
            accessToken: this.encryptionService.encrypt(token.accessToken),
            refreshToken: this.encryptionService.encrypt(token.refreshToken)
        };

        console.log('🔐 Creating token with encrypted access/refresh tokens');
        return TokenModel.create(encryptedToken);
    }

    async findToken(
        userId: string,
        dashboardId: string,
        serviceId: string,
    ): Promise<ITokenDocument | null> {
        const encryptedToken = await TokenModel.findOne({ userId, dashboardId, serviceId }).exec();

        if (!encryptedToken) {
            return null;
        }

        // Decrypt tokens before returning
        return this.decryptTokenDocument(encryptedToken);
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
            const decryptedToken = {
                ...encryptedToken.toObject(),
                accessToken: this.encryptionService.decrypt(encryptedToken.accessToken),
                refreshToken: this.encryptionService.decrypt(encryptedToken.refreshToken)
            };

            // Return as ITokenDocument (maintain the same type)
            return decryptedToken as ITokenDocument;

        } catch (error) {
            console.error('🚨 Failed to decrypt token:', error);
            throw new Error('Token decryption failed - data may be corrupted');
        }
    }
}