import React, { useState, useMemo } from 'react';
import {
  RadioGroup,
  Radio,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
} from '@heroui/react';

import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { ALLOWED_TIMEZONES } from '@domain/valueObjects/timezones';
import { ALLOWED_DATE_FORMATS } from '@domain/valueObjects/dateTimeFormats';
import { FaClock, FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';
import i18n, { t } from '@adapter/ui/i18n/i18n';
import { DateTimeWidgetSettings } from '@domain/types';

interface DateTimeEditProps {
  settings: DateTimeWidgetSettings;
  onSettingsChange: (settings: DateTimeWidgetSettings, valid: boolean) => void;
}

const DateTimeEdit: React.FC<DateTimeEditProps> = ({
  settings: initialSettings,
  onSettingsChange,
}) => {
  const [dateFormat, setDateFormat] = useState(initialSettings.format);
  const [timezone, setTimezone] = useState(initialSettings.timezone);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(
    initialSettings.timeformat || '24h',
  );
  const [clockType, setClockType] = useState<'digital' | 'analog'>(
    initialSettings.clockType || 'digital',
  );
  const [timezones] = useState<string[]>(ALLOWED_TIMEZONES);

  const currentLang = i18n.language;

  const updateSettings = (
    updatedFormat: string,
    updatedTimezone: string,
    updatedTimeFormat: '12h' | '24h',
    updatedClockType: 'digital' | 'analog',
  ): void => {
    if (
      ALLOWED_TIMEZONES.includes(updatedTimezone) &&
      ALLOWED_DATE_FORMATS.some((format) => format.key === updatedFormat) &&
      ['12h', '24h'].includes(updatedTimeFormat) &&
      ['digital', 'analog'].includes(updatedClockType)
    ) {
      onSettingsChange(
        {
          format: updatedFormat,
          timezone: updatedTimezone,
          timeformat: updatedTimeFormat,
          clockType: updatedClockType,
        },
        true,
      );
    } else {
      console.error(
        'Invalid timezone, format, time format or clock type:',
        updatedTimezone,
        updatedFormat,
        updatedTimeFormat,
        updatedClockType,
      );
    }
  };

  const handleFormatChange = (value: string): void => {
    setDateFormat(value);
    updateSettings(value, timezone, timeFormat, clockType);
  };

  const handleTimezoneChange = (value: string): void => {
    setTimezone(value);
    updateSettings(dateFormat, value, timeFormat, clockType);
  };

  const handleTimeFormatChange = (value: string): void => {
    const timeFormatValue = value as '12h' | '24h';
    setTimeFormat(timeFormatValue);
    updateSettings(dateFormat, timezone, timeFormatValue, clockType);
  };

  const handleClockTypeChange = (value: string): void => {
    const clockTypeValue = value as 'digital' | 'analog';
    setClockType(clockTypeValue);
    updateSettings(dateFormat, timezone, timeFormat, clockTypeValue);
  };

  const formatOptions = useMemo(
    () =>
      ALLOWED_DATE_FORMATS.map(({ key }) => ({
        key,
        label: format(new Date(), key, {
          locale: currentLang.startsWith('de') ? de : enUS,
        }),
      })),
    [currentLang],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex gap-3">
          <FaCalendarAlt />
          <div className="flex flex-col">
            <p className="text-md">
              {t('sites.config.components.dateTimeEdit.dateFormat')}
            </p>
            <p className="text-small text-default-500">
              {t('sites.config.components.dateTimeEdit.selectDateFormat')}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Select
            label={t('sites.config.components.dateTimeEdit.dateFormat')}
            placeholder={t(
              'sites.config.components.dateTimeEdit.selectDateFormat',
            )}
            selectedKeys={[dateFormat]}
            onChange={(e) => handleFormatChange(e.target.value)}
          >
            {formatOptions.map(({ key, label }) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex gap-3">
          <FaClock />
          <div className="flex flex-col">
            <p className="text-md">
              {t('sites.config.components.dateTimeEdit.timeSettings')}
            </p>
            <p className="text-small text-default-500">
              {t('sites.config.components.dateTimeEdit.selectTimeFormat')}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <RadioGroup
                label={t('sites.config.components.dateTimeEdit.timeFormat')}
                value={timeFormat}
                onValueChange={handleTimeFormatChange}
              >
                <Radio value="12h">
                  {t('sites.config.components.dateTimeEdit.12h')}
                </Radio>
                <Radio value="24h">
                  {t('sites.config.components.dateTimeEdit.24h')}
                </Radio>
              </RadioGroup>
            </div>
            <div className="flex-1">
              <RadioGroup
                label={t('sites.config.components.dateTimeEdit.clockType')}
                value={clockType}
                onValueChange={handleClockTypeChange}
              >
                <Radio value="digital">
                  {t('sites.config.components.dateTimeEdit.digital')}
                </Radio>
                <Radio value="analog">
                  {t('sites.config.components.dateTimeEdit.analog')}
                </Radio>
              </RadioGroup>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex gap-3">
          <FaGlobeAmericas />
          <div className="flex flex-col">
            <p className="text-md">
              {t('sites.config.components.dateTimeEdit.timezone')}
            </p>
            <p className="text-small text-default-500">
              {t('sites.config.components.dateTimeEdit.selectTimezone')}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Select
            label={t('sites.config.components.dateTimeEdit.timezone')}
            placeholder={t(
              'sites.config.components.dateTimeEdit.selectTimezone',
            )}
            selectedKeys={[timezone]}
            onChange={(e) => handleTimezoneChange(e.target.value)}
          >
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>
    </div>
  );
};

export default DateTimeEdit;
