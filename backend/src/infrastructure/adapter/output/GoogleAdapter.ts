import { IGoogleToken } from "../../../domain/types/IGoogleToken"
import { GoogleCalendarListDto } from "../../../infrastructure/dtos/GoogleCalendarListDTO"
import {
  GoogleEventDTO,
  GoogleSubscriptionDTO,
} from "../../../infrastructure/dtos/GoogleEventDTO"
import { GoogleUserInfoDTO } from "../../../infrastructure/dtos/GoogleUserInfoDTO"
import axios from "axios"
import { GoogleRepository } from "../../../domain/repositories/GoogleRepository"
import logger from "../../../utils/logger"

export class GoogleAdapter implements GoogleRepository {
  private readonly clientId: string | undefined
  private readonly clientSecret: string | undefined

  constructor() {
    this.clientId = process.env.CLIENT_ID_GOOGLE_KALENDER
    this.clientSecret = process.env.CLIENT_SCRET_GOOGLE_KALENDER

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "Google Calendar Client ID or Secret is not defined in environment variables. Google Calendar integration will not work."
      )
    }
  }

  async fetchUserCalendars(
    accessToken: string
  ): Promise<GoogleCalendarListDto> {
    const response = await axios.get(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    const calendars = response.data.items
    return calendars.map((calendar: any) => {
      return {
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        timeZone: calendar.timeZone,
        accessRole: calendar.accessRole,
      }
    })
  }

  async fetchUserInfo(accessToken: string): Promise<GoogleUserInfoDTO> {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return {
      sub: response.data.id,
      name: response.data.name,
      given_name: response.data.given_name,
      family_name: response.data.family_name,
      picture: response.data.picture,
      email: response.data.email,
      email_verified: response.data.email_verified,
      locale: response.data.locale,
    }
  }

  async fetchEvents(
    accessToken: string,
    calendarId: string
  ): Promise<GoogleEventDTO[]> {
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          maxResults: 30,
          timeMin: new Date().toISOString(),
          orderBy: "startTime",
          singleEvents: true,
        },
      }
    )

    const events = response.data

    return events.items.map((event: GoogleEventDTO) => {
      return {
        kind: event.kind,
        etag: event.etag,
        id: event.id,
        status: event.status,
        htmlLink: event.htmlLink,
        created: event.created,
        updated: event.updated,
        summary: event.summary,
        creator: {
          email: event.creator.email,
          displayName: event.creator.displayName,
        },
        organizer: event.organizer,
        start: event.start,
        end: event.end,
        recurringEventId: event.recurringEventId,
        originalStartTime: event.originalStartTime,
        transparency: event.transparency,
        iCalUID: event.iCalUID,
        sequence: event.sequence,
        reminders: event.reminders,
        eventType: event.eventType,
        location: event.location,
        description: event.description,
      }
    })
  }

  /**
   *  Stop the subscription to a calendar
   * @param accessToken   The access token
   * @param calendarId  The calendar id
   * @param userId   The user id
   * @param dashboardId  The dashboard id
   * @param existingResourceId  The existing resource id
   * @returns  The subscription
   */
  async renewSubscription(
    accessToken: string,
    calendarId: string,
    userId: string,
    dashboardId: string,
    existingResourceId: string
  ): Promise<GoogleSubscriptionDTO> {
    try {
      // Erst die alte Subscription stoppen
      await this.stopSubscription(accessToken, existingResourceId, userId, dashboardId);

      // Dann eine neue erstellen
      return await this.subscribeToCalendarEvents(
        accessToken,
        calendarId,
        userId,
        dashboardId
      );
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw new Error('Failed to renew calendar subscription');
    }
  }

  private async stopSubscription(
    accessToken: string,
    resourceId: string,
    _userId: string,
    _dashboardId: string
  ): Promise<void> {
    try {
      // We can't reconstruct the exact channel.id without calendarId
      // But Google also accepts stopping by resourceId only
      await axios.post(
        'https://www.googleapis.com/calendar/v3/channels/stop',
        {
          resourceId: resourceId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      console.log(`✅ Stopped Google subscription with resourceId: ${resourceId}`);
    } catch (error) {
      console.error('Error stopping Google subscription:', error);
      // Wir werfen hier keinen Fehler, da die Subscription vielleicht schon abgelaufen ist
    }
  }

  /**
   * Stop a subscription with the given resourceId
   * This is a public wrapper for stopSubscription to be used externally
   */
  async stopSubscriptionPublic(
    accessToken: string,
    resourceId: string,
    userId: string,
    dashboardId: string
  ): Promise<void> {
    return this.stopSubscription(accessToken, resourceId, userId, dashboardId);
  }



  /**
   * @description subscribes to calendar events
   * @param accessToken
   * @param calendarId
   * @returns
   */
  async subscribeToCalendarEvents(
    accessToken: string,
    calendarId: string,
    userId: string,
    dashboardId: string
  ): Promise<GoogleSubscriptionDTO> {
    try {
      //send userId without the "auth0|"
      const userIdWithoutAuth0 = userId.replace("auth0|", "")
      const userIdWithDashboardId = `${userIdWithoutAuth0}-${dashboardId}`

      // Make channel.id unique by including calendarId - this prevents 400 errors for multiple calendars
      const uniqueChannelId = `${userIdWithDashboardId}-${calendarId}`;

      const channel = {
        id: uniqueChannelId,
        type: "webhook",
        address: process.env.GOOGLE_CALENDAR_WEBHOOK_URL,
        token: userIdWithDashboardId + calendarId,
      }

      const response = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/watch`,
        channel,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Error subscribing to calendar events:", error)
      throw new Error("Failed to subscribe to Google Calendar events.")
    }
  }

  /**
   * Tauscht den Autorisierungscode gegen Access- und Refresh-Token aus.
   * @param code Der Autorisierungscode von Google.
   * @returns Ein Objekt mit Access- und Refresh-Token.
   */
  async exchangeAuthCodeForTokens(code: string): Promise<IGoogleToken> {
    const tokenEndpoint = "https://oauth2.googleapis.com/token"
    const timer = logger.startTimer('Google Token Exchange');

    try {
      logger.apiCall('Google', '/token', 'POST');

      const response = await axios.post(tokenEndpoint, {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: process.env.REDIRECT_URI_GOOGLE_KALENDER,
        grant_type: "authorization_code",
      })

      const { access_token, refresh_token, expires_in } = response.data

      if (!access_token || !refresh_token) {
        logger.error('Google token exchange missing tokens', new Error("Missing tokens in response"), 'GoogleAdapter');
        throw new Error(
          "Missing access token or refresh token in the response."
        )
      }

      logger.apiCall('Google', '/token', 'POST', response.status);
      logger.success('Google token exchange successful', { expiresIn: expires_in }, 'GoogleAdapter');
      timer();

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: new Date().getTime() + expires_in * 1000,
      }
    } catch (error: any) {
      logger.error('Google token exchange failed', error, 'GoogleAdapter');
      logger.apiCall('Google', '/token', 'POST', error.response?.status);
      throw new Error("Failed to exchange authorization code for tokens.");
    }
  }

  /**
   * Aktualisiert das Access-Token mit dem Refresh-Token.
   * @param refreshToken Das Refresh-Token.
   * @returns Das neue Access-Token.
   */
  async refreshAccessToken(refreshToken: string): Promise<IGoogleToken> {
    try {
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      })

      const { access_token, refresh_token: new_refresh_token, expires_in } = response.data

      return {
        accessToken: access_token,
        refreshToken: new_refresh_token || refreshToken,
        expiresIn: new Date().getTime() + expires_in * 1000,
      }
    } catch (error) {
      console.error("Error refreshing access token:", error)
      throw error
    }
  }

  async fetchEvent(
    accessToken: string,
    eventId: string,
    calendarId: string
  ): Promise<GoogleEventDTO> {
    const url = ` https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.data
  }
}
