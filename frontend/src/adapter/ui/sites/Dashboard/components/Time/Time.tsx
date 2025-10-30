import i18n from '@adapter/ui/i18n/i18n';
import { Layout } from '@domain/entities/Layout';
import { Widget } from '@domain/entities/Widget';
import { DateTimeWidgetSettings } from '@domain/types';

import { format, toZonedTime } from 'date-fns-tz';
import * as dateFnsLocales from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css'; // Importieren Sie die CSS-Datei für die Uhr

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
        <span className="time">{formattedTime}</span>
      ) : (
        <div className="analog-clock-container p-4 bg-white/80 dark:bg-content1/80 rounded-full shadow-lg">
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
