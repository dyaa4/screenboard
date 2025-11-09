import { GoogleUserInfoDTO } from "../../infrastructure/dtos/GoogleUserInfoDTO"
import { GoogleRepository } from "../../domain/repositories/GoogleRepository"
import {
  GoogleEventDTO,
  GoogleSubscriptionDTO,
} from "../../infrastructure/dtos/GoogleEventDTO"
import { GoogleCalendarListDto } from "../../infrastructure/dtos/GoogleCalendarListDTO"
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository"
import { EventSubscriptionRepository } from "../../infrastructure/repositories/EventSubscription"
import { SERVICES } from "../../domain/valueObjects/serviceToken"
import { IGoogleToken } from "../../domain/types/IGoogleToken"
import { ITokenDocument } from "../../domain/types/ITokenDocument"
import { Token } from "../../domain/entities/Token"
import { emitToUserDashboard } from "../../infrastructure/server/socketIo"
import { IEventSubscriptionData } from "../../domain/types/IEventSubscriptionDocument"
import logger from "../../utils/logger"

export class GoogleService {
  constructor(
    private googleRepository: GoogleRepository,
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
    logger.info(`🔄 Refreshing Google subscriptions for user ${userId}`);

    try {
      // 1. Get all active Google subscriptions for this user
      const activeSubscriptions = await this.eventSubscriptionRepository.findByUserAndDashboard(
        userId,
        dashboardId
      );

      // Filter only Google subscriptions
      const googleSubscriptions = activeSubscriptions.filter(sub =>
        sub.serviceId === SERVICES.GOOGLE
      ); if (googleSubscriptions.length === 0) {
        logger.info(`✅ No active Google subscriptions found for user ${userId}`);
        return;
      }

      logger.info(`🗑️ Cleaning up ${googleSubscriptions.length} existing Google subscriptions`);

      // 2. Delete subscriptions at Google (parallel for better performance)
      const deletePromises = googleSubscriptions.map(async (subscription) => {
        try {
          if (subscription.resourceId) {
            await this.googleRepository.stopSubscriptionPublic(
              newAccessToken,
              subscription.resourceId,
              userId,
              dashboardId
            );
            logger.info(`✅ Deleted Google subscription ${subscription.resourceId}`);
          }
        } catch (error) {
          logger.warn(`⚠️ Failed to delete Google subscription ${subscription.resourceId}:`, error as Error);
          // Don't throw - we still want to clean from database
        }
      });

      await Promise.allSettled(deletePromises);

      // 3. Remove Google subscriptions from database
      for (const subscription of googleSubscriptions) {
        if (subscription.resourceId) {
          await this.eventSubscriptionRepository.deleteByResourceId(subscription.resourceId);
        }
      }

      logger.info(`✅ Successfully refreshed Google subscriptions for user ${userId}`);

    } catch (error) {
      logger.error(`❌ Failed to refresh Google subscriptions for user ${userId}:`, error as Error);
      throw error;
    }
  }





  // Cleanup-Methode beim Ausloggen oder Beenden
  async cleanup(userId: string, dashboardId: string): Promise<void> {
    logger.info(`🧹 Google cleanup for user ${userId}`);

    // Just call logout - logout handles everything
    await this.logout(userId, dashboardId);
  }

  /**
   * Emergency cleanup when no valid token is available
   */
  private async emergencyCleanup(userId: string, dashboardId: string): Promise<void> {
    logger.warn(`🚨 Emergency cleanup for Google subscriptions: user ${userId}`);

    const activeSubscriptions = await this.eventSubscriptionRepository.findByUserAndDashboard(
      userId,
      dashboardId
    );

    const googleSubscriptions = activeSubscriptions.filter(sub =>
      sub.serviceId === SERVICES.GOOGLE
    );

    for (const subscription of googleSubscriptions) {
      if (subscription.resourceId) {
        await this.eventSubscriptionRepository.deleteByResourceId(subscription.resourceId);
      }
    }

    logger.info(`✅ Emergency cleanup completed: removed ${googleSubscriptions.length} Google subscriptions`);
  }


  async handleGoogleAuthCode(
    userId: string,
    dashboardId: string,
    code: string
  ): Promise<void> {
    const timer = logger.startTimer('Google Auth Code Exchange');

    try {
      logger.service('GoogleService', 'handleAuthCode', true, undefined, { userId, dashboardId });
      logger.apiCall('Google', '/oauth2/token', 'POST');

      const googleTokens = await this.googleRepository.exchangeAuthCodeForTokens(code);

      // the expiresIn is in ms
      const { accessToken, refreshToken, expiresIn } = googleTokens;

      // Clean up any existing subscriptions before setting up new ones
      await this.refreshUserSubscriptions(userId, dashboardId, accessToken);

      logger.token('create', 'Google', userId);

      // Token Entity erstellen
      const token = new Token(
        accessToken,
        refreshToken,
        new Date(expiresIn),
        userId,
        dashboardId,
        SERVICES.GOOGLE
      );

      // Token speichern
      await this.tokenRepository.create(token as ITokenDocument);



      logger.success('Google auth code processed successfully', { userId, dashboardId }, 'GoogleService');
      timer();
    } catch (error) {
      logger.error('Google auth code processing failed', error as Error, 'GoogleService');
      logger.service('GoogleService', 'handleAuthCode', false);
      throw error;
    }
  }

