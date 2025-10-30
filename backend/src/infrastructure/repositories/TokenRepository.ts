import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { ITokenDocument } from '../../domain/types/ITokenDocument';

import TokenModel from '../../infrastructure/database/TokenModel';

export class TokenRepository implements ITokenRepository {
    async create(token: ITokenDocument): Promise<ITokenDocument> {
        return TokenModel.create(token);
    }

    async findToken(
        userId: string,
        dashboardId: string,
        serviceId: string,
    ): Promise<ITokenDocument | null> {
        return TokenModel.findOne({ userId, dashboardId, serviceId }).exec();
    }

    async findTokenById(
        tokenId: string
    ): Promise<ITokenDocument | null> {
        return TokenModel.findById(tokenId).exec();
    }

    async findDashboardTokens(
        userId: string,
        dashboardId: string,
    ): Promise<ITokenDocument[]> {
        return TokenModel.find({ userId, dashboardId }).exec();
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
        return TokenModel.findByIdAndUpdate(
            tokenId,
            {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiration: expiration
            },
            { new: true } // Gibt das aktualisierte Dokument zurück
        ).exec();
    }
}