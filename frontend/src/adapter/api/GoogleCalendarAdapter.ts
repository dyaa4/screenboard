import { GoogleRepository } from '../../application/repositories/googleRepository';
import type { FetchAccessTokenInputPort } from '../../application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import { GoogleCalendarListDto } from '../../domain/dtos/GoogleCalendarListDto';
import axios from 'axios';
import { inject, singleton } from 'tsyringe';
import {
  API_GOOGLE_CALENDAR_EVENTS_PATH,
  API_GOOGLE_CALENDAR_LIST_PATH,
  API_GOOGLE_LOGIN_PATH,
  API_GOOGLE_LOGIN_STATUS,
  API_GOOGLE_LOGOUT_PATH,
  API_GOOGLE_USER_INFO_PATH,
} from './constants';
import { getApiUrl } from './helper';
import { SimpleEventDto } from '../../domain/dtos/SimpleEventDto';

@singleton()
export default class GoogleCalendarAdapter implements GoogleRepository {
  private accessTokenUseCase: FetchAccessTokenInputPort;

  constructor(
    @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
    fetchAccessTokenUseCase: FetchAccessTokenInputPort,
  ) {
    this.accessTokenUseCase = fetchAccessTokenUseCase;
  }

  async getLoginStatus(dashboardId: string): Promise<boolean> {
    const appToken = await this.getApiToken();

    if (!appToken) {
      throw new Error(
        'Authorization token of Screen Board not found in local storage',
      );
    }

    try {
      const response = await axios.get(getApiUrl(API_GOOGLE_LOGIN_STATUS), {
        headers: {
          Authorization: `Bearer ${appToken}`,
        },
        params: { dashboardId },
      });

      return response.data.isLoggedin;
    } catch (error) {
      console.error('Error getting Google login status:', error);
      throw new Error('Failed to get Google login status');
    }
  }

  async logout(dashboardId: string): Promise<void> {
    const appToken = await this.getApiToken();

    if (!appToken) {
      throw new Error(
        'Authorization token of Screen Board not found in local storage',
      );
    }

    try {
      await axios.delete(getApiUrl(API_GOOGLE_LOGOUT_PATH), {
        headers: {
          Authorization: `Bearer ${appToken}`,
        },
        params: { dashboardId },
      });
    } catch (error) {
      console.error('Error logging out from Google:', error);
      throw new Error('Failed to logout from Google');
    }
  }

  /**
   * Fetch Google Calendar Events
   * @param dashboardId Dashboard Id
   * @param calendarId Calendar Id
   * @returns Simple Google Events List
   */
  async fetchGoogleCalendarEvents(
    dashboardId: string,
    calendarId: string,
  ): Promise<SimpleEventDto[]> {
    const appAuthToken = await this.getApiToken();

    if (!appAuthToken) {
      throw new Error(
        'Authorization token of Screen Board not found in local storage',
      );
    }

    try {
      const response = await axios.get(
        getApiUrl(API_GOOGLE_CALENDAR_EVENTS_PATH),
        {
          headers: {
            Authorization: `Bearer ${appAuthToken}`,
          },
          params: {
            calendarId: calendarId,
            dashboardId: dashboardId,
          },
        },
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response from Google Calendar API');
      }

      return response.data.map((googleEvent: any) =>
        this.mapGoogleEventToSimpleDto(googleEvent),
      );
    } catch (error: any) {
      if (error.status === 401) {
        console.log('Token expired');
      } else {
        console.error('Error fetching Google Calendar Events:', error);
      }
      throw error;
    }
  }

  private mapGoogleEventToSimpleDto(googleEvent: any): SimpleEventDto {
    return {
      id: googleEvent.id,
      summary: googleEvent.summary || '',
      description: googleEvent.description || '',
      start: {
        date: googleEvent.start?.date,
        dateTime: googleEvent.start?.dateTime,
      },
      end: {
        date: googleEvent.end?.date,
        dateTime: googleEvent.end?.dateTime,
      },
      location: googleEvent.location || '',
      creator: {
        email: googleEvent.creator?.email || '',
        displayName: googleEvent.creator?.displayName || '',
      },
    };
  }

  /**
   *  Fetch Google User Calendars
   * @param accessToken  Access Token von Google
   * @returns  Google Calendar List
   */
  async fetchGoogleUserCalendars(
    dashboardId: string,
  ): Promise<GoogleCalendarListDto> {
    const appAuthToken = await this.getApiToken();

    if (!appAuthToken) {
      throw new Error(
        'Authorization token of Screen Board not found in local storage',
      );
    }

    const calenders = await axios.get(
      getApiUrl(API_GOOGLE_CALENDAR_LIST_PATH),
      {
        headers: {
          Authorization: `Bearer ${appAuthToken}`,
        },
        params: { dashboardId },
      },
    );

    if (!calenders.data || !Array.isArray(calenders.data)) {
      throw new Error('Invalid response from Google Calendar API');
    }

    const googleCalenderListDto: GoogleCalendarListDto = {
      items: calenders.data.map((calendar: any) => ({
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        location: calendar.location,
        timeZone: calendar.timeZone,
        accessRole: calendar.accessRole,
        primary: calendar.primary,
        deleted: calendar.deleted,
        kind: calendar.kind,
        etag: calendar.etag,
      })),
    };

    return googleCalenderListDto;
  }

  async fetchUserInfo(dashboardId: string): Promise<UserProfileDto> {
    const appAuthToken = await this.getApiToken();

    if (!appAuthToken) {
      throw new Error(
        'Authorization token of Screen Board not found in local storage',
      );
    }

    try {
      const userInfoResponse = await axios.get(
        getApiUrl(API_GOOGLE_USER_INFO_PATH),
        {
          headers: {
            Authorization: `Bearer ${appAuthToken}`,
          },
          params: { dashboardId },
        },
      );

      if (!userInfoResponse.data) {
        throw new Error('Invalid response from Google API');
      }

      const { name, picture, sub, given_name, family_name, locale } =
        userInfoResponse.data;

      return {
        name,
        picture,
        sub,
        given_name,
        family_name,
        locale,
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new Error('An unexpected error occurred while fetching user info');
    }
  }

  /**
   *  Login for Google Calendar
   * @param googleAuthCode Google Auth Code
   * @returns  void
   */
  async loginForGoogleCalendar(
    dashboardId: string,
    googleAuthCode: string,
  ): Promise<void> {
    try {
      const authToken = await this.getApiToken();

      if (!authToken) {
        throw new Error('Authorization token not found in local storage');
      }

      await axios.post(
        getApiUrl(API_GOOGLE_LOGIN_PATH),
        { googleAuthCode },
        {
          params: { dashboardId },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
    } catch (error) {
      console.error('Error logging in with Google Calendar:', error);
      throw new Error('An unexpected error occurred during login');
    }
  }

  private async getApiToken(): Promise<string | null> {
    return await this.accessTokenUseCase.getAccessToken();
  }
}