  async getEvents(
    userId: string,
    dashboardId: string,
    calendarId: string
  ): Promise<GoogleEventDTO[]> {
    const googleAccessToken = await this.ensureValidAccessToken(
      userId,
      dashboardId
    )
    const eventsDTOs: GoogleEventDTO[] =
      await this.googleRepository.fetchEvents(googleAccessToken, calendarId)
    return eventsDTOs
  }

  async subscribeToCalendarEvents(
    userId: string,
    dashboardId: string,
    calendarId: string
  ): Promise<GoogleSubscriptionDTO> {
    const googleAccessToken = await this.ensureValidAccessToken(userId, dashboardId);

    try {
      const subscription = await this.googleRepository.subscribeToCalendarEvents(
        googleAccessToken,
        calendarId,
        userId,
        dashboardId
      );

      // Save subscription to our database for tracking
      const subscriptionData = {
        userId,
        dashboardId,
        serviceId: SERVICES.GOOGLE,
        targetId: calendarId,
        resourceId: subscription.resourceId,
        expiration: new Date(subscription.expiration),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.eventSubscriptionRepository.create(subscriptionData as IEventSubscriptionData);

      logger.info(`✅ Google calendar subscription saved to database`, {
        userId,
        dashboardId,
        calendarId,
        resourceId: subscription.resourceId
      });

      return subscription;
    } catch (error) {
      console.error("Error subscribing to calendar events:", error);
      throw new Error("Failed to subscribe to Google Calendar events.");
    }
  }

  async getUserInfo(
    userId: string,
    dashboardId: string
  ): Promise<GoogleUserInfoDTO> {
    const googleAccessToken = await this.ensureValidAccessToken(
      userId,
      dashboardId
    )
    return await this.googleRepository.fetchUserInfo(googleAccessToken)
  }

  async getCalendars(
    userId: string,
    dashboardId: string
  ): Promise<GoogleCalendarListDto> {
    const googleAccessToken = await this.ensureValidAccessToken(
      userId,
      dashboardId
    )
    return await this.googleRepository.fetchUserCalendars(googleAccessToken)
  }

  async refreshAccessToken(
    userId: string,
    dashboard: string,
    refreshToken: string
  ): Promise<IGoogleToken> {
    try {
      return await this.googleRepository.refreshAccessToken(refreshToken)
    } catch (error) {
      // Wenn der Refresh-Token ungültig ist, löschen wir das Token
      await this.tokenRepository.deleteToken(userId, dashboard, SERVICES.GOOGLE)
      throw new Error("Refresh token of Google is invalid or expired.re-authenticate.");
    }
  }

  async getLoginStatus(userId: string, dashboardId: string): Promise<boolean> {
    const token = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.GOOGLE
    )
    return !!token
  }

  async logout(userId: string, dashboardId: string): Promise<void> {
    try {
      logger.info(`🚪 Google logout for user ${userId}`);

      // Cleanup subscriptions (if not already done by cleanup())
      try {
        const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
        await this.refreshUserSubscriptions(userId, dashboardId, accessToken);
      } catch (error) {
        logger.warn(`⚠️ Could not cleanup Google subscriptions during logout, doing emergency cleanup:`, error as Error);
        await this.emergencyCleanup(userId, dashboardId);
      }

    } catch (error) {
      logger.error('Error during Google logout:', error as Error);
    }

    // Always delete token and subscriptions from database
    await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.GOOGLE);
    await this.eventSubscriptionRepository.deleteAllForUserDashboard(userId, dashboardId);
  }

  // Methode, um sicherzustellen, dass das Access Token gültig ist
  async ensureValidAccessToken(
    userId: string,
    dashboardId: string
  ): Promise<string> {
    // Token aus der Datenbank holen
    const token = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.GOOGLE
    )

    if (!token) {
      throw new Error(
        `Kein Token für Nutzer ${userId} und Dashboard ${dashboardId} gefunden.`
      )
    }

    const { accessToken, refreshToken, expiration } = token

    // Prüfen, ob das Token noch gültig ist
    if (new Date() < expiration) {
      return accessToken // Token ist gültig
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } =
      await this.refreshAccessToken(userId, dashboardId, refreshToken)

    // Aktualisiere das Token in der Datenbank
    const newExpirationDate = new Date(expiresIn);
    await this.tokenRepository.updateAccessToken(
      token.id,
      newAccessToken,
      newExpirationDate,
      newRefreshToken
    )



    return newAccessToken
  }

  /**
   * @description Processes the webhook data from Google and emits
   * the event to the correct user.
   * @param webhookData - The data sent by Google in the webhook request.
   */
  async handleCalendarWebhook(webhookData: {
    id: string
    resourceId: string
  }): Promise<void> {
    const { id: userIdWithDashboardId, resourceId } = webhookData

    if (!userIdWithDashboardId || !resourceId) {
      throw new Error("Webhook data is missing required fields")
    }

    emitToUserDashboard(userIdWithDashboardId, "google-calendar-event", {
      erfolgreich: "erfolgreich",
    })
  }
}
