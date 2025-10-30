import { IGoogleToken } from "../../../domain/types/IGoogleToken"
import { GoogleCalendarListDto } from "../../../infrastructure/dtos/GoogleCalendarListDTO"
import {
  GoogleEventDTO,
  GoogleSubscriptionDTO,
} from "../../../infrastructure/dtos/GoogleEventDTO"
import { GoogleUserInfoDTO } from "../../../infrastructure/dtos/GoogleUserInfoDTO"
import axios from "axios"
import { GoogleRepository } from "../../../domain/repositories/GoogleRepository"

export class GoogleAdapter implements GoogleRepository {
  private readonly clientId: string | undefined
  private readonly clientSecret: string | undefined

  constructor() {
    this.clientId = process.env.CLIENT_ID_GOOGLE_KALENDER
    this.clientSecret = process.env.CLIENT_SCRET_GOOGLE_KALENDER

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "Client ID or Secret is not defined in environment variables"
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
    userId: string,
    dashboardId: string
  ): Promise<void> {
    try {
      const userIdWithoutAuth0 = userId.replace("auth0|", "");
      const channelId = `${userIdWithoutAuth0}-${dashboardId}`;

      await axios.post(
        'https://www.googleapis.com/calendar/v3/channels/stop',
        {
          id: channelId,
          resourceId: resourceId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
    } catch (error) {
      console.error('Error stopping subscription:', error);
      // Wir werfen hier keinen Fehler, da die Subscription vielleicht schon abgelaufen ist
    }
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

      const channel = {
        id: userIdWithDashboardId,
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

    try {
      const response = await axios.post(tokenEndpoint, {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: process.env.REDIRECT_URI_GOOGLE_KALENDER,
        grant_type: "authorization_code",
      })

      const { access_token, refresh_token, expires_in } = response.data

      if (!access_token || !refresh_token) {
        throw new Error(
          "Missing access token or refresh token in the response."
        )
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: new Date().getTime() + expires_in * 1000,
      }
    } catch (error: any) {
      console.error(
        "Error exchanging authorization code for tokens:",
        error.response?.data || error.message
      )
      throw new Error("Failed to exchange authorization code for tokens.")
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
