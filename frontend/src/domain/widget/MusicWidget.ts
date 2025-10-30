import { z } from 'zod';
import { Widget } from '../entities/Widget';
import { WidgetTypeEnum } from '../../domain/types/widget/WidgetTyp';

interface MusicWidgetSettings {}

export class MusicWidget extends Widget {
  settings: MusicWidgetSettings;
  readonly type = WidgetTypeEnum.MUSIC;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: MusicWidgetSettings,
    id?: string,
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.MUSIC, id);
    this.settings = settings;
  }

  static settingsSchema = z.object({});

  validateSettings(): boolean {
    return MusicWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return MusicWidget.settingsSchema;
  }
}
