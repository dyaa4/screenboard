import { MicrosoftRepository } from "../../domain/repositories/MicrosoftRepository";
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository";
import { SERVICES } from "../../domain/valueObjects/serviceToken";
import { IMicrosoftToken } from "../../domain/types/IMicrosoftToken";
import { ITokenDocument } from "../../domain/types/ITokenDocument";
import { Token } from "../../domain/entities/Token";
import { MicrosoftEventDTO } from "../../infrastructure/dtos/MicrosoftEventDTO";
import { MicrosoftCalendarListDto } from "../../infrastructure/dtos/MicrosoftCalendarListDTO";
import { MicrosoftUserInfoDTO } from "../../infrastructure/dtos/MicrosoftUserInfoDTO";

/**
 * MicrosoftService - Application Layer
 * Handles Microsoft Calendar authentication, event fetching, and token management
 * Follows Hexagonal Architecture pattern
 */
export class MicrosoftService {
  constructor(
    private microsoftRepository: MicrosoftRepository,
    private tokenRepository: TokenRepository,
  ) { }

  /**
   * Handle Microsoft OAuth authorization code exchange
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @param code Authorization code from Microsoft OAuth
   */
  async handleMicrosoftAuthCode(
    userId: string,
    dashboardId: string,
    code: string
  ): Promise<void> {
    const microsoftTokens = await this.microsoftRepository.exchangeAuthCodeForTokens(code);
    const { accessToken, refreshToken, expiresIn } = microsoftTokens;

    // Create Token Entity
    const token = new Token(
      accessToken,
      refreshToken,
      new Date(expiresIn), // Use expiresIn directly like in GoogleService
      userId,
      dashboardId,
      SERVICES.MICROSOFT,
    );

    // Save to database
    await this.tokenRepository.create(token as ITokenDocument);
  }

  /**
   * Get Microsoft Calendar login status
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @returns Boolean indicating if user is logged in
   */
  async getLoginStatus(userId: string, dashboardId: string): Promise<boolean> {
    const token = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.MICROSOFT
    );
    return !!token;
  }

  /**
   * Logout from Microsoft Calendar
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   */
  async logout(userId: string, dashboardId: string): Promise<void> {
    try {
      const token = await this.tokenRepository.findToken(
        userId,
        dashboardId,
        SERVICES.MICROSOFT
      );

      if (token && token.accessToken) {
        // Revoke token at Microsoft
        try {
          await this.microsoftRepository.revokeToken(token.accessToken);
        } catch (error) {
          console.warn('Failed to revoke Microsoft token:', error);
        }
      }

      // Delete token from database
      await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.MICROSOFT);
    } catch (error) {
      console.error('Error during Microsoft logout:', error);
      throw error;
    }
  }

  /**
   * Fetch Microsoft Calendar events
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @param calendarId Microsoft Calendar ID
   * @returns Array of Microsoft Calendar events
   */
  async fetchMicrosoftCalendarEvents(
    userId: string,
    dashboardId: string,
    calendarId: string
  ): Promise<MicrosoftEventDTO[]> {
    const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
    return await this.microsoftRepository.fetchCalendarEvents(accessToken, calendarId);
  }

  /**
   * Fetch Microsoft user calendars
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @returns List of user's Microsoft calendars
   */
  async fetchMicrosoftUserCalendars(
    userId: string,
    dashboardId: string
  ): Promise<MicrosoftCalendarListDto> {
    const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
    return await this.microsoftRepository.fetchUserCalendars(accessToken);
  }

  /**
   * Fetch Microsoft user information
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @returns Microsoft user profile information
   */
  async fetchUserInfo(
    userId: string,
    dashboardId: string
  ): Promise<MicrosoftUserInfoDTO> {
    const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
    return await this.microsoftRepository.fetchUserInfo(accessToken);
  }

  /**
   * Ensure valid access token, refresh if necessary
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @returns Valid access token
   */
  private async ensureValidAccessToken(
    userId: string,
    dashboardId: string
  ): Promise<string> {
    const token = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.MICROSOFT
    );

    if (!token) {
      throw new Error('Microsoft token not found. User needs to authenticate.');
    }

    const { accessToken, refreshToken, expiration } = token;

    // Check if token is still valid
    if (new Date() < expiration) {
      return accessToken; // Token is still valid
    }

    // Refresh the token
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } =
      await this.refreshAccessToken(userId, dashboardId, refreshToken);

    // Update token in database
    await this.tokenRepository.updateAccessToken(
      token.id,
      newAccessToken,
      new Date(expiresIn),
      newRefreshToken
    );

    return newAccessToken;
  }

  /**
   * Refresh Microsoft access token
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @param refreshToken Refresh token
   * @returns New token information
   */
  async refreshAccessToken(
    userId: string,
    dashboardId: string,
    refreshToken: string
  ): Promise<IMicrosoftToken> {
    try {
      return await this.microsoftRepository.refreshAccessToken(refreshToken);
    } catch (error) {
      // If refresh token is invalid, delete the token
      await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.MICROSOFT);
      throw new Error("Microsoft refresh token is invalid or expired. Re-authentication required.");
    }
  }
}