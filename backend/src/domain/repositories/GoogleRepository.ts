import { IGoogleToken } from "../../domain/types/IGoogleToken"
import { GoogleCalendarListDto } from "../../infrastructure/dtos/GoogleCalendarListDTO"
import {
  GoogleEventDTO,
  GoogleSubscriptionDTO,
} from "../../infrastructure/dtos/GoogleEventDTO"
import { GoogleUserInfoDTO } from "../../infrastructure/dtos/GoogleUserInfoDTO"

export interface GoogleRepository {
  exchangeAuthCodeForTokens(code: string): Promise<IGoogleToken>

  refreshAccessToken(refreshToken: string): Promise<IGoogleToken>

  fetchEvents(
    accessToken: string,
    calendarId: string
  ): Promise<GoogleEventDTO[]>
  fetchUserInfo(accessToken: string): Promise<GoogleUserInfoDTO>

  fetchUserCalendars(accessToken: string): Promise<GoogleCalendarListDto>

  subscribeToCalendarEvents(
    accessToken: string,
    calendarId: string,
    userId: string,
    dashboardId: string
  ): Promise<GoogleSubscriptionDTO>

  renewSubscription(
    accessToken: string,
    calendarId: string,
    userId: string,
    dashboardId: string,
    existingResourceId: string
  ): Promise<GoogleSubscriptionDTO>;

  stopSubscriptionPublic(
    accessToken: string,
    resourceId: string,
    userId: string,
    dashboardId: string
  ): Promise<void>;

  fetchEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<GoogleEventDTO>
}
