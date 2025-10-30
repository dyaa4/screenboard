import i18n, { t } from '@adapter/ui/i18n/i18n';
import { CommunicationRepository } from '../../../../../../application/repositories/communicationRepository';
import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import NotConfiguredMessage from '@components/NotConfiguredMessage/NotConfiguredMessage';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Widget } from '../../../../../../domain/entities/Widget';
import { useCalendarEvents } from '@hooks/sites/dashboardSite/useCalendarEvents';
import { JSX, useEffect } from 'react';
import { container } from 'tsyringe';
import MenuSection from '../MenuSection/MenuSection';
import MonthlyCalendar from './MonthyCalender';
import WidgetSkeleton from '../WidgetSkeleton/WidgetSkeleton';

export interface KalenderProps {
  widget: Widget;
  layout: Layout | undefined;
}

function Calendar({ widget, layout }: KalenderProps): JSX.Element {
  const { events, loading, isNotConfigured, loadEvents } =
    useCalendarEvents(widget);

  useEffect(() => {
    const communicationService = container.resolve<CommunicationRepository>(
      COMMUNICATION_REPOSITORY_NAME,
    );

    const messageHandler = () => {
      loadEvents(false);
    };

    communicationService.receiveGoogleCalendarMessage(messageHandler);

    communicationService.connect(widget.dashboardId); // Type cast wegen Interface

    return () => {
      communicationService.abmelden('google-calendar-event');
    };
  }, [widget.dashboardId]); // Korrekte Dependencies

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
