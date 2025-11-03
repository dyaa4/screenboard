import i18n, { t } from '@adapter/ui/i18n/i18n';
import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import NotConfiguredMessage from '@components/NotConfiguredMessage/NotConfiguredMessage';
import { useEvents } from '@hooks/sites/dashboardSite/useEvents';
import { JSX, useEffect } from 'react';
import { container } from 'tsyringe';
import { CommunicationRepository } from '../../../../../../application/repositories/communicationRepository';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Widget } from '../../../../../../domain/entities/Widget';
import MenuSection from '../MenuSection/MenuSection';
import WidgetSkeleton from '../WidgetSkeleton/WidgetSkeleton';
import MonthlyCalendar from './MonthyCalender';

export interface KalenderProps {
  widget: Widget;
  layout: Layout | undefined;
}

/**
 * Calendar Widget - Main Component
 * Hexagonal Architecture - UI Layer (Adapter)
 * Supports:
 * - Google Calendar (displays as monthly calendar)
 * - iCal feeds (displays as event list)
 * - Microsoft Calendar (displays as event list)
 */
function Calendar({ widget, layout }: KalenderProps): JSX.Element {
  // Use calendar events hook for Google Calendar (existing)
  const { events: calendarEvents, loading: calendarLoading, isNotConfigured: calendarNotConfigured, loadEvents: loadCalendarEvents } =
    useEvents(widget);

  const loading = calendarLoading;
  const isNotConfigured = calendarNotConfigured;
  const events = calendarEvents;
  const loadEvents = loadCalendarEvents;

  useEffect(() => {
    const communicationService = container.resolve<CommunicationRepository>(
      COMMUNICATION_REPOSITORY_NAME,
    );

    const messageHandler = () => {
      loadEvents();
    };

    communicationService.receiveGoogleCalendarMessage(messageHandler);
    communicationService.connect(widget.dashboardId);

    return () => {
      communicationService.abmelden('google-calendar-event');
    };
  }, [widget.dashboardId, loadEvents]);

  return (
    <MenuSection
      icon="fa-solid fa-calendar-day"
      scrollable={!isNotConfigured}
      layout={layout}
      title={t(widget.title)}
    >
      {loading ? (
        <WidgetSkeleton layout={layout} variant="calendar" />
      ) : (
        <>
          {isNotConfigured ? (
            <NotConfiguredMessage
              message={t('sites.dashboard.components.calendar.notConfigured')}
              icon={'fa-solid fa-calendar-day'}
              color={'primary'}
              dashboardId={widget.dashboardId}
              layout={layout}
            />
          ) : (
            // All event types use MonthlyCalendar view with swipe navigation
            <MonthlyCalendar
              events={events}
              daysToShow={30}
              currentLang={i18n.language}
              layout={layout}
            />
          )}
        </>
      )}
    </MenuSection>
  );
}

export default Calendar;
