import i18n, { t } from '@adapter/ui/i18n/i18n';
import NotConfiguredMessage from '@components/NotConfiguredMessage/NotConfiguredMessage';
import { useFetchNews } from '@hooks/sites/dashboardSite/useFetchRSSNews';
import { format } from 'date-fns';
import * as dateFnsLocales from 'date-fns/locale';
import MenuSection from '../MenuSection/MenuSection';
import { Widget } from '../../../../../../domain/entities/Widget';
import { Layout } from '../../../../../../domain/entities/Layout';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { useTheme } from 'next-themes';
import { JSX } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Image } from '@heroui/react';
import WidgetSkeleton from '../WidgetSkeleton/WidgetSkeleton';

export interface NewsProps {
  widget: Widget;
  layout: Layout | undefined;
}

const getLocale = (currentLang: string) => {
  const shortLocaleKey = currentLang.slice(0, 2).toLowerCase();
  const fullLocaleKey = currentLang.replace(
    '-',
    '',
  ) as keyof typeof dateFnsLocales;

  if (shortLocaleKey in dateFnsLocales) {
    return dateFnsLocales[shortLocaleKey as keyof typeof dateFnsLocales];
  } else if (fullLocaleKey in dateFnsLocales) {
    return dateFnsLocales[fullLocaleKey];
  }

  return dateFnsLocales.enUS;
};

function NewsWidget({ widget, layout }: NewsProps): JSX.Element {
  const { rssData, loading, error } = useFetchNews(widget);
  const currentLang = i18n.language;
  const { theme } = useTheme();

  const formatDate = (date: Date) => {
    const locale = getLocale(currentLang);
    return format(date, 'dd. MMMM HH:mm', { locale });
  };

  return (
    <MenuSection
      icon="fa-solid fa-newspaper"
      layout={layout}
      scrollable
      title={t(widget.title)}
    >
      {loading ? (
        <WidgetSkeleton layout={layout} variant="news" />
      ) : (
        <>
          {error ? (
            <NotConfiguredMessage
              message={t('sites.dashboard.components.news.error')}
              icon={'fa-solid fa-newspaper'}
              color={'danger'}
              dashboardId={widget.dashboardId}
              layout={layout}
            />
          ) : (
            <div className="flex gap-4 min-w-max">
              {rssData.map((item: any) => (
                <Card
                  key={item.guid}
                  className="w-80 shrink-0 transition-shadow duration-300 shadow-lg hover:shadow-xl"
                  style={{
                    ...getCustomColorCssClass(layout, theme),
                  }}
                >
                  <CardHeader className="p-0 overflow-hidden">
                    {item.enclosure?.url ? (
                      <Image
                        src={item.enclosure.url}
                        alt={item.title}
                        className="w-full h-48 object-cover cursor-grab active:cursor-grabbing"
                        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='192'%3E%3Crect width='320' height='192' fill='%23f4f4f5'/%3E%3C/svg%3E"
                        onDragStart={(e) => e.preventDefault()}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-default-100">
                        <i className="fa-solid fa-newspaper text-4xl text-default-400"></i>
                      </div>
                    )}
                  </CardHeader>
                  <CardBody className="py-3 px-4 gap-2 overflow-hidden">
                    <h3 className="text-lg font-semibold line-clamp-2" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-default-500 line-clamp-3" title={item.description}>
                      {item.description}
                    </p>
                  </CardBody>
                  <CardFooter className="px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-default-400">
                      {formatDate(new Date(item.pubDate))}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(item.link, '_blank', 'noopener,noreferrer');
                      }}
                      className="cursor-pointer hover:text-primary transition-colors"
                      aria-label="Open article"
                    >
                      <i className="fa-solid fa-external-link text-lg text-default-500 hover:text-primary"></i>
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </MenuSection>
  );
}

export default NewsWidget;
