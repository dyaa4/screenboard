import { z } from 'zod';
import { Widget } from '../entities/Widget';
import { WidgetTypeEnum } from '@domain/types/widget/WidgetTyp';
import { IoTWidgetSettings } from '@domain/types';

export class IoTWidget extends Widget {
  settings: IoTWidgetSettings;
  readonly type = WidgetTypeEnum.IOT;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: IoTWidgetSettings,
    id?: string,
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.IOT, id);
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
        capabilities: z.array(z.string()),
        provider: z.enum(['smartthings', 'tuya', 'none']),
        status: z.record(z.string(), z.record(z.string(), z.any())).optional(),
        selected: z.boolean(),
      }),
    ),
    provider: z.enum(['smartthings', 'tuya', 'none']),
    autoRefresh: z.boolean(),
    refreshInterval: z.number().min(5).max(3600),
    displayMode: z.enum(['grid', 'list']),
    showOfflineDevices: z.boolean(),
  });

  validateSettings(): boolean {
    return IoTWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return IoTWidget.settingsSchema;
  }
}
