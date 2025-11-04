import { SimpleEventDto } from '../../../../../domain/dtos/SimpleEventDto';
import { Widget } from '../../../../../domain/entities/Widget';
import { EventWidgetSettings, EventType } from '../../../../../domain/types/widget/EventWidgetSettings';
import { useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';
import GoogleCalendarAdapter from '../../../../../adapter/api/GoogleCalendarAdapter';
import { ICalEventsAdapter } from '../../../../../adapter/api/ICalEventsAdapter';
import { MicrosoftCalendarAdapter } from '../../../../../adapter/api/MicrosoftCalendarAdapter';

interface UseEventsReturn {
    events: SimpleEventDto[];
    loading: boolean;
    isNotConfigured: boolean;
    error: string | null;
    loadEvents: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing events from multiple sources
 * Application Layer - Hexagonal Architecture
 * Supports: Google Calendar, iCal feeds, Microsoft Calendar
 */
export const useEvents = (widget: Widget): UseEventsReturn => {
    const [events, setEvents] = useState<SimpleEventDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isNotConfigured, setIsNotConfigured] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const settings = widget.settings as EventWidgetSettings;

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (!settings.type) {
                setIsNotConfigured(true);
                setLoading(false);
                return;
            }

            let fetchedEvents: SimpleEventDto[] = [];

            // Google Calendar
            if (settings.type === EventType.GOOGLE) {
                if (!settings.calendarId) {
                    setIsNotConfigured(true);
                    setLoading(false);
                    return;
                }

                const googleAdapter = container.resolve(GoogleCalendarAdapter);
                fetchedEvents = await googleAdapter.fetchGoogleCalendarEvents(
                    widget.dashboardId,
                    settings.calendarId,
                );
                setIsNotConfigured(false);
            }
            // iCal Events
            else if (settings.type === EventType.ICAL) {
                if (!settings.icalLink) {
                    setIsNotConfigured(true);
                    setLoading(false);
                    return;
                }

                const icalAdapter = container.resolve(ICalEventsAdapter);
                fetchedEvents = await icalAdapter.fetchICalEvents(
                    settings.icalLink,
                    settings.maxEvents || 10,
                );
                setIsNotConfigured(false);
            }
            // Microsoft Calendar
            else if (settings.type === EventType.MICROSOFT) {
                if (!settings.calendarId) {
                    setIsNotConfigured(true);
                    setLoading(false);
                    return;
                }

                const microsoftAdapter = container.resolve(MicrosoftCalendarAdapter);
                fetchedEvents = await microsoftAdapter.fetchMicrosoftCalendarEvents(
                    widget.dashboardId,
                    settings.calendarId
                );
                setIsNotConfigured(false);
            } else {
                setIsNotConfigured(true);
                setLoading(false);
                return;
            }

            // Filter past events and sort by start date
            // Temporarily disabled for testing - shows all events
            const futureEvents = fetchedEvents
                .sort((a, b) => {
                    const dateA = new Date(a.start.dateTime || a.start.date || new Date());
                    const dateB = new Date(b.start.dateTime || b.start.date || new Date());
                    return dateA.getTime() - dateB.getTime();
                });

            setEvents(futureEvents);
            setLoading(false);
        } catch (err) {
            console.error('Error loading events:', err);
            setError(err instanceof Error ? err.message : 'Failed to load events');
            setLoading(false);
        }
    }, [widget.dashboardId, settings]);

    useEffect(() => {
        // Initial load
        loadEvents();

        // Auto-polling for iCal events every 5 minutes
        if (settings.type === EventType.ICAL) {
            const pollInterval = setInterval(() => {
                loadEvents();
            }, 5 * 60 * 1000); // 5 minutes

            // Cleanup interval on unmount or settings change
            return () => clearInterval(pollInterval);
        }
    }, [loadEvents, settings.type]);

    return {
        events,
        loading,
        isNotConfigured,
        error,
        loadEvents,
    };
};
