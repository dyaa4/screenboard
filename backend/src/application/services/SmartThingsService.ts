import { SmartThingsRepository } from "../../domain/repositories/SmartThingsRepository";
import { SERVICES } from "../../domain/valueObjects/serviceToken";
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository";

import { Token } from "../../domain/entities/Token";
import { ITokenDocument } from "../../domain/types/ITokenDocument";
import { emitToUserDashboard } from "../../infrastructure/server/socketIo";

import {
  ISmartThingsToken,
  SmartThingsDeviceDTO,
  SmartThingsDeviceStatusDTO,
  SmartThingsSubscriptionDTO,
  WebhookSmartthingsEvent,
} from "../../domain/types/SmartThingDtos";
import logger from "../../utils/logger";
import { EventSubscriptionService } from "./EventSubscriptionService";

export class SmartThingsService {
  constructor(
    private smartThingsRepository: SmartThingsRepository,
    private tokenRepository: TokenRepository,
    private eventSubscriptionService: EventSubscriptionService
  ) { }

  private subscriptionRenewalJobs: Map<string, NodeJS.Timeout> = new Map();
  private readonly RENEWAL_INTERVAL = 6 * 24 * 60 * 60 * 1000; // 6 Tage


  /**
   *  Handles the authentication callback from SmartThings.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @param code  the authorization code
   */
  private scheduleSubscriptionRenewal(
    userId: string,
    dashboardId: string,
    deviceId: string,
    subscriptionId: string
  ): void {
    const jobKey = `${userId}-${dashboardId}-${deviceId}`;

    const existingJob = this.subscriptionRenewalJobs.get(jobKey);
    if (existingJob) {
      clearTimeout(existingJob);
    }

    const renewalJob = setTimeout(async () => {
      try {
        const accessToken = await this.ensureValidAccessToken(
          userId,
          dashboardId
        );

        const token = await this.tokenRepository.findToken(
          userId,
          dashboardId,
          SERVICES.SMARTTHINGS
        );

        if (!token) {
          throw new Error("Token not found for user and dashboard for SmartThingsService");
        }

        // Erneuere die Subscription
        const newSubscription =
          await this.smartThingsRepository.subscribeToDeviceEvents(
            accessToken,
            deviceId,
            token.installedAppId!
          );

        // Plane die nächste Erneuerung
        this.scheduleSubscriptionRenewal(
          userId,
          dashboardId,
          deviceId,
          newSubscription.resourceId
        );
      } catch (error) {
        console.error("Failed to renew subscription:", error);
        // Retry in einer Stunde
        setTimeout(
          () => {
            this.scheduleSubscriptionRenewal(
              userId,
              dashboardId,
              deviceId,
              subscriptionId
            );
          },
          60 * 60 * 1000
        );
      }
    }, this.RENEWAL_INTERVAL);

    this.subscriptionRenewalJobs.set(jobKey, renewalJob);
  }


  /**
   *  Cleans up the SmartThings service for a user and dashboard.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   */
  async cleanup(userId: string, dashboardId: string): Promise<void> {
    await this.logout(userId, dashboardId);

    for (const [jobKey, timeout] of this.subscriptionRenewalJobs.entries()) {
      if (jobKey.startsWith(`${userId}-${dashboardId}`)) {
        clearTimeout(timeout);
        this.subscriptionRenewalJobs.delete(jobKey);
      }
    }
  }

  /**
   *  Handles the authentication callback from SmartThings.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @param code  the authorization code
   */
  async handleAuthCallback(
    userId: string,
    dashboardId: string,
    code: string
  ): Promise<void> {
    const smartThingsTokens =
      await this.smartThingsRepository.exchangeAuthCodeForTokens(code);

    const { accessToken, refreshToken, expiresIn, installedAppId } = smartThingsTokens;

    const expirationDate = new Date(Date.now() + expiresIn * 1000);

    const token = new Token(
      accessToken,
      refreshToken,
      expirationDate,
      userId,
      dashboardId,
      SERVICES.SMARTTHINGS,
      installedAppId
    );

    await this.tokenRepository.create(token as ITokenDocument);
  }

  /**
   *  Retrieves the list of devices for the user and dashboard.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @returns An array of SmartThings devices. 
   */
  async getDevices(
    userId: string,
    dashboardId: string
  ): Promise<SmartThingsDeviceDTO[]> {
    const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
    return await this.smartThingsRepository.fetchDevices(accessToken);
  }

  /**
   *  Retrieves the status of a specific device.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @param deviceId  the device ID to retrieve the status for
   * @returns  The device status.
   */
  async getDeviceStatus(
    userId: string,
    dashboardId: string,
    deviceId: string
  ): Promise<SmartThingsDeviceStatusDTO> {
    const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
    return await this.smartThingsRepository.fetchDeviceStatus(
      accessToken,
      deviceId
    );
  }

  /**
   *  Executes a command on a specific device.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @param deviceId  the device ID to execute the command on
   * @param command  the command to execute
   */
  async executeDeviceCommand(
    userId: string,
    dashboardId: string,
    deviceId: string,
    command: any
  ): Promise<void> {
    const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
    await this.smartThingsRepository.executeDeviceCommand(
      accessToken,
      deviceId,
      command
    );
  }

  /**
   *  Subscribes to device events for a specific device.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @param deviceId  the device ID to subscribe to
   * @returns  The subscription details.
   */
  async subscribeToDeviceEvents(
    userId: string,
    dashboardId: string,
    deviceId: string
  ): Promise<SmartThingsSubscriptionDTO> {
    const accessToken = await this.ensureValidAccessToken(userId, dashboardId);
    const token = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.SMARTTHINGS
    );

