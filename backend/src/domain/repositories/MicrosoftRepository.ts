import { MicrosoftEventDTO, MicrosoftTokenDTO } from "../../infrastructure/dtos/MicrosoftEventDTO";
import { MicrosoftCalendarListDto } from "../../infrastructure/dtos/MicrosoftCalendarListDTO";
import { MicrosoftUserInfoDTO } from "../../infrastructure/dtos/MicrosoftUserInfoDTO";

/**
 * Microsoft Repository Interface - Domain Layer
 * Defines contracts for Microsoft Calendar operations
 * Part of Hexagonal Architecture - Domain Layer
 */
export interface MicrosoftRepository {
  /**
   * Exchange authorization code for access and refresh tokens
   * @param code Authorization code from Microsoft OAuth
   * @returns Microsoft tokens
   */
  exchangeAuthCodeForTokens(code: string): Promise<MicrosoftTokenDTO>;

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token
   * @returns New Microsoft tokens
   */
  refreshAccessToken(refreshToken: string): Promise<MicrosoftTokenDTO>;

  /**
   * Revoke Microsoft access token
   * @param accessToken Access token to revoke
   */
  revokeToken(accessToken: string): Promise<void>;

  /**
   * Fetch calendar events from Microsoft Graph API
   * @param accessToken Valid access token
   * @param calendarId Microsoft Calendar ID
   * @returns Array of Microsoft calendar events
   */
  fetchCalendarEvents(accessToken: string, calendarId: string): Promise<MicrosoftEventDTO[]>;

  /**
   * Fetch user's calendars from Microsoft Graph API
   * @param accessToken Valid access token
   * @returns List of user's Microsoft calendars
   */
  fetchUserCalendars(accessToken: string): Promise<MicrosoftCalendarListDto>;

  /**
   * Fetch user information from Microsoft Graph API
   * @param accessToken Valid access token
   * @returns Microsoft user profile information
   */
  fetchUserInfo(accessToken: string): Promise<MicrosoftUserInfoDTO>;
}