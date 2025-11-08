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
import logger from "../../utils/logger"

export class GoogleService {
  constructor(
    private googleRepository: GoogleRepository,
    private tokenRepository: TokenRepository,
    private eventSubscriptionRepository: EventSubscriptionRepository,
  ) { }
  private subscriptionRenewalJobs: Map<string, NodeJS.Timeout> = new Map();
  private tokenExpirationCleanupJobs: Map<string, NodeJS.Timeout> = new Map();
  // Konstante für die Erneuerungszeit (z.B. 6 Tage in ms, da Google maximal 7 Tage erlaubt)
  private readonly RENEWAL_INTERVAL = 6 * 24 * 60 * 60 * 1000;
  private readonly CLEANUP_BEFORE_EXPIRATION = 60 * 60 * 1000; // 60 Minuten vor Token-Expiration
  // Google Refresh-Token Lifespan: ~6 Monate (kann variieren je nach Nutzung)
  private readonly GOOGLE_REFRESH_TOKEN_LIFESPAN = 180 * 24 * 60 * 60 * 1000; // 6 Monate


  private scheduleSubscriptionRenewal(
    userId: string,
    dashboardId: string,
    calendarId: string,
    resourceId: string
  ): void {
    // Erstelle einen eindeutigen Schlüssel für diesen Job
    const jobKey = `${userId}-${dashboardId}-${calendarId}`;

    // Lösche einen möglicherweise existierenden Job
    const existingJob = this.subscriptionRenewalJobs.get(jobKey);
    if (existingJob) {
      clearTimeout(existingJob);
    }

    // Plane den neuen Erneuerungsjob
    const renewalJob = setTimeout(async () => {
      try {
        const accessToken = await this.ensureValidAccessToken(userId, dashboardId);

        const newSubscription = await this.googleRepository.renewSubscription(
          accessToken,
          calendarId,
          userId,
          dashboardId,
          resourceId
        );

        // Plane die nächste Erneuerung
        this.scheduleSubscriptionRenewal(
          userId,
          dashboardId,
          calendarId,
          newSubscription.resourceId
        );
      } catch (error) {
        console.error('Failed to renew subscription:', error);
        // Versuche es in einer Stunde erneut
        setTimeout(() => {
          this.scheduleSubscriptionRenewal(userId, dashboardId, calendarId, resourceId);
        }, 60 * 60 * 1000);
      }
    }, this.RENEWAL_INTERVAL);

    // Speichere den Job
    this.subscriptionRenewalJobs.set(jobKey, renewalJob);
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
      tokenCreationDate.getTime() + this.GOOGLE_REFRESH_TOKEN_LIFESPAN
    );

    const cleanupTime = estimatedRefreshExpiration.getTime() - this.CLEANUP_BEFORE_EXPIRATION;
    const now = Date.now();

    if (cleanupTime <= now) {
      // Refresh token expires very soon, cleanup immediately but only once
      logger.warn('Google refresh token expires very soon, cleaning up immediately',
        { userId, dashboardId, estimatedRefreshExpiration }, 'GoogleService');

      // Set a dummy timeout to mark this cleanup as scheduled (prevents multiple immediate cleanups)
      this.tokenExpirationCleanupJobs.set(cleanupJobKey, setTimeout(() => { }, 0));

      // Execute cleanup asynchronously to prevent blocking
      setImmediate(async () => {
        await this.performProactiveCleanup(userId, dashboardId);
      });
      return;
    }

    const timeUntilCleanup = cleanupTime - now;
    const daysUntilCleanup = Math.floor(timeUntilCleanup / (24 * 60 * 60 * 1000));

    logger.info('Scheduled Google proactive cleanup based on refresh token expiration',
      { userId, dashboardId, daysUntilCleanup, estimatedRefreshExpiration }, 'GoogleService');

    const cleanupJob = setTimeout(async () => {
      await this.performProactiveCleanup(userId, dashboardId);
    }, timeUntilCleanup);

    this.tokenExpirationCleanupJobs.set(cleanupJobKey, cleanupJob);
  }

  /**
   * Perform proactive Google cleanup while refresh token is still valid
   */
  private async performProactiveCleanup(userId: string, dashboardId: string): Promise<void> {
    const cleanupJobKey = `cleanup-${userId}-${dashboardId}`;

    // Check if token still exists before attempting cleanup
    const existingToken = await this.tokenRepository.findToken(userId, dashboardId, SERVICES.GOOGLE);
    if (!existingToken) {
      logger.info('Google token already cleaned up, skipping proactive cleanup',
        { userId, dashboardId }, 'GoogleService');

      // Remove the cleanup job since it's no longer needed
      this.tokenExpirationCleanupJobs.delete(cleanupJobKey);
      return;
    }

    logger.info('Starting proactive Google subscription cleanup (refresh token expires in 60min)',
      { userId, dashboardId }, 'GoogleService');

    try {
      await this.logout(userId, dashboardId);
      logger.success('Proactive Google subscription cleanup completed',
        { userId, dashboardId }, 'GoogleService');
    } catch (error) {
      logger.error('Proactive Google subscription cleanup failed',
        error as Error, 'GoogleService');
    } finally {
      // Always remove the cleanup job after execution
      this.tokenExpirationCleanupJobs.delete(cleanupJobKey);
    }
  }

  // Cleanup-Methode beim Ausloggen oder Beenden
  async cleanup(userId: string, dashboardId: string): Promise<void> {
    // Bestehende Logout-Logik
    await this.logout(userId, dashboardId);

    // Lösche alle Renewal Jobs für diesen User und dieses Dashboard
    for (const [jobKey, timeout] of this.subscriptionRenewalJobs.entries()) {
      if (jobKey.startsWith(`${userId}-${dashboardId}`)) {
        clearTimeout(timeout);
        this.subscriptionRenewalJobs.delete(jobKey);
      }
    }

    // Clear expiration cleanup jobs
    const cleanupJobKey = `cleanup-${userId}-${dashboardId}`;
    const cleanupJob = this.tokenExpirationCleanupJobs.get(cleanupJobKey);
    if (cleanupJob) {
      clearTimeout(cleanupJob);
      this.tokenExpirationCleanupJobs.delete(cleanupJobKey);
    }
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
      const createdToken = await this.tokenRepository.create(token as ITokenDocument);

      // Schedule proactive cleanup before refresh token expires (based on creation time)
      const creationDate = createdToken.createdAt || new Date();
      this.scheduleRefreshTokenExpirationCleanup(userId, dashboardId, creationDate);

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

      // Plane die automatische Erneuerung
      this.scheduleSubscriptionRenewal(userId, dashboardId, calendarId, subscription.resourceId);

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
      // Hole den aktuellen Token, um damit Google zu benachrichtigen
      const token = await this.tokenRepository.findToken(
        userId,
        dashboardId,
        SERVICES.GOOGLE
      )

      if (token && token.accessToken) {
        // Hole alle Subscriptions für dieses Dashboard
        const subscriptions = await this.eventSubscriptionRepository.findByUserAndDashboard(userId, dashboardId)

        // Stoppe alle Subscriptions bei Google
        for (const subscription of subscriptions) {
          if (subscription.resourceId) {
            try {
              await this.googleRepository.stopSubscriptionPublic(
                token.accessToken,
                subscription.resourceId,
                userId,
                dashboardId
              )
            } catch (error) {
              console.error('Error stopping subscription at Google:', error)
              // Continue, um alle zu stoppen, auch wenn eine fehlschlägt
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during logout subscription cleanup:', error)
      // Continue with deletion even if stopping fails
    }

    // Lösche den Token aus unserer DB
    await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.GOOGLE)

    // Lösche alle Subscriptions aus unserer DB
    await this.eventSubscriptionRepository.deleteAllForUserDashboard(userId, dashboardId)

    // Räume Renewal Jobs auf
    await this.cleanup(userId, dashboardId)
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

    // Schedule new proactive cleanup for refreshed token (keep original creation date for refresh token expiration)
    const originalCreationDate = token.createdAt || new Date();
    this.scheduleRefreshTokenExpirationCleanup(userId, dashboardId, originalCreationDate);

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