    try {
      const subscription =
        await this.smartThingsRepository.subscribeToDeviceEvents(
          accessToken,
          deviceId,
          token?.installedAppId!
        );

      this.scheduleSubscriptionRenewal(
        userId,
        dashboardId,
        deviceId,
        subscription.resourceId
      );

      return subscription;
    } catch (error) {
      console.error("Error subscribing to device events:", error);
      throw new Error("Failed to subscribe to SmartThings device events.");
    }
  }

  /**
   *  Refreshes the access token for SmartThings.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @param refreshToken  the refresh token
   * @returns  The new access token and its expiration date.
   */
  async refreshAccessToken(
    userId: string,
    dashboardId: string,
    refreshToken: string
  ): Promise<ISmartThingsToken> {
    try {
      return await this.smartThingsRepository.refreshAccessToken(refreshToken);
    } catch (error: any) {
      // Nur löschen, wenn es sich um einen Authentifizierungsfehler handelt (401)
      if (error.response && error.response.status === 401) {
        console.log(`Token ungültig (401), lösche Token für Benutzer ${userId} und Dashboard ${dashboardId}`);
        await this.tokenRepository.deleteToken(
          userId,
          dashboardId,
          SERVICES.SMARTTHINGS
        );
      }
      throw error;
    }
  }

  /**
   *  Checks if the user is logged in to SmartThings.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   * @returns true if the user is logged in, false otherwise.
   */
  async getLoginStatus(userId: string, dashboardId: string): Promise<boolean> {
    const token = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.SMARTTHINGS
    );
    return !!token;
  }

  /**
   * Deletes the SmartThings token for the user and dashboard.
   * @param userId the current user ID
   * @param dashboardId the current dashboard ID
   */
  async logout(userId: string, dashboardId: string): Promise<void> {
    await this.tokenRepository.deleteToken(
      userId,
      dashboardId,
      SERVICES.SMARTTHINGS
    );
  }

  /**
   * Check if the access token is valid and refresh it if necessary.
   * @param userId the current user ID
   * @param dashboardId the current dashboard ID
   * @returns The valid access token.
   */
  async ensureValidAccessToken(
    userId: string,
    dashboardId: string
  ): Promise<string> {
    const token = await this.tokenRepository.findToken(
      userId,
      dashboardId,
      SERVICES.SMARTTHINGS
    );

    if (!token) {
      throw new Error(
        `Kein Token für Nutzer ${userId} und Dashboard ${dashboardId} gefunden.`
      );
    }

    const { accessToken, refreshToken, expiration } = token;

    // Token-Gültigkeit beträgt etwa 17 Stunden
    // Definiere einen größeren Puffer (z.B. 2 Stunden), um das Token zu aktualisieren
    const bufferTime = 2 * 60 * 60 * 1000; // 2 Stunden in Millisekunden
    const shouldRefresh = new Date(expiration.getTime() - bufferTime) <= new Date();

    // Wenn das Token noch gültig ist und nicht bald abläuft
    if (!shouldRefresh) {
      return accessToken;
    }

    // Token läuft bald ab oder ist bereits abgelaufen, aktualisieren
    console.log(`Token für Benutzer ${userId} wird aktualisiert...`);
    try {
      const { accessToken: newAccessToken, expiresIn, refreshToken: newRefreshToken } =
        await this.refreshAccessToken(userId, dashboardId, refreshToken);

      const expirationDate = new Date(Date.now() + expiresIn * 1000);

      await this.tokenRepository.updateAccessToken(
        token.id,
        newAccessToken,
        expirationDate,
        newRefreshToken
      );

      return newAccessToken;
    } catch (error: any) {
      console.error(`Fehler beim Aktualisieren des Tokens für Benutzer ${userId}:`, error);

      if (
        (error.response && error.response.status === 400)
      ) {
        console.log(`Refresh-Token ungültig, lösche Eintrag für User ${userId}`);
        await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.SMARTTHINGS);
      }

      // Wenn der Token noch existiert, versuchen wir es mit dem vorhandenen Token
      console.log(`Verwende vorhandenes Token trotz Aktualisierungsfehler.`);
      return accessToken;
    }
  }


  async handleWebhookEvent(event: WebhookSmartthingsEvent): Promise<void> {
    const { messageType, eventData } = event;

    logger.info("Received SmartThings webhook event");
    console.log("Webhook Event Data:", JSON.stringify(eventData, null, 2));

    if (messageType === "EVENT" && Array.isArray(eventData?.events)) {
      for (const event of eventData.events) {
        // Optional: nur DEVICE_EVENT verarbeiten
        if (event.eventType !== "DEVICE_EVENT") {
          console.warn("Nicht unterstützter Event-Typ:", event.eventType);
          continue;
        }

        const deviceEvent = event.deviceEvent;
        if (!deviceEvent) {
          console.warn("Kein deviceEvent in diesem Event gefunden.");
          continue;
        }

        const { subscriptionName, deviceId, value } = deviceEvent;

        if (!subscriptionName || !deviceId) {
          console.warn("deviceEvent ohne subscriptionName oder deviceId übersprungen.");
          continue;
        }

        const subscription = await this.eventSubscriptionService.getSubscriptionByResourceId(subscriptionName);

        if (!subscription) {
          console.warn(`Keine Subscription für ID ${subscriptionName} gefunden.`);
          continue;
        }

        console.log('subscription:', JSON.stringify(subscription, null, 2));

        const userId = subscription?.userId.split("|")[1]
        console.log('userId:', userId);
        emitToUserDashboard(
          `${userId}-${subscription?.dashboardId}`,
          "smartthings-device-event",
          {
            deviceId,
            value: value ?? "unknown",
            timestamp: new Date().toISOString(),
          }
        );
      }
    } else {
      console.warn("Unerwarteter messageType oder fehlende Events:", messageType);
    }
  }

}