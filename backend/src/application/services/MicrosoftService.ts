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

  private tokenExpirationCleanupJobs: Map<string, NodeJS.Timeout> = new Map();
  private readonly CLEANUP_BEFORE_EXPIRATION = 60 * 60 * 1000; // 60 Minuten vor Token-Expiration
  // Microsoft Refresh-Token Lifespan: ~90 Tage (standard für Microsoft Graph)
  private readonly MICROSOFT_REFRESH_TOKEN_LIFESPAN = 90 * 24 * 60 * 60 * 1000; // 90 Tage

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
    const createdToken = await this.tokenRepository.create(token as ITokenDocument);

    // Schedule proactive cleanup before refresh token expires (based on creation time)
    const creationDate = createdToken.createdAt || new Date();
    this.scheduleRefreshTokenExpirationCleanup(userId, dashboardId, creationDate);
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
      logger.info('Microsoft subscription cleanup started',
        { userId, dashboardId }, 'MicrosoftService');

      // Get access token
      const token = await this.tokenRepository.findToken(
        userId,
        dashboardId,
        SERVICES.MICROSOFT
      );

      if (!token || !token.accessToken) {
        logger.warn('No Microsoft token found for cleanup',
          { userId, dashboardId }, 'MicrosoftService');
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

      logger.info(`Found ${microsoftSubscriptions.length} Microsoft subscriptions to cleanup`,
        { userId, dashboardId, count: microsoftSubscriptions.length }, 'MicrosoftService');

      // Delete each subscription from Microsoft Graph
      for (const subscription of microsoftSubscriptions) {
        if (!subscription.resourceId) {
          logger.warn('Subscription missing resourceId, skipping',
            { subscription }, 'MicrosoftService');
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

          logger.success('Microsoft subscription cleaned up successfully',
            { subscriptionId: subscription.resourceId, userId, dashboardId }, 'MicrosoftService');
        } catch (error) {
          logger.warn('Failed to cleanup Microsoft subscription but continuing',
            { subscriptionId: subscription.resourceId, error: (error as Error).message }, 'MicrosoftService');
          // Continue with other subscriptions even if one fails
        }
      }

      logger.success('Microsoft subscription cleanup completed',
        { userId, dashboardId, processedCount: microsoftSubscriptions.length }, 'MicrosoftService');

      // Clear expiration cleanup jobs
      const cleanupJobKey = `cleanup-${userId}-${dashboardId}`;
      const cleanupJob = this.tokenExpirationCleanupJobs.get(cleanupJobKey);
      if (cleanupJob) {
        clearTimeout(cleanupJob);
        this.tokenExpirationCleanupJobs.delete(cleanupJobKey);
      }
    } catch (error) {
      logger.error('Error during Microsoft subscription cleanup', error as Error, 'MicrosoftService');
      // Don't throw - cleanup should not block logout
    }
  }

  /**
   * Schedule proactive subscription cleanup 60 minutes before refresh token expires
   */
  private scheduleRefreshTokenExpirationCleanup(
    userId: string,
    dashboardId: string,
    tokenCreationDate: Date
  ): void {
    const cleanupJobKey = `cleanup-${userId}-${dashboardId}`;

    // Clear existing cleanup job
    const existingCleanupJob = this.tokenExpirationCleanupJobs.get(cleanupJobKey);
    if (existingCleanupJob) {
      clearTimeout(existingCleanupJob);
    }

    // Calculate estimated refresh token expiration based on creation date
    const estimatedRefreshExpiration = new Date(
      tokenCreationDate.getTime() + this.MICROSOFT_REFRESH_TOKEN_LIFESPAN
    );

    const cleanupTime = estimatedRefreshExpiration.getTime() - this.CLEANUP_BEFORE_EXPIRATION;
    const now = Date.now();

    if (cleanupTime <= now) {
      logger.warn('Microsoft refresh token expires very soon, cleaning up immediately',
        { userId, dashboardId, estimatedRefreshExpiration }, 'MicrosoftService');
      this.performProactiveCleanup(userId, dashboardId);
      return;
    }

    const timeUntilCleanup = cleanupTime - now;
    const daysUntilCleanup = Math.floor(timeUntilCleanup / (24 * 60 * 60 * 1000));

    logger.info('Scheduled Microsoft proactive cleanup based on refresh token expiration',
      { userId, dashboardId, daysUntilCleanup, estimatedRefreshExpiration }, 'MicrosoftService');

    const cleanupJob = setTimeout(async () => {
      await this.performProactiveCleanup(userId, dashboardId);
    }, timeUntilCleanup);

    this.tokenExpirationCleanupJobs.set(cleanupJobKey, cleanupJob);
  }

  /**
   * Perform proactive Microsoft cleanup while refresh token is still valid
   */
  private async performProactiveCleanup(userId: string, dashboardId: string): Promise<void> {
    logger.info('Starting proactive Microsoft subscription cleanup (refresh token expires in 60min)',
      { userId, dashboardId }, 'MicrosoftService');

    try {
      await this.cleanup(userId, dashboardId);
      logger.success('Proactive Microsoft subscription cleanup completed',
        { userId, dashboardId }, 'MicrosoftService');
    } catch (error) {
      logger.error('Proactive Microsoft subscription cleanup failed',
        error as Error, 'MicrosoftService');
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

    // Schedule new proactive cleanup for refreshed token (keep original creation date for refresh token expiration)
    const originalCreationDate = token.createdAt || new Date();
    this.scheduleRefreshTokenExpirationCleanup(userId, dashboardId, originalCreationDate);

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