import { getLocale } from '@adapter/ui/helpers/dateHelper';
import i18n from '@adapter/ui/i18n/i18n';
import { Layout } from '@domain/entities/Layout';
import { Widget } from '@domain/entities/Widget';
import { DateTimeWidgetSettings } from '@domain/types';

import { format } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';

export interface DateInfoProps {
  widget: Widget;
  layout: Layout | undefined;
}

const DEFAULT_FORMAT = 'dd.MM.yyyy';
const UPDATE_INTERVAL = 1000; // 1 second

const DateInfo: React.FC<DateInfoProps> = ({ widget }) => {
  const widgetSettings = widget?.settings as DateTimeWidgetSettings | undefined;
  const currentLang = i18n.language;
  const locale = getLocale(currentLang);

  const dateFormat = useMemo(
    () => widgetSettings?.format || DEFAULT_FORMAT,
    [widgetSettings],
  );

  const [currentTime, setCurrentTime] = useState<string>(() =>
    format(new Date(), dateFormat, {
      locale: locale,
    }),
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        format(new Date(), dateFormat, {
          locale: locale,
        }),
      );
    };

    updateTime(); // Initial update

    const intervalId = setInterval(updateTime, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [dateFormat]);

  return <span className="date">{currentTime}</span>;
};

export default DateInfo;
