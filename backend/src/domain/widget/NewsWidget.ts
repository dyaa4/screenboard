import { z } from "zod";
import { Widget } from "../entities/Widget";
import { WidgetTypeEnum } from "../../domain/types/widget/WidgetTyp";
import { NewsWidgetSettings } from "../../domain/types";

export class NewsWidget extends Widget {
  settings: NewsWidgetSettings;
  readonly type = WidgetTypeEnum.NEWS;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: NewsWidgetSettings
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.NEWS);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    maxArticles: z.number().min(1).max(50),
    rssUrl: z.string().url().optional(),
  });

  validateSettings(): boolean {
    return NewsWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return NewsWidget.settingsSchema;
  }
}