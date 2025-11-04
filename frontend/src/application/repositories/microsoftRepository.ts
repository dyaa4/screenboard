import { SimpleEventDto } from '@domain/dtos/SimpleEventDto';

export interface MicrosoftCalendarListDto {
    items: { id: string; name: string }[];
}

export interface UserProfileDto {
    name: string;
    email: string;
    picture?: string;
}

export interface MicrosoftRepository {
    fetchMicrosoftUserCalendars(dashboardId: string): Promise<MicrosoftCalendarListDto>;
    fetchMicrosoftCalendarEvents(
        dashboardId: string,
        calendarId: string,
    ): Promise<SimpleEventDto[]>;
    fetchUserInfo(dashboardId: string): Promise<UserProfileDto>;
    loginForMicrosoftCalendar(
        dashboardId: string,
        microsoftAuthCode: string,
        state?: string,
    ): Promise<void>;
    getLoginStatus(dashboardId: string): Promise<boolean>;
    logout(dashboardId: string): Promise<void>;
}