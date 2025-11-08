import { SmartThingsRepository } from "../../domain/repositories/SmartThingsRepository";
import { SERVICES } from "../../domain/valueObjects/serviceToken";
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository";
import { EventSubscriptionRepository } from "../../infrastructure/repositories/EventSubscription";

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
    private eventSubscriptionService: EventSubscriptionService,
    private eventSubscriptionRepository: EventSubscriptionRepository
  ) { }







  /**
   *  Cleans up the SmartThings service for a user and dashboard.
   * @param userId  the current user ID
   * @param dashboardId  the current dashboard ID
   */


  async cleanup(userId: string, dashboardId: string): Promise<void> {
    await this.logout(userId, dashboardId);
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
        logger.warn('Invalid SmartThings token (401), cleaning up subscriptions and deleting token',
          { hasUserId: !!userId, hasDashboardId: !!dashboardId }, 'SmartThingsService');

        // CRITICAL: Cleanup local subscription records (API calls impossible with expired token)
        try {
          await this.eventSubscriptionRepository.deleteAllForUserDashboard(userId, dashboardId);
          logger.info('Cleaned up local SmartThings subscription records on token expiration',
            { userId, dashboardId }, 'SmartThingsService');
        } catch (cleanupError) {
          logger.warn('Failed to cleanup SmartThings subscription records on token expiration but continuing',
            { userId, dashboardId, error: (cleanupError as Error).message }, 'SmartThingsService');
        }

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
    try {
      // Hole den aktuellen Token
      const token = await this.tokenRepository.findToken(
        userId,
        dashboardId,
        SERVICES.SMARTTHINGS
      );

      if (token && token.accessToken && token.installedAppId) {
        console.log(`🗑️ LOGOUT: Lösche alle SmartThings Subscriptions für User ${userId}, Dashboard ${dashboardId}`);

        // Lösche ALLE Subscriptions direkt bei SmartThings (nicht nur die in unserer DB)
        await this.smartThingsRepository.deleteAllSubscriptionsForApp(
          token.accessToken,
          token.installedAppId
        );

        console.log(`✅ LOGOUT: Alle SmartThings Subscriptions gelöscht`);
      }
    } catch (error) {
      console.error('Error during logout subscription cleanup:', error);
      // Continue with deletion even if stopping fails
    }

    // Lösche den Token aus unserer DB
    await this.tokenRepository.deleteToken(
      userId,
      dashboardId,
      SERVICES.SMARTTHINGS
    );

    // Lösche alle Subscriptions aus unserer DB
    await this.eventSubscriptionRepository.deleteAllForUserDashboard(userId, dashboardId);

    // Räume Renewal Jobs auf
    await this.cleanup(userId, dashboardId);
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
    logger.info('Refreshing SmartThings token', { hasUserId: !!userId }, 'SmartThingsService');
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
      logger.error('Failed to refresh SmartThings token', { hasUserId: !!userId, error: error.message }, 'SmartThingsService');

      if (
        (error.response && error.response.status === 400)
      ) {
        logger.warn('Invalid refresh token, deleting entry', { hasUserId: !!userId }, 'SmartThingsService');
        await this.tokenRepository.deleteToken(userId, dashboardId, SERVICES.SMARTTHINGS);
      }

      // Wenn der Token noch existiert, versuchen wir es mit dem vorhandenen Token
      logger.warn('Using existing token despite refresh error', {}, 'SmartThingsService');
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

  // === COLOR CONTROL SERVICE METHODS ===

  /**
   * Set device color using hue and saturation
   * @param userId Current user ID
   * @param dashboardId Current dashboard ID
   * @param deviceId Device ID to control
   * @param hue Hue value (0-100)
   * @param saturation Saturation value (0-100)
   */
  async setDeviceColor(
    userId: string,
    dashboardId: string,
    deviceId: string,
    hue: number,
    saturation: number
  ): Promise<void> {
    const timer = logger.startTimer('SmartThings Set Device Color');

    try {
      logger.info('Setting device color via service', {
        userId,
        dashboardId,
        deviceId,
        hue,
        saturation
      }, 'SmartThingsService');

      // Validate input values
      if (hue < 0 || hue > 100) {
        throw new Error('Hue must be between 0 and 100');
      }
      if (saturation < 0 || saturation > 100) {
        throw new Error('Saturation must be between 0 and 100');
      }

      const accessToken = await this.ensureValidAccessToken(userId, dashboardId);

      await this.smartThingsRepository.setDeviceColor(
        accessToken,
        deviceId,
        { hue, saturation }
      );

      // Emit real-time update to clients
      emitToUserDashboard(
        `${userId}-${dashboardId}`,
        "smartthings-color-changed",
        {
          deviceId,
          hue,
          saturation,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info('Device color updated successfully', { deviceId }, 'SmartThingsService');
    } catch (error: any) {
      logger.error('Failed to set device color', {
        userId,
        dashboardId,
        deviceId,
        error: error.message
      }, 'SmartThingsService');
      throw error;
    } finally {
      timer();
    }
  }

  /**
   * Set device color temperature
   * @param userId Current user ID
   * @param dashboardId Current dashboard ID
   * @param deviceId Device ID to control
   * @param colorTemperature Color temperature in Kelvin (1500-6500)
   */
  async setDeviceColorTemperature(
    userId: string,
    dashboardId: string,
    deviceId: string,
    colorTemperature: number
  ): Promise<void> {
    const timer = logger.startTimer('SmartThings Set Device Color Temperature');

    try {
      logger.info('Setting device color temperature via service', {
        userId,
        dashboardId,
        deviceId,
        colorTemperature
      }, 'SmartThingsService');

      // Validate input value
      if (colorTemperature < 1500 || colorTemperature > 6500) {
        throw new Error('Color temperature must be between 1500K and 6500K');
      }

      const accessToken = await this.ensureValidAccessToken(userId, dashboardId);

      await this.smartThingsRepository.setDeviceColorTemperature(
        accessToken,
        deviceId,
        colorTemperature
      );

      // Emit real-time update to clients
      emitToUserDashboard(
        `${userId}-${dashboardId}`,
        "smartthings-color-temperature-changed",
        {
          deviceId,
          colorTemperature,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info('Device color temperature updated successfully', { deviceId }, 'SmartThingsService');
    } catch (error: any) {
      logger.error('Failed to set device color temperature', {
        userId,
        dashboardId,
        deviceId,
        error: error.message
      }, 'SmartThingsService');
      throw error;
    } finally {
      timer();
    }
  }

  /**
   * Set device brightness level
   * @param userId Current user ID
   * @param dashboardId Current dashboard ID
   * @param deviceId Device ID to control
   * @param level Brightness level (0-100)
   */
  async setDeviceBrightness(
    userId: string,
    dashboardId: string,
    deviceId: string,
    level: number
  ): Promise<void> {
    const timer = logger.startTimer('SmartThings Set Device Brightness');

    try {
      logger.info('Setting device brightness via service', {
        userId,
        dashboardId,
        deviceId,
        level
      }, 'SmartThingsService');

      // Validate input value
      if (level < 0 || level > 100) {
        throw new Error('Brightness level must be between 0 and 100');
      }

      const accessToken = await this.ensureValidAccessToken(userId, dashboardId);

      await this.smartThingsRepository.setDeviceBrightness(
        accessToken,
        deviceId,
        level
      );

      // Emit real-time update to clients
      emitToUserDashboard(
        `${userId}-${dashboardId}`,
        "smartthings-brightness-changed",
        {
          deviceId,
          level,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info('Device brightness updated successfully', { deviceId }, 'SmartThingsService');
    } catch (error: any) {
      logger.error('Failed to set device brightness', {
        userId,
        dashboardId,
        deviceId,
        error: error.message
      }, 'SmartThingsService');
      throw error;
    } finally {
      timer();
    }
  }

}