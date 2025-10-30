import { z } from 'zod';
import { Widget } from '../entities/Widget';
import { WidgetTypeEnum } from '../../domain/types/widget/WidgetTyp';
import { IoTWidgetSettings } from '../../domain/types';

export class IoTWidget extends Widget {
  settings: IoTWidgetSettings;
  readonly type = WidgetTypeEnum.IOT;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: IoTWidgetSettings,
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.IOT);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    devices: z.array(
      z.object({
        deviceId: z.string(),
        name: z.string(),
        label: z.string().optional(),
        roomName: z.string().optional(),
        type: z.string(),
        capabilities: z.array(z.string().optional()).default([]),
        provider: z.enum(['smartthings', 'tuya', 'none']),
        status: z.record(z.string(), z.record(z.string(), z.any())).optional(),
        selected: z.boolean(),
      })
    ).default([]),
  });

  validateSettings(): boolean {
    return true;
  }

  getSettingsSchema(): z.ZodSchema {
    return IoTWidget.settingsSchema;
  }
}