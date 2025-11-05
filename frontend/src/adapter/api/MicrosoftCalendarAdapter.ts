import { SimpleEventDto } from '../../domain/dtos/SimpleEventDto';
import { MicrosoftRepository, MicrosoftCalendarListDto, UserProfileDto } from '../../application/repositories/microsoftRepository';
import axios from 'axios';
import { inject, singleton } from 'tsyringe';
import type { FetchAccessTokenInputPort } from '../../application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import { getApiUrl } from './helper';

/**
 * MicrosoftCalendarAdapter - Hexagonal Architecture Adapter Layer
 * Handles fetching and parsing events from Microsoft Calendar / Microsoft 365
 * Implements OAuth authentication and event retrieval
 */
@singleton()
export class MicrosoftCalendarAdapter implements MicrosoftRepository {
    private accessTokenUseCase: FetchAccessTokenInputPort;

    constructor(
        @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
        fetchAccessTokenUseCase: FetchAccessTokenInputPort,
    ) {
        this.accessTokenUseCase = fetchAccessTokenUseCase;
    }

    /**
     * Fetch events from Microsoft Calendar
     * @param dashboardId Dashboard identifier
     * @param calendarId Microsoft Calendar ID
     * @returns Array of SimpleEventDto objects
     */
    async fetchMicrosoftCalendarEvents(
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
            // Call backend endpoint to fetch Microsoft Calendar events
            // Backend handles Microsoft Graph API authentication and pagination
            const response = await axios.get(getApiUrl('/api/events/microsoft/calendar'), {
                headers: {
                    Authorization: `Bearer ${appAuthToken}`,
                },
                params: {
                    calendarId,
                    dashboardId,
                },
            });

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response from Microsoft Calendar API');
            }

            let events = response.data.map((microsoftEvent: any) =>
                this.mapMicrosoftEventToSimpleDto(microsoftEvent),
            );

            return events;
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('Microsoft Calendar token expired');
            }
            console.error('Error fetching Microsoft Calendar events:', error);
            throw error;
        }
    }

    /**
     * Get Microsoft Calendar login status
     * @param dashboardId Dashboard identifier
     * @returns Boolean indicating if user is logged in
     */
    async getLoginStatus(dashboardId: string): Promise<boolean> {
        const appToken = await this.getApiToken();

        if (!appToken) {
            throw new Error(
                'Authorization token of Screen Board not found in local storage',
            );
        }

        try {
            const response = await axios.get(getApiUrl('/api/auth/microsoft/loginStatus'), {
                headers: {
                    Authorization: `Bearer ${appToken}`,
                },
                params: { dashboardId },
            });

            return response.data?.isLoggedin || false;
        } catch (error) {
            console.error('Error getting Microsoft Calendar login status:', error);
            // Return false instead of throwing to gracefully handle missing endpoint
            return false;
        }
    }

    /**
     * Logout from Microsoft Calendar
     * @param dashboardId Dashboard identifier
     */
    async logout(dashboardId: string): Promise<void> {
        const appToken = await this.getApiToken();

        if (!appToken) {
            throw new Error(
                'Authorization token of Screen Board not found in local storage',
            );
        }

        try {
            await axios.delete(getApiUrl('/api/auth/microsoft/logout'), {
                headers: {
                    Authorization: `Bearer ${appToken}`,
                },
                params: { dashboardId },
            });
        } catch (error) {
            console.error('Error logging out from Microsoft Calendar:', error);
            throw new Error('Failed to logout from Microsoft Calendar');
        }
    }

    /**
     * Login for Microsoft Calendar
     * @param dashboardId Dashboard identifier
     * @param microsoftAuthCode Microsoft Auth Code from OAuth callback
     * @param state Optional state parameter from OAuth callback
     * @returns void
     */
    async loginForMicrosoftCalendar(
        dashboardId: string,
        microsoftAuthCode: string,
        state?: string,
    ): Promise<void> {
        try {
            const authToken = await this.getApiToken();

            if (!authToken) {
                throw new Error('Authorization token not found in local storage');
            }

            await axios.post(
                getApiUrl('/api/auth/microsoft/login'),
                { code: microsoftAuthCode, state },
                {
                    params: { dashboardId },
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );
        } catch (error) {
            console.error('Error logging in with Microsoft Calendar:', error);
            throw new Error('An unexpected error occurred during Microsoft login');
        }
    }

    /**
     * Get list of Microsoft Calendars
     * @param dashboardId Dashboard identifier
     * @returns MicrosoftCalendarListDto with array of calendars
     */
    async fetchMicrosoftUserCalendars(dashboardId: string): Promise<MicrosoftCalendarListDto> {
        const appAuthToken = await this.getApiToken();

        if (!appAuthToken) {
            throw new Error(
                'Authorization token of Screen Board not found in local storage',
            );
        }

        try {
            const response = await axios.get(
                getApiUrl('/api/events/microsoft/calendars'),
                {
                    headers: {
                        Authorization: `Bearer ${appAuthToken}`,
                    },
                    params: { dashboardId },
                },
            );

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response from Microsoft Calendar API');
            }

            return {
                items: response.data.map((calendar: any) => ({
                    id: calendar.id,
                    name: calendar.name,
                }))
            };
        } catch (error) {
            console.error('Error fetching Microsoft Calendars:', error);
            throw error;
        }
    }

    /**
     * Get Microsoft user profile
     * @param dashboardId Dashboard identifier
     * @returns User profile data
     */
    async fetchUserInfo(dashboardId: string): Promise<UserProfileDto> {
        const appAuthToken = await this.getApiToken();

        if (!appAuthToken) {
            throw new Error(
                'Authorization token of Screen Board not found in local storage',
            );
        }

        try {
            const response = await axios.get(getApiUrl('/api/events/microsoft/user'), {
                headers: {
                    Authorization: `Bearer ${appAuthToken}`,
                },
                params: { dashboardId },
            });

            if (!response.data) {
                throw new Error('Invalid response from Microsoft API');
            }

            return {
                name: response.data.displayName || '',
                email: response.data.userPrincipalName || '',
                picture: response.data.picture,
            };
        } catch (error) {
            console.error('Error fetching Microsoft user info:', error);
            throw new Error('Failed to fetch Microsoft user information');
        }
    }

    /**
     * Map Microsoft Calendar event to SimpleEventDto
     */
    private mapMicrosoftEventToSimpleDto(microsoftEvent: any): SimpleEventDto {
        return {
            id: microsoftEvent.id || '',
            summary: microsoftEvent.summary || 'Untitled Event',
            start: {
                dateTime: microsoftEvent.start?.dateTime,
                date: microsoftEvent.start?.dateTime?.split('T')[0], // Extract date if needed
            },
            end: {
                dateTime: microsoftEvent.end?.dateTime,
                date: microsoftEvent.end?.dateTime?.split('T')[0], // Extract date if needed
            },
            location: microsoftEvent.location || '',
            description: microsoftEvent.description || '',
            creator: microsoftEvent.organizer
                ? {
                    email: microsoftEvent.organizer.emailAddress?.address,
                    displayName: microsoftEvent.organizer.emailAddress?.name,
                }
                : undefined,
        };
    }

    /**
     * Get API token from access token use case
     */
    private async getApiToken(): Promise<string | null> {
        try {
            const token = await this.accessTokenUseCase.getAccessToken();
            return token;
        } catch (error) {
            console.error('Failed to get access token:', error);
            return null;
        }
    }
}
