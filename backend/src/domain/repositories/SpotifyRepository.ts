import { ISpotifyToken } from "../../domain/types/ISpotifyToken";

export interface SpotifyRepository {
  getTokens(code: string, userId?: string, dashboardId?: string): Promise<ISpotifyToken>;
  refreshAccessToken(refreshToken: string): Promise<ISpotifyToken>;
  getLoginUrl(): string;
  saveActiveDevice(deviceId: string, userId: string, dashboardId: string, spotifyAccessToken: string): Promise<void>;
}
