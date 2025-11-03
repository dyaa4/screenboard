import axios from 'axios';
// @ts-ignore
import * as ical from 'node-ical';

export interface SimpleEventDto {
    uid: string;
    summary: string;
    start: {
        date?: string | null;
        dateTime?: string | null;
    };
    end: {
        date?: string | null;
        dateTime?: string | null;
    };
    location?: string | null;
    description?: string | null;
    organizer?: {
        email: string;
        displayName?: string | null;
    } | null;
}

export class EventsService {
    /**
     * Fetch and parse events from an iCal feed
     */
    async fetchICalEvents(icalUrl: string): Promise<SimpleEventDto[]> {
        try {
            // Validate URL format
            try {
                new URL(icalUrl);
            } catch {
                throw new Error('Invalid URL format - not a valid iCal feed URL');
            }

            // Fetch iCal feed from the provided URL
            const response = await axios.get(icalUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Screen Board/1.0',
                },
            });

            if (!response.data) {
                throw new Error('Empty iCal feed - no data returned');
            }

            // Parse iCal data
            const events = ical.parseICS(response.data);
            const parsedEvents: SimpleEventDto[] = [];

            // Convert parsed iCal events to SimpleEventDto format
            for (const event of Object.values(events)) {
                const eventItem = event as any;
                if (eventItem.type === 'VEVENT') {
                    const startDate = eventItem.start || null;
                    const endDate = eventItem.end || null;

                    // Check if this is an all-day event
                    // All-day events have DATE (no time) instead of DATETIME
                    const isAllDay = startDate && typeof startDate === 'object' && !startDate.toISOString().includes('T');

                    parsedEvents.push({
                        uid: eventItem.uid || '',
                        summary: eventItem.summary || '',
                        start: isAllDay
                            ? {
                                date: this.formatDateOnly(startDate),
                                dateTime: null,
                            }
                            : {
                                date: null,
                                dateTime: this.formatDateTime(startDate),
                            },
                        end: isAllDay
                            ? {
                                date: this.formatDateOnly(endDate),
                                dateTime: null,
                            }
                            : {
                                date: null,
                                dateTime: this.formatDateTime(endDate),
                            },
                        location: eventItem.location || null,
                        description: eventItem.description || null,
                        organizer: eventItem.organizer
                            ? {
                                email: eventItem.organizer
                                    .toString()
                                    .replace('mailto:', ''),
                                displayName: eventItem.organizer.params?.CN || null,
                            }
                            : null,
                    });
                }
            }

            // Sort by start date
            parsedEvents.sort((a, b) => {
                const dateA = new Date(a.start.dateTime || a.start.date || 0);
                const dateB = new Date(b.start.dateTime || b.start.date || 0);
                return dateA.getTime() - dateB.getTime();
            });

            // Filter out past events (events that ended before now)
            const now = new Date();
            const futureEvents = parsedEvents.filter((event) => {
                const eventEnd = new Date(event.end.dateTime || event.end.date || 0);
                return eventEnd >= now;
            });

            return futureEvents;
        } catch (error: any) {
            console.error('Error fetching iCal feed:', error);

            // Re-throw with more context
            if (error.code === 'ENOTFOUND') {
                throw new Error('URL not found - the provided iCal feed URL could not be reached');
            }

            if (error.code === 'ECONNREFUSED') {
                throw new Error('Connection refused - could not connect to the iCal feed server');
            }

            if (error.message?.includes('timeout')) {
                throw new Error('Request timeout - the iCal feed took too long to respond');
            }

            throw error;
        }
    }

    /**
     * Helper function to format date only (YYYY-MM-DD)
     */
    private formatDateOnly(date: any): string | null {
        if (!date) return null;

        // If date is already a string, return it as-is
        if (typeof date === 'string') {
            return date;
        }

        // If date is a Date object
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }

        return null;
    }

    /**
     * Helper function to format date time (ISO 8601)
     */
    private formatDateTime(date: any): string | null {
        if (!date) return null;

        // If date is already a string, return it as-is
        if (typeof date === 'string') {
            return date;
        }

        // If date is a Date object
        if (date instanceof Date) {
            return date.toISOString();
        }

        return null;
    }
}
