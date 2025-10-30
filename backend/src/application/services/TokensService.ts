
import { ITokenDocument } from '../../domain/types/ITokenDocument';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';

export class TokenService {
    constructor(private tokenRepository: ITokenRepository) { }

    async createToken(token: ITokenDocument): Promise<ITokenDocument> {
        return this.tokenRepository.create(token);
    }

    async findToken(
        userId: string,
        dashboardId: string,
        serviceId: string,
    ): Promise<ITokenDocument | null> {
        return this.tokenRepository.findToken(userId, dashboardId, serviceId);
    }

    async findDashboardTokens(
        userId: string,
        dashboardId: string,
    ): Promise<ITokenDocument[]> {
        return this.tokenRepository.findDashboardTokens(userId, dashboardId);
    }

    async deleteToken(
        userId: string,
        dashboardId: string,
        serviceId: string,
    ): Promise<void> {
        return this.tokenRepository.deleteToken(userId, dashboardId, serviceId);
    }

    async updateAccessToken(
        tokenId: string,
        newAccessToken: string,
        newExpiresAt: Date,
    ): Promise<ITokenDocument | null> {
        return this.tokenRepository.updateAccessToken(tokenId, newAccessToken, newExpiresAt);
    }



}
