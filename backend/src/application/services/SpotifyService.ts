import { Token } from "../../domain/entities/Token";
import { SpotifyRepository } from "../../domain/repositories/SpotifyRepository";
import { ITokenDocument } from "../../domain/types/ITokenDocument";
import { ISpotifyToken } from "../../domain/types/ISpotifyToken";
import { SERVICES } from "../../domain/valueObjects/serviceToken";
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository";
import { isAxiosError } from "axios";

export class SpotifyService {
  constructor(
    private spotifyRepository: SpotifyRepository,
    private tokenRepository: TokenRepository
  ) { }

  async getLogginStatus(userId: string, dashboardId: string): Promise<boolean> {
    const token = await this.tokenRepository.findToken(userId, dashboardId, SERVICES.SPOTIFY);
    return !!token;
  }

  async logout(userId: string, dashboardId: string): Promise<void> {
    await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.SPOTIFY);
  }

  async saveActiveDevice(
    deviceId: string,
    userId: string,
    dashboardId: string,
    spotifyAccessToken: string
  ): Promise<void> {
    return this.spotifyRepository.saveActiveDevice(deviceId, userId, dashboardId, spotifyAccessToken);
  }

  getLoginUrl(): string {
    return this.spotifyRepository.getLoginUrl();
  }

  async getTokens(code: string, userId: string, dashboardId: string): Promise<ISpotifyToken> {
    try {
      // Tokens von Spotify holen
      //expiresIn is the time in seconds until the token expires
      const { accessToken, refreshToken, expiresIn } = await this.spotifyRepository.getTokens(
        code,
        userId,
        dashboardId
      );

      // Token Entity erstellen
      const token = new Token(
        accessToken,
        refreshToken,
        new Date(Date.now() + expiresIn),
        userId,
        dashboardId,
        SERVICES.SPOTIFY
      );

      // Token speichern
      await this.tokenRepository.create(token as ITokenDocument);

      return { accessToken, refreshToken, expiresIn };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get Spotify tokens: ${error.message}`);
      }
      throw new Error("Failed to get Spotify tokens");
    }
  }

  async refreshAccessToken(refreshToken: string, userId: string, dashboardId: string): Promise<ISpotifyToken> {
    try {
      return this.spotifyRepository.refreshAccessToken(refreshToken);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.SPOTIFY);
          throw new Error("Spotify access token is invalid. Token deleted.");
        }
      }
      throw new Error(`Failed to refresh Spotify access token`);
    }
  }

  async ensureValidAccessToken(userId: string, dashboardId: string): Promise<string> {
    // Token aus der Datenbank holen
    const token = await this.tokenRepository.findToken(userId, dashboardId, SERVICES.SPOTIFY);

    if (!token) {
      throw new Error(`Kein Token für Nutzer ${userId} und Dashboard ${dashboardId} gefunden.`);
    }

    const { accessToken, refreshToken, expiration } = token;

    // Prüfen, ob das Token gültig ist
    if (new Date() < expiration) {
      console.log(`Access Token für Nutzer ${userId} ist noch gültig.`);
      return accessToken; // Token ist gültig
    }

    const { accessToken: newAccessToken, expiresIn: newExpiresIn } = await this.refreshAccessToken(
      refreshToken,
      userId,
      dashboardId
    );

    const newExpirationDate = new Date(Date.now() + newExpiresIn * 1000); // expiresIn ist in Sekunden
    // Aktualisiere das Token in der Datenbank
    await this.tokenRepository.updateAccessToken(token.id, newAccessToken, newExpirationDate);

    console.log(`Access Token für Nutzer ${userId} erfolgreich aktualisiert.`);
    return newAccessToken;
  }
}
