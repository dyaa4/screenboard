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
import { IEventSubscriptionData } from "../../domain/types/IEventSubscriptionDocument";
import logger from "../../utils/logger";

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
   * Refreshes all subscriptions for a user - deletes old ones and prepares for fresh ones
   */
  async refreshUserSubscriptions(
    userId: string,
    dashboardId: string,
    newAccessToken: string
  ): Promise<void> {
    logger.info(`🔄 Refreshing Microsoft subscriptions for user ${userId}`);

    try {
      // 1. Get all active Microsoft subscriptions for this user
      const activeSubscriptions = await this.eventSubscriptionRepository.findByUserAndDashboard(
        userId,
        dashboardId
      );

      // Filter only Microsoft subscriptions
      const microsoftSubscriptions = activeSubscriptions.filter(sub =>
        sub.serviceId === SERVICES.MICROSOFT
      );

      if (microsoftSubscriptions.length === 0) {
        logger.info(`✅ No active Microsoft subscriptions found for user ${userId}`);
        return;
      }

      logger.info(`🗑️ Cleaning up ${microsoftSubscriptions.length} existing Microsoft subscriptions`);

      // 2. Delete subscriptions at Microsoft (parallel for better performance)
      const deletePromises = microsoftSubscriptions.map(async (subscription) => {
        try {
          if (subscription.resourceId) {
            await this.microsoftRepository.deleteSubscription(
              newAccessToken,
              subscription.resourceId
            );
            logger.info(`✅ Deleted Microsoft subscription ${subscription.resourceId}`);
          }
        } catch (error) {
          logger.warn(`⚠️ Failed to delete Microsoft subscription ${subscription.resourceId}:`, error as Error);
          // Don't throw - we still want to clean from database
        }
      });

      await Promise.allSettled(deletePromises);

      // 3. Remove Microsoft subscriptions from database
      for (const subscription of microsoftSubscriptions) {
        if (subscription.resourceId) {
          await this.eventSubscriptionRepository.deleteByResourceId(subscription.resourceId);
        }
      }

      logger.info(`✅ Successfully refreshed Microsoft subscriptions for user ${userId}`);

    } catch (error) {
      logger.error(`❌ Failed to refresh Microsoft subscriptions for user ${userId}:`, error as Error);
      throw error;
    }
  }

  /**
   * Emergency cleanup when no valid token is available
   */
  private async emergencyCleanup(userId: string, dashboardId: string): Promise<void> {
    logger.warn(`🚨 Emergency cleanup for Microsoft subscriptions: user ${userId}`);

    const activeSubscriptions = await this.eventSubscriptionRepository.findByUserAndDashboard(
      userId,
      dashboardId
    );

    const microsoftSubscriptions = activeSubscriptions.filter(sub =>
      sub.serviceId === SERVICES.MICROSOFT
    );

    for (const subscription of microsoftSubscriptions) {
      if (subscription.resourceId) {
        await this.eventSubscriptionRepository.deleteByResourceId(subscription.resourceId);
      }
    }

    logger.info(`✅ Emergency cleanup completed: removed ${microsoftSubscriptions.length} Microsoft subscriptions`);
  }

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

    // Clean up any existing subscriptions before setting up new ones
    await this.refreshUserSubscriptions(userId, dashboardId, microsoftTokens.accessToken);
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
    // Try to refresh subscriptions with current token (cleanup at Microsoft)
    try {
      const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
      await this.refreshUserSubscriptions(userId, dashboardId, accessToken);
    } catch (error) {
      logger.warn(`⚠️ Could not cleanup Microsoft subscriptions with valid token, doing emergency cleanup:`, error as Error);
      // Emergency cleanup - just remove from database
      await this.emergencyCleanup(userId, dashboardId);
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
      throw new Error('MICROSOFT_REAUTH_REQUIRED: Microsoft Calendar token not found. Please sign in again to restore access.');
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
      (token._id as any).toString(),
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
      logger.debug('Attempting Microsoft token refresh',
        { userId, tokenLength: refreshToken.length }, 'MicrosoftService');

      return await this.microsoftRepository.refreshAccessToken(refreshToken);
    } catch (error: any) {
      logger.error('Microsoft token refresh failed',
        { userId, error: error.response?.data || error.message }, 'MicrosoftService');

      // CRITICAL: Cleanup subscriptions BEFORE deleting token (while we still have access)
      try {
        logger.info('Cleaning up Microsoft subscriptions due to token expiration',
          { userId, dashboardId }, 'MicrosoftService');
        await this.cleanupSubscriptionsOnTokenExpiration(userId, dashboardId);
      } catch (cleanupError) {
        logger.warn('Failed to cleanup Microsoft subscriptions on token expiration but continuing',
          { userId, dashboardId, error: (cleanupError as Error).message }, 'MicrosoftService');
      }

      // Delete the expired token from database
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

    try {
      const subscription = await this.microsoftRepository.subscribeToCalendarEvents(
        tokenDocument.accessToken,
        calendarId,
        userId,
        dashboardId
      );

      // Save subscription to our database for tracking
      const subscriptionData = {
        userId,
        dashboardId,
        serviceId: SERVICES.MICROSOFT,
        targetId: calendarId,
        resourceId: subscription.id, // Microsoft uses 'id' as resourceId
        expiration: new Date(subscription.expirationDateTime),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.eventSubscriptionRepository.create(subscriptionData as IEventSubscriptionData);

      logger.info(`✅ Microsoft calendar subscription saved to database`, {
        userId,
        dashboardId,
        calendarId,
        subscriptionId: subscription.id
      });

      return subscription;
    } catch (error) {
      logger.error("Error subscribing to Microsoft calendar events:", error as Error);
      throw new Error("Failed to subscribe to Microsoft Calendar events.");
    }
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

    logger.info('Processing Microsoft Calendar webhook', {
      subscriptionId,
      changeType,
      resource,
      clientState
    }, 'MicrosoftService');

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

  /**
   * Cleanup Microsoft subscriptions when token expires
   * Since token is expired, we can only cleanup local DB records
   * Microsoft Graph will automatically deactivate the subscriptions after 3 days
   */
  private async cleanupSubscriptionsOnTokenExpiration(userId: string, dashboardId: string): Promise<void> {
    try {
      // Get all Microsoft Calendar subscriptions for this user/dashboard
      const subscriptions = await this.eventSubscriptionRepository.findByUserAndDashboard(
        userId,
        dashboardId
      );

      // Filter for Microsoft subscriptions
      const microsoftSubscriptions = subscriptions.filter((sub: any) =>
        sub.serviceId === SERVICES.MICROSOFT
      );

      logger.info(`Token expiration cleanup: Found ${microsoftSubscriptions.length} Microsoft subscriptions`,
        { userId, dashboardId, count: microsoftSubscriptions.length }, 'MicrosoftService');

      // Delete local subscription records (Microsoft Graph will auto-cleanup after 3 days)
      for (const subscription of microsoftSubscriptions) {
        if (subscription.resourceId) {
          try {
            await this.eventSubscriptionRepository.deleteByResourceId(subscription.resourceId);
            logger.debug('Local Microsoft subscription record cleaned up',
              { subscriptionId: subscription.resourceId, userId, dashboardId }, 'MicrosoftService');
          } catch (error) {
            logger.warn('Failed to cleanup local subscription record but continuing',
              { subscriptionId: subscription.resourceId, error: (error as Error).message }, 'MicrosoftService');
          }
        }
      }

      logger.success('Microsoft subscription local cleanup completed due to token expiration',
        { userId, dashboardId, cleanedCount: microsoftSubscriptions.length }, 'MicrosoftService');
    } catch (error) {
      logger.error('Error during Microsoft subscription cleanup on token expiration',
        error as Error, 'MicrosoftService');
      // Don't throw - token cleanup should not be blocked
    }
  }
}