import { GoogleCalendarListDto } from '@domain/dtos/GoogleCalendarListDto';
import { SimpleEventDto } from '@domain/dtos/SimpleEventDto';

export interface GoogleRepository {
  fetchGoogleUserCalendars(dashboardId: string): Promise<GoogleCalendarListDto>;
  fetchGoogleCalendarEvents(
    dashboardId: string,
    calendarId: string,
  ): Promise<SimpleEventDto[]>;
  fetchUserInfo(dashboardId: string): Promise<UserProfileDto>;
  loginForGoogleCalendar(
    dashboardId: string,
    googleAuthCode: string,
  ): Promise<void>;
  getLoginStatus(dashboardId: string): Promise<boolean>;
  logout(dashboardId: string): Promise<void>;
}
