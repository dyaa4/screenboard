// QRCodesWidget.ts
import { z } from "zod";
import { Widget } from "../entities/Widget";
import { WidgetTypeEnum } from "../../domain/types/widget/WidgetTyp";
import { QRCodeWidgetSettings } from "../../domain/types";

export class QRCodesWidget extends Widget {
  settings: QRCodeWidgetSettings;
  readonly type = WidgetTypeEnum.QRCODES;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: QRCodeWidgetSettings,
  ) {
    super(dashboardId, title, position, isActive, WidgetTypeEnum.QRCODES);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    qrcodes: z.array(z.object({
      name: z.string(),
      type: z.enum(['text', 'url', 'wifi']),
      data: z.object({
        text: z.string().optional(),
        url: z.string().url().optional(),
        wifi: z.object({
          ssid: z.string(),
          password: z.string(),
          encryption: z.enum(['WPA', 'WEP', 'nopass'])
        }).optional()
      })
    }))
  });

  validateSettings(): boolean {
    return QRCodesWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return QRCodesWidget.settingsSchema;
  }
}