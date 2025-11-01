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

export class GoogleService {
  constructor(
    private googleRepository: GoogleRepository,
    private tokenRepository: TokenRepository,
    private eventSubscriptionRepository: EventSubscriptionRepository,
  ) { }
  private subscriptionRenewalJobs: Map<string, NodeJS.Timeout> = new Map();
  // Konstante für die Erneuerungszeit (z.B. 6 Tage in ms, da Google maximal 7 Tage erlaubt)
  private readonly RENEWAL_INTERVAL = 6 * 24 * 60 * 60 * 1000;


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
  }


  async handleGoogleAuthCode(
    userId: string,
    dashboardId: string,
    code: string
  ): Promise<void> {
    const googleTokens =
      await this.googleRepository.exchangeAuthCodeForTokens(code)
    // the expiresIn is in ms
    const { accessToken, refreshToken, expiresIn } = googleTokens
    // Token Entity erstellen
    const token = new Token(
      accessToken,
      refreshToken,
      new Date(expiresIn),
      userId,
      dashboardId,
      SERVICES.GOOGLE
    )

    // Token speichern
    await this.tokenRepository.create(token as ITokenDocument)
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
    await this.tokenRepository.updateAccessToken(
      token.id,
      newAccessToken,
      new Date(expiresIn),
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
