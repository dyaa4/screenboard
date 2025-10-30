import { getLocale } from '@adapter/ui/helpers/dateHelper';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { SimpleEventDto } from '@domain/dtos/SimpleEventDto';
import { Layout } from '@domain/entities/Layout';
import { getFontSizeClass } from '@sites/Dashboard/helper';
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfDay,
} from 'date-fns';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { getColorTermine } from './helper';
import { Card, CardBody, CardHeader, Chip } from '@heroui/react';

interface MonthlyCalendarProps {
  events: SimpleEventDto[];
  daysToShow: number;
  currentLang: string;
  layout: Layout | undefined;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  events,
  daysToShow = 30,
  currentLang,
  layout,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const locale = getLocale(currentLang);

  // State für die anzuzeigenden Tage
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);

  // Initialisierung und Update der Tage
  useEffect(() => {
    const updateDays = () => {
      const currentStart = startOfDay(new Date());
      const newDays = eachDayOfInterval({
        start: currentStart,
        end: addDays(currentStart, daysToShow - 1),
      });

      setVisibleDays(newDays);
    };

    // Initial Update
    updateDays();

    // Tägliches Update um Mitternacht
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      updateDays();

      // Setze einen Interval für weitere Updates
      const dailyInterval = setInterval(updateDays, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [daysToShow]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = event.start.date
        ? new Date(event.start.date)
        : new Date(event.start.dateTime || '');

      return isSameDay(day, eventDate);
    });
  };

  const renderEventItem = (event: SimpleEventDto) => {
    const backgroundColor = getColorTermine(
      event?.creator?.email || '',
      theme === 'dark',
    );
    return (
      <Chip
        key={event.id}
        className={`${getFontSizeClass(layout?.fontSize)} w-full mb-1 justify-start`}
        style={{ backgroundColor }}
        variant="flat"
      >
        <div className="w-full text-left">
          <div
            title={event.summary}
            className="font-bold truncate"
          >
            {event.summary}
          </div>
          <div className={`${getFontSizeClass(layout?.fontSize)} text-xs opacity-80 truncate`}>
            {event.start.dateTime && (
              <>{format(new Date(event.start.dateTime), 'HH:mm')}</>
            )}

            {event.end?.dateTime && ' - '}
            {event.end?.dateTime && (
              <>{format(new Date(event.end.dateTime), 'HH:mm')}</>
            )}
            {event.end?.date && t('sites.dashboard.components.calendar.allDay')}
          </div>
        </div>
      </Chip>
    );
  };

  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const isCurrentDay = isToday(day);
    const hasEvents = dayEvents.length > 0;

    return (
      <Card
        key={day.toString()}
        className="shrink-0 w-[250px] min-h-[180px] max-h-[350px] overflow-x-hidden transition-shadow duration-300 shadow-lg hover:shadow-xl"
        style={{
          ...getCustomColorCssClass(layout, theme),
        }}
      >
        <CardHeader className="flex-col items-start pb-2">
          <p className={`font-bold ${getFontSizeClass(layout?.fontSize)}`}>
            {format(day, 'd. MMMM', { locale })}
          </p>
          <p
            className={`${getFontSizeClass(layout?.fontSize)} ${isCurrentDay ? 'text-primary' : 'text-default-500'}`}
          >
            {isCurrentDay
              ? t('sites.dashboard.components.calendar.today')
              : format(day, 'EEEE', { locale })}
          </p>
        </CardHeader>
        <CardBody className="overflow-y-auto overflow-x-hidden pt-2">
          {hasEvents ? (
            <div className="space-y-1">
              {dayEvents.map(renderEventItem)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FaCheck
                className={`${getFontSizeClass(layout?.fontSize)} text-default-300 mb-2`}
              />
              <p
                className={`${getFontSizeClass(layout?.fontSize)} text-center text-default-400`}
              >
                {t('sites.dashboard.components.calendar.noEvents')}
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-4 transition-all duration-500">
        {visibleDays.map(renderDay)}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
