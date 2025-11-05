// EventsWidget.ts
import { z } from 'zod';
import { Widget } from '../entities/Widget';
import { WidgetTypeEnum } from '@domain/types/widget/WidgetTyp';
import { EventWidgetSettings } from '@domain/types';
import { EventType } from '@domain/types/widget/EventWidgetSettings';

export class EventsWidget extends Widget {
  settings: EventWidgetSettings;
  readonly type = WidgetTypeEnum.EVENTS;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: EventWidgetSettings,
    id?: string,
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.EVENTS, id);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    type: z.enum([EventType.GOOGLE, EventType.ICAL, EventType.MICROSOFT]),
    calendarId: z.string().optional(),
    icalLink: z.string().url().optional(),
  });

  getSettingsSchema(): z.ZodSchema {
    return EventsWidget.settingsSchema;
  }

  validateSettings(): boolean {
    return EventsWidget.settingsSchema.safeParse(this.settings).success;
  }
}
