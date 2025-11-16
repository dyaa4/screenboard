import i18n from '@adapter/ui/i18n/i18n';
import { Layout } from '@domain/entities/Layout';
import { Widget } from '@domain/entities/Widget';
import { DateTimeWidgetSettings } from '@domain/types';

import { format, toZonedTime } from 'date-fns-tz';
import * as dateFnsLocales from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { getLocale } from '@adapter/ui/helpers/dateHelper';
import { getGlassBackground } from '@sites/Dashboard/helper';
import { useTheme } from 'next-themes';

const useCurrentDateEffect = (timezone: string): Date => {
  const [date, setDate] = useState<Date>(() =>
    toZonedTime(new Date(), timezone),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(toZonedTime(new Date(), timezone));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [timezone]);

  return date;
};

export interface TimeProps {
  widget: Widget;
  layout: Layout | undefined;
}

const Time: React.FC<TimeProps> = ({ widget }) => {
  const widgetSettings = widget?.settings as DateTimeWidgetSettings | undefined;
  const timezone = widgetSettings?.timezone || 'UTC';
  const timeformat = widgetSettings?.timeformat || '24h';
  const clockType = widgetSettings?.clockType || 'digital';
  const { theme } = useTheme();

  const dateFormat = timeformat === '24h' ? 'HH:mm' : 'hh:mm a';

  const currentLang = i18n.language;

  const date = useCurrentDateEffect(timezone);

  const formattedTime = React.useMemo(() => {
    try {
      const localeKey = currentLang.replace(
        '-',
        '',
      ) as keyof typeof dateFnsLocales;
      const locale = dateFnsLocales[localeKey] || dateFnsLocales.enUS;

      return format(date, dateFormat, {
        timeZone: timezone,
        locale: locale,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date Format';
    }
  }, [date, dateFormat, timezone, currentLang]);

  return (
    <div className="time-widget">
      {clockType === 'digital' ? (
        <div
          className="inline-block px-8 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/10"
          style={{
            background: getGlassBackground(theme),
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <span className="time text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-lg">
            {formattedTime}
          </span>
        </div>
      ) : (
        <div
          className="analog-clock-container p-4 rounded-full shadow-2xl backdrop-blur-xl border border-white/10"
          style={{
            background: getGlassBackground(theme),
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <Clock
            value={date}
            renderNumbers={true}
            size={150}
            hourHandWidth={4}
            minuteHandWidth={3}
            secondHandWidth={2}
            hourHandLength={50}
            minuteHandLength={70}
            secondHandLength={80}
          />
        </div>
      )}
    </div>
  );
};

export default Time;
