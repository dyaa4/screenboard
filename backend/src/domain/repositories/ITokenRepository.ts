import { ITokenDocument } from "../../domain/types/ITokenDocument";

export interface ITokenRepository {
    create(token: ITokenDocument): Promise<ITokenDocument>;
    findToken(userId: string, dashboardId: string, serviceId: string): Promise<ITokenDocument | null>;
    findTokenById(tokenId: string): Promise<ITokenDocument | null>;
    findDashboardTokens(userId: string, dashboardId: string): Promise<ITokenDocument[]>;
    deleteToken(userId: string, dashboardId: string, serviceId: string): Promise<void>;
    updateAccessToken(tokenId: string, newAccessToken: string, newExpiresAt: Date): Promise<ITokenDocument | null>;
}