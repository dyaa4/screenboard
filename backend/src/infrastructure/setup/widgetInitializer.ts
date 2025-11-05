
import { Widget } from '../../domain/entities/Widget';
import { WidgetTypeEnum } from '../../domain/types';
import { EventType } from '../../domain/types/widget/EventWidgetSettings';
import { ALLOWED_DATE_FORMATS } from '../../domain/valueObjects/dateTimeFormats';
import { ALLOWED_TIMEZONES } from '../../domain/valueObjects/timezones';

export async function initializeWidgets(
  dashboardId: string,
): Promise<Omit<Widget, '_id'>[]> {
  const defaultWidgets: Omit<Widget, '_id'>[] = [
    {
      type: WidgetTypeEnum.NEWS,
      title: 'domain.widget.news',
      dashboardId: dashboardId,
      position: 4,
      isActive: true,
      settings: {
        maxArticles: 5,
        rssUrl: 'https://rss.dw.com/xml/rss-de-all',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.WEATHER,
      title: 'domain.widget.weather',
      dashboardId: dashboardId,
      position: 2,
      isActive: true,
      settings: {
        city: 'Berlin',
        units: 'celsius'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.EVENTS,
      title: 'domain.widget.events',
      dashboardId: dashboardId,
      position: 3,
      isActive: true,
      settings: {
        maxEvents: 10,
        type: EventType.GOOGLE,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.DATETIME,
      title: 'domain.widget.datetime',
      dashboardId: dashboardId,
      position: 0,
      isActive: true,
      settings: {
        format: ALLOWED_DATE_FORMATS[4].key,
        timezone: ALLOWED_TIMEZONES[2], // Berlin
        timeformat: '24h',
        clockType: 'digital',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.REMARKS,
      title: 'domain.widget.remarks',
      dashboardId: dashboardId,
      position: 1,
      isActive: true,
      settings: {
        intervalMinutes: 5,
        remarks: [
          'Wer wagt, gewinnt.',
          'Alles hat seine Zeit.',
          'Träume nicht dein Leben, lebe deinen Traum.',
          'Die Zeit heilt alle Wunden.',
          'Ein Tag ohne Lachen ist ein verlorener Tag.',
          'Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben.',
          'Das Leben ist zu kurz, um lange schlechte Laune zu haben.',
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.QRCODES,
      title: 'domain.widget.qrcodes',
      dashboardId: dashboardId,
      position: 6,
      isActive: false,
      settings: {
        qrcodes: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.MUSIC,
      title: 'domain.widget.music',
      dashboardId: dashboardId,
      position: 5,
      isActive: false,
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.NOTES,
      title: 'domain.widget.notes',
      dashboardId: dashboardId,
      position: 7,
      isActive: false,
      settings: {
        content: '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: WidgetTypeEnum.IOT,
      title: 'domain.widget.iot',
      dashboardId: dashboardId,
      position: 8,
      isActive: false,
      settings: {

      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  return defaultWidgets;
}