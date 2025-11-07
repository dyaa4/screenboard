import { MicrosoftRepository } from "../../domain/repositories/MicrosoftRepository";
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository";
import { EventSubscriptionRepository } from "../../infrastructure/repositories/EventSubscription";
import { SERVICES } from "../../domain/valueObjects/serviceToken";
import { IMicrosoftToken } from "../../domain/types/IMicrosoftToken";
import { ITokenDocument } from "../../domain/types/ITokenDocument";
import { Token } from "../../domain/entities/Token";
import { MicrosoftEventDTO } from "../../infrastructure/dtos/MicrosoftEventDTO";
import { MicrosoftCalendarListDto } from "../../infrastructure/dtos/MicrosoftCalendarListDTO";
import { MicrosoftUserInfoDTO } from "../../infrastructure/dtos/MicrosoftUserInfoDTO";
import { MicrosoftSubscriptionDTO } from "../../infrastructure/dtos/MicrosoftSubscriptionDTO";
import { emitToUserDashboard } from "../../infrastructure/server/socketIo";

/**
 * MicrosoftService - Application Layer
 * Handles Microsoft Calendar authentication, event fetching, and token management
 * Follows Hexagonal Architecture pattern
 */
export class MicrosoftService {
  constructor(
    private microsoftRepository: MicrosoftRepository,
    private tokenRepository: TokenRepository,
    private eventSubscriptionRepository: EventSubscriptionRepository,
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

    // Calculate expiration date: current time + expiresIn seconds
    const expirationDate = new Date(Date.now() + (expiresIn * 1000));

    // Create Token Entity
    const token = new Token(
      accessToken,
      refreshToken,
      expirationDate,
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
        // Clean up subscriptions before logout
        await this.cleanup(userId, dashboardId);

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
   * Cleanup Microsoft subscriptions for a user/dashboard
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   */
  async cleanup(userId: string, dashboardId: string): Promise<void> {
    try {
      console.log(`🧹 Starting Microsoft subscription cleanup for user ${userId}, dashboard ${dashboardId}`);
      
      // Get access token
      const token = await this.tokenRepository.findToken(
        userId,
        dashboardId,
        SERVICES.MICROSOFT
      );

      if (!token || !token.accessToken) {
        console.log('⚠️ No Microsoft token found for cleanup');
        return;
      }

      // Get all Microsoft Calendar subscriptions for this user/dashboard
      const subscriptions = await this.eventSubscriptionRepository.findByUserAndDashboard(
        userId,
        dashboardId
      );

      // Filter for Microsoft subscriptions (identified by serviceId)
      const microsoftSubscriptions = subscriptions.filter((sub: any) => 
        sub.serviceId === SERVICES.MICROSOFT && sub.resourceId
      );

      console.log(`🔍 Found ${microsoftSubscriptions.length} Microsoft subscriptions to cleanup`);

      // Delete each subscription from Microsoft Graph
      for (const subscription of microsoftSubscriptions) {
        if (!subscription.resourceId) {
          console.warn('⚠️ Subscription missing resourceId, skipping:', subscription);
          continue;
        }
        
        try {
          // Use resourceId as subscriptionId for Microsoft Graph
          await this.microsoftRepository.deleteSubscription(
            token.accessToken,
            subscription.resourceId
          );
          
          // Remove from our database - use deleteByResourceId method
          await this.eventSubscriptionRepository.deleteByResourceId(subscription.resourceId);
          
          console.log(`✅ Cleaned up Microsoft subscription: ${subscription.resourceId}`);
        } catch (error) {
          console.error(`❌ Failed to cleanup Microsoft subscription ${subscription.resourceId}:`, error);
          // Continue with other subscriptions even if one fails
        }
      }

      console.log(`🎉 Microsoft subscription cleanup completed`);
    } catch (error) {
      console.error('Error during Microsoft subscription cleanup:', error);
      // Don't throw - cleanup should not block logout
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

    // Calculate new expiration date
    const newExpirationDate = new Date(Date.now() + (expiresIn * 1000));

    // Update token in database
    await this.tokenRepository.updateAccessToken(
      token.id,
      newAccessToken,
      newExpirationDate,
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
      // Debug: Log refresh token info (first/last 10 chars for security)
      console.log(`🔄 Attempting Microsoft token refresh for user ${userId}`);
      console.log(`🔑 Refresh token format: ${refreshToken.substring(0, 10)}...${refreshToken.substring(refreshToken.length - 10)}`);
      console.log(`📏 Refresh token length: ${refreshToken.length}`);

      return await this.microsoftRepository.refreshAccessToken(refreshToken);
    } catch (error: any) {
      console.log(`❌ Microsoft token refresh failed:`, error.response?.data || error.message);

      // If refresh token is invalid, delete the token and provide specific error
      await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.MICROSOFT);

      // Pass through specific error types for better error handling
      if (error.message.includes('INVALID_REFRESH_TOKEN')) {
        throw new Error("MICROSOFT_REAUTH_REQUIRED: Your Microsoft Calendar access has expired. Please sign in again to continue.");
      } else if (error.message.includes('INVALID_CLIENT')) {
        throw new Error("MICROSOFT_CONFIG_ERROR: Microsoft OAuth configuration error. Please contact support.");
      } else {
        throw new Error("MICROSOFT_REFRESH_FAILED: Unable to refresh Microsoft Calendar access. Re-authentication required.");
      }
    }
  }

  /**
   * Subscribe to Microsoft Calendar events using Microsoft Graph subscriptions
   * @param userId User identifier
   * @param dashboardId Dashboard identifier
   * @param calendarId Calendar identifier
   * @returns Subscription details
   */
  async subscribeToCalendarEvents(
    userId: string,
    dashboardId: string,
    calendarId: string
  ): Promise<MicrosoftSubscriptionDTO> {
    const tokenDocument = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.MICROSOFT
    );

    if (!tokenDocument) {
      throw new Error("Microsoft Calendar authentication required");
    }

    return await this.microsoftRepository.subscribeToCalendarEvents(
      tokenDocument.accessToken,
      calendarId,
      userId,
      dashboardId
    );
  }

  /**
   * Process Microsoft Graph webhook notification
   * @param webhookData Webhook notification data
   */
  async handleCalendarWebhook(webhookData: {
    subscriptionId: string;
    changeType: string;
    resource: string;
    clientState?: string;
  }): Promise<void> {
    const { subscriptionId, changeType, resource, clientState } = webhookData;

    if (!subscriptionId || !changeType || !resource) {
      throw new Error("Webhook data is missing required fields");
    }

    console.log('Processing Microsoft Calendar webhook:', {
      subscriptionId,
      changeType,
      resource,
      clientState
    });

    // clientState contains userIdWithoutAuth0-dashboardId
    if (clientState) {
      emitToUserDashboard(clientState, "microsoft-calendar-event", {
        changeType,
        resource,
        subscriptionId,
        timestamp: new Date().toISOString(),
      });
    }
  }
}