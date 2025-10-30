import { WeatherDay } from '@adapter/ui/types/weather/WeatherDay';
import { useNext5DaysWeather } from '@hooks/sites/dashboardSite/useNext5DaysWeather';
import { getFontSizeClass } from '@sites/Dashboard/helper';
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

      return (
        <Card
          key={day.id}
          className="flex-1 min-w-[180px] h-[8vw] max-h-[160px] min-h-[140px] overflow-x-hidden transition-shadow duration-300 shadow-lg hover:shadow-xl"
          style={{
            ...getCustomColorCssClass(layout, theme),
          }}
        >
          <CardBody className="flex flex-row justify-between p-5 overflow-x-hidden">
            <div className="flex flex-col justify-between">
              <div>
                <p
                  className={classNames(
                    getFontSizeClass(layout?.fontSize),
                    'font-semibold',
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
                    'text-default-500'
                  )}
                >
                  {format(day.date, 'd. MMMM', { locale })}
                </p>
              </div>
              <p className="flex items-baseline text-3xl font-bold">
                {day.temperature}
                <span className="text-sm ml-0.5 text-default-500">
                  °C
                </span>
              </p>
            </div>
            <div className="flex items-center">
              <i
                className={classNames(
                  'text-5xl text-default-400',
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
        <div className="flex gap-4 w-full ">{getDays(layout)}</div>
      )}
    </MenuSection>
  );
};

export default WeatherWidget;
