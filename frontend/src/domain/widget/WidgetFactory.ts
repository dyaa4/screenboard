import { WidgetTypeEnum } from '@domain/types/widget/WidgetTyp';
import { Widget } from '../entities/Widget';
import { DateTimeWidget } from './DateTimeWidget';
import { EventsWidget } from './EventsWidget';
import { MusicWidget } from './MusicWidget';
import { QRCodesWidget } from './QRCodesWidget';
import { RemarksWidget } from './RemarksWidget';
import { WeatherWidget } from './WeatherWidget';
import { NewsWidget } from './NewsWidget';
import { NotesWidget } from './NotesWidget';
import { IoTWidget } from './IoTWidget';

interface WidgetData {
  dashboardId: string;
  title: string;
  position: number;
  isActive: boolean;
  type: WidgetTypeEnum;
  settings: any;
  _id?: string;
}

export class WidgetFactory {
  createWidget(data: WidgetData): Widget {
    switch (data.type) {
      case WidgetTypeEnum.NEWS:
        return new NewsWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );

      case WidgetTypeEnum.WEATHER:
        return new WeatherWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );

      case WidgetTypeEnum.EVENTS:
        return new EventsWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );

      case WidgetTypeEnum.REMARKS:
        return new RemarksWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );

      case WidgetTypeEnum.DATETIME:
        return new DateTimeWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );

      case WidgetTypeEnum.QRCODES:
        return new QRCodesWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );

      case WidgetTypeEnum.MUSIC:
        return new MusicWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );
      case WidgetTypeEnum.NOTES:
        return new NotesWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );
      case WidgetTypeEnum.IOT:
        return new IoTWidget(
          data.dashboardId,
          data.title,
          data.position,
          data.isActive,
          data.settings,
          data._id,
        );
      default:
        throw new Error(`Unknown widget type: ${data.type}`);
    }
  }
}
