import { GoogleRepository } from '../../../../../application/repositories/googleRepository';
import { GOOGLE_REPOSITORY_NAME } from '@common/constants';
import { SimpleEventDto } from '../../../../../domain/dtos/SimpleEventDto';
import { Widget } from '../../../../../domain/entities/Widget';
import { useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';

export const useCalendarEvents = (widget: Widget) => {
  const [events, setEvents] = useState<SimpleEventDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNotConfigured, setIsNotConfigured] = useState<boolean>(false);

  const getCalendarEvents = useCallback(
    async (dashboardId: string, calendarId: string) => {
      try {
        const simpleGoogleEventDto = await container
          .resolve<GoogleRepository>(GOOGLE_REPOSITORY_NAME)
          .fetchGoogleCalendarEvents(dashboardId, calendarId);

        setEvents(simpleGoogleEventDto);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
      }
    },
    [],
  );

  const loadEvents = useCallback(
    async (isInitialLoad: boolean) => {
      if (isInitialLoad) {
        setLoading(true);
      }
      try {
        await getCalendarEvents(widget.dashboardId, widget.settings.calendarId);
        setIsNotConfigured(false);
      } catch (error) {
        console.error('Error loading events:', error);
        setIsNotConfigured(true);
      } finally {
        setLoading(false);
      }
    },
    [getCalendarEvents, widget.dashboardId, widget.settings.calendarId],
  );

  useEffect(() => {
    loadEvents(true);
  }, [loadEvents]);

  return { events, loading, isNotConfigured, loadEvents };
};
