import { z } from "zod";
import { Widget } from "../entities/Widget";
import { WidgetTypeEnum } from "../../domain/types/widget/WidgetTyp";
import { WeatherWidgetSettings } from "../../domain/types";

export class WeatherWidget extends Widget {
  settings: WeatherWidgetSettings;
  readonly type = WidgetTypeEnum.WEATHER;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: WeatherWidgetSettings
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.WEATHER);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    city: z.string().min(1),
    units: z.enum(['celsius', 'fahrenheit']),
  });

  validateSettings(): boolean {
    return WeatherWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return WeatherWidget.settingsSchema;
  }
}