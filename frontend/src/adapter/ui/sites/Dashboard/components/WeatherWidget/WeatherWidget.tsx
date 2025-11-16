import { WeatherDay } from '@adapter/ui/types/weather/WeatherDay';
import { useNext5DaysWeather } from '@hooks/sites/dashboardSite/useNext5DaysWeather';
import { getFontSizeClass, getGlassBackground } from '@sites/Dashboard/helper';
import classNames from 'classnames';
import MenuSection from '../MenuSection/MenuSection';
import { getIcon } from './helper';

import { getLocale } from '@adapter/ui/helpers/dateHelper';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import i18n, { t } from '@adapter/ui/i18n/i18n';
import { format, isToday, parseISO } from 'date-fns';
import { useTheme } from 'next-themes';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Widget } from '../../../../../../domain/entities/Widget';
import { WeatherWidgetSettings } from '../../../../../../domain/types';
import NotConfiguredMessage from '../../../../components/NotConfiguredMessage/NotConfiguredMessage';
import { Card, CardBody } from '@heroui/react';
import WidgetSkeleton from '../WidgetSkeleton/WidgetSkeleton';

export interface WeatherProps {
  widget: Widget;
  dashboardId: string | undefined;
  layout: Layout | undefined;
}

const WeatherWidget = (props: WeatherProps): React.ReactNode => {
  const { widget, layout, dashboardId } = props;
  const { city } = widget.settings as WeatherWidgetSettings;
  const { theme } = useTheme();

  const locale = getLocale(i18n.language);

  const {
    data: weatherDataListe,
    loading,
    error,
  } = useNext5DaysWeather(city, i18n.language);

  const getDays = (layout: Layout | undefined): React.ReactNode[] => {
    return (weatherDataListe || [])?.map((day: WeatherDay) => {
      const isCurrentDay = isToday(parseISO(day.date));
      const customColors = getCustomColorCssClass(layout, theme);
      const hasCustomColor = layout?.customColor && customColors;

      return (
        <Card
          key={day.id}
          className="flex-1 min-w-[160px] h-[7vw] max-h-[140px] min-h-[120px] overflow-x-hidden shadow-xl backdrop-blur-xl border border-white/10"
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
          <CardBody className="flex flex-row justify-between p-3 gap-2 overflow-x-hidden bg-transparent">
            <div className="flex flex-col justify-between flex-1">
              <div>
                <p
                  className={classNames(
                    getFontSizeClass(layout?.fontSize),
                    'font-semibold leading-tight',
                    {
                      'text-primary': isCurrentDay,
                    },
                  )}
                >
                  {day.name}
                </p>
                <p
                  className={classNames(
                    getFontSizeClass(layout?.fontSize),
                    'text-default-500 text-xs'
                  )}
                >
                  {format(day.date, 'd. MMM', { locale })}
                </p>
              </div>
              <p className="flex items-baseline text-2xl font-bold leading-tight">
                {day.temperature}
                <span className="text-xs ml-0.5 text-default-500">
                  °C
                </span>
              </p>
            </div>
            <div className="flex items-center justify-center">
              <i
                className={classNames(
                  'text-4xl text-default-400',
                  getIcon(day.weather),
                  day.weather.toLowerCase(),
                )}
              />
            </div>
          </CardBody>
        </Card>
      );
    });
  };

  return (
    <MenuSection
      icon="fa-solid fa-sun"
      scrollable
      layout={layout}
      title={`${t(widget.title)}: ${city}`}
    >
      {loading ? (
        <WidgetSkeleton layout={layout} variant="weather" />
      ) : error ? (
        <NotConfiguredMessage
          message={t('sites.dashboard.components.weatherWidget.notConfigured')}
          icon={'fa-solid fa-cloud-sun-rain'}
          color={'danger'}
          dashboardId={dashboardId}
          layout={layout}
        />
      ) : (
        <div className="flex gap-4 w-full bg-transparent">{getDays(layout)}</div>
      )}
    </MenuSection>
  );
};

export default WeatherWidget;
