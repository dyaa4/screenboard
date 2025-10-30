// RemarksWidget.ts
import { z } from 'zod';
import { Widget } from '../entities/Widget';
import { WidgetTypeEnum } from '@domain/types/widget/WidgetTyp';
import { RemarkWidgetSettings } from '@domain/types';

export class RemarksWidget extends Widget {
  settings: RemarkWidgetSettings;
  readonly type = WidgetTypeEnum.REMARKS;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: RemarkWidgetSettings,
    id?: string,
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.REMARKS, id);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    remarks: z.array(z.string()).min(1),
    intervalMinutes: z.number().min(1).max(60),
  });

  validateSettings(): boolean {
    return RemarksWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return RemarksWidget.settingsSchema;
  }
}
