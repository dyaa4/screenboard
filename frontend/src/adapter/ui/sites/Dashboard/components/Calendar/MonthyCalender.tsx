import { getLocale } from '@adapter/ui/helpers/dateHelper';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { SimpleEventDto } from '@domain/dtos/SimpleEventDto';
import { Layout } from '@domain/entities/Layout';
import { getFontSizeClass, getGlassBackground } from '@sites/Dashboard/helper';
import {
  addDays,
  eachDayOfInterval,
  format,
  isToday,
  startOfDay,
} from 'date-fns';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { getColorTermine } from './helper';
import { Card, CardBody, CardHeader } from '@heroui/react';

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

  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
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
    const dayString = format(day, 'yyyy-MM-dd');

    return events.filter((event) => {
      // Use event.start.date if available (all-day events)
      if (event.start.date) {
        return event.start.date === dayString;
      }

      // Otherwise use dateTime
      if (event.start.dateTime) {
        return format(new Date(event.start.dateTime), 'yyyy-MM-dd') === dayString;
      }

      return false;
    });
  };

  const renderEventItem = (event: SimpleEventDto) => {
    const backgroundColor = getColorTermine(
      event?.creator?.email || '',
      theme === 'dark',
    );

    const timeString =
      event.start.date && !event.start.dateTime
        ? t('sites.dashboard.components.calendar.allDay')
        : event.start.dateTime
          ? `${format(new Date(event.start.dateTime), 'HH:mm')}${event.end?.dateTime ? ' - ' + format(new Date(event.end.dateTime), 'HH:mm') : ''}`
          : '';

    return (
      <Card
        key={event.id}
        className={`${getFontSizeClass(layout?.fontSize)} w-full mb-0.5 justify-start`}
        style={{ backgroundColor }}
        shadow='sm'
      >
        <div className="w-full text-left py-1 px-2">
          {/* Event Title */}
          <div
            title={event.summary}
            className="font-semibold truncate leading-tight"
          >
            {event.summary || t('sites.dashboard.components.calendar.unnamedEvent')}
          </div>

          {/* Time or All-Day Indicator */}
          {timeString && (
            <div className={`${getFontSizeClass(layout?.fontSize)} text-xs opacity-75`}>
              🕐 {timeString}
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className={`${getFontSizeClass(layout?.fontSize)} text-xs opacity-65 truncate`}>
              📍 {event.location}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className={`${getFontSizeClass(layout?.fontSize)} text-xs opacity-55 line-clamp-1`}>
              {event.description}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const isCurrentDay = isToday(day);
    const hasEvents = dayEvents.length > 0;
    const customColors = getCustomColorCssClass(layout, theme);
    const hasCustomColor = layout?.customColor && customColors;

    return (
      <Card
        key={day.toString()}
        className="shrink-0 w-[250px] min-h-[180px] max-h-[350px] overflow-x-hidden shadow-xl backdrop-blur-xl border border-white/10"
        style={{
          background: hasCustomColor
            ? `linear-gradient(135deg, ${customColors!.backgroundColor || getGlassBackground(theme)} 0%, ${customColors!.backgroundColor || getGlassBackground(theme)} 100%)`
            : getGlassBackground(theme),
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: hasCustomColor
            ? `0 4px 16px 0 rgba(0, 0, 0, 0.1), 0 0 30px -8px ${customColors!.backgroundColor || 'transparent'}`
            : '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardHeader className="flex-col items-start pb-1 pt-2 px-3 bg-transparent">
          <p className={`font-bold ${getFontSizeClass(layout?.fontSize)}`}>
            {format(day, 'd. MMM', { locale })}
          </p>
          <p
            className={`${getFontSizeClass(layout?.fontSize)} text-xs ${isCurrentDay ? 'text-primary' : 'text-default-500'}`}
          >
            {isCurrentDay
              ? t('sites.dashboard.components.calendar.today')
              : format(day, 'EEE', { locale })}
          </p>
        </CardHeader>
        <CardBody className="overflow-y-hidden overflow-x-hidden pt-1 px-2 py-2 bg-transparent">
          {hasEvents ? (
            <div className="space-y-0.5">
              {dayEvents.map(renderEventItem)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FaCheck
                className={`${getFontSizeClass(layout?.fontSize)} text-default-300 mb-1`}
              />
              <p
                className={`${getFontSizeClass(layout?.fontSize)} text-xs text-center text-default-400`}
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
    <div className="relative w-full bg-transparent">
      <div className="flex gap-4 transition-all duration-500 bg-transparent">
        {visibleDays.map(renderDay)}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
