import { SimpleEventDto } from '../../domain/dtos/SimpleEventDto';
import axios from 'axios';
import { inject, singleton } from 'tsyringe';
import type { FetchAccessTokenInputPort } from '../../application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import { getApiUrl } from './helper';

/**
 * ICalEventsAdapter - Hexagonal Architecture Adapter Layer
 * Handles fetching and parsing events from iCal feeds
 * Supports all iCal-compatible sources
 * NOTE: Backend endpoint /api/events/ical needs to be implemented for full functionality
 */
@singleton()
export class ICalEventsAdapter {
    private accessTokenUseCase: FetchAccessTokenInputPort;

    constructor(
        @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
        fetchAccessTokenUseCase: FetchAccessTokenInputPort,
    ) {
        this.accessTokenUseCase = fetchAccessTokenUseCase;
    }

    /**
     * Fetch events from iCal feed
     * @param icalLink URL to iCal feed
     * @param maxEvents Maximum number of events to return
     * @returns Array of SimpleEventDto objects
     */
    async fetchICalEvents(
        icalLink: string,
        maxEvents?: number,
    ): Promise<SimpleEventDto[]> {
        const appAuthToken = await this.getApiToken();

        if (!appAuthToken) {
            throw new Error(
                'Authorization token of Screen Board not found in local storage',
            );
        }

        try {
            // Call backend endpoint to fetch and parse iCal feed
            // The backend handles CORS and iCal parsing
            const response = await axios.get(getApiUrl('/api/events/ical'), {
                headers: {
                    Authorization: `Bearer ${appAuthToken}`,
                },
                params: {
                    url: icalLink,
                },
            });

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response from iCal feed');
            }

            let events = response.data.map((icalEvent: any) =>
                this.mapICalEventToSimpleDto(icalEvent),
            );

            // Apply maxEvents limit if specified
            if (maxEvents && events.length > maxEvents) {
                events = events.slice(0, maxEvents);
            }

            return events;
        } catch (error) {
            console.error('Error fetching iCal events:', error);
            throw error;
        }
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

    /**
     * Map iCal event to SimpleEventDto
     */
    private mapICalEventToSimpleDto(icalEvent: any): SimpleEventDto {
        return {
            id: icalEvent.uid || icalEvent.id || '',
            summary: icalEvent.summary || 'Untitled Event',
            start: {
                date: icalEvent.start?.date,
                dateTime: icalEvent.start?.dateTime,
            },
            end: {
                date: icalEvent.end?.date,
                dateTime: icalEvent.end?.dateTime,
            },
            location: icalEvent.location,
            description: icalEvent.description,
            creator: icalEvent.organizer
                ? {
                    email: icalEvent.organizer.email,
                    displayName: icalEvent.organizer.displayName,
                }
                : undefined,
        };
    }
}
