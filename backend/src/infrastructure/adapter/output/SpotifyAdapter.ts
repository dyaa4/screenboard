import { SpotifyRepository } from "../../../domain/repositories/SpotifyRepository";
import { ISpotifyToken } from "../../../domain/types/ISpotifyToken";
import { SpotifyTokenDto } from "../../../infrastructure/dtos/SpotifyTokenDto";
import axios from "axios";
import logger from "../../../utils/logger";

export class SpotifyAdapter implements SpotifyRepository {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      console.warn("Spotify environment variables are not set correctly. Spotify integration will not work.");
    }
  }

  async getTokens(code: string): Promise<ISpotifyToken> {
    const timer = logger.startTimer('Spotify API Token Request');

    try {
      logger.apiCall('Spotify', '/api/token', 'POST');

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64"),
          },
        }
      );
      const SpotifyToken: SpotifyTokenDto = response.data;

      logger.apiCall('Spotify', '/api/token', 'POST', response.status);
      logger.success('Spotify tokens received', { expiresIn: SpotifyToken.expires_in }, 'SpotifyAdapter');

      timer();
      return {
        accessToken: SpotifyToken.access_token,
        refreshToken: SpotifyToken.refresh_token,
        expiresIn: SpotifyToken.expires_in,
      };
    } catch (error) {
      logger.error('Spotify token request failed', error as Error, 'SpotifyAdapter');
      logger.apiCall('Spotify', '/api/token', 'POST', (error as any).response?.status);
      throw new Error("Failed to get Spotify tokens");
    }
  }

  async saveActiveDevice(deviceId: string, _userId: string, _dashboardId: string, spotifyAccessToken: string): Promise<void> {
    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      });
    } catch (error) {
      console.error("Error setting active device:", error);
      throw error;
    }
  }

  getLoginUrl(): string {
    const scopes = "user-read-private user-read-email";
    return (
      "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      this.clientId +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(this.redirectUri)
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<ISpotifyToken> {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64"),
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      const spotifyToken: ISpotifyToken = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      };
      return spotifyToken;
    } catch (error) {
      throw error;
    }
  }

  async login(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const tokens = await this.getTokens(code);
      return tokens;
    } catch (error) {
      console.error("Error during Spotify login:", error);
      throw new Error("Failed to login with Spotify");
    }
  }
}
