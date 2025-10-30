// DateTimeWidget.ts
import { z } from "zod";
import { Widget } from "../entities/Widget";
import { WidgetTypeEnum } from "../../domain/types/widget/WidgetTyp";
import { DateTimeWidgetSettings } from "../../domain/types";

export class DateTimeWidget extends Widget {

  settings: DateTimeWidgetSettings;
  readonly type = WidgetTypeEnum.DATETIME;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: DateTimeWidgetSettings,
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.DATETIME);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    timezone: z.string(),
    format: z.string(),
    timeformat: z.enum(['12h', '24h']),
    clockType: z.enum(['digital', 'analog'])
  });

  validateSettings(): boolean {
    return DateTimeWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return DateTimeWidget.settingsSchema;
  }
}