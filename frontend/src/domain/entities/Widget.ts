import { WidgetTypeEnum } from '@domain/types';
import { z } from 'zod';

export abstract class Widget {
  id?: string;
  dashboardId: string;
  title: string;
  position: number;
  isActive: boolean;
  readonly type: WidgetTypeEnum;
  settings: any;

  constructor(
    dashboardId: string,
    title: string,
    position: number,
    isActive: boolean,
    type: WidgetTypeEnum,
    id?: string,
  ) {
    this.dashboardId = dashboardId;
    this.title = title;
    this.position = position;
    this.isActive = isActive;
    this.type = type;
    this.id = id;
  }

  // Abstrakte Methoden
  abstract getSettingsSchema(): z.ZodSchema;
  abstract validateSettings(): boolean;

  // Gemeinsame Implementierung für alle Widgets
  getDefaultSettings(): Record<string, any> {
    try {
      const schema = this.getSettingsSchema();
      const defaultSettings: Record<string, any> = {};

      // Hole das Schema Shape
      const shape = (schema as any)._def.shape();

      // Iteriere über die Schema-Properties
      for (const [key, value] of Object.entries(shape)) {
        const typedValue = value as any;
        switch (typedValue._def.typeName) {
          case 'ZodArray':
            defaultSettings[key] = [];
            break;
          case 'ZodString':
            defaultSettings[key] = '';
            break;
          case 'ZodNumber':
            defaultSettings[key] = (value as any)._def.minimum || 1;
            break;
          case 'ZodEnum':
            defaultSettings[key] = (value as any)._def.values[0];
            break;
          case 'ZodBoolean':
            defaultSettings[key] = false;
            break;
          case 'ZodOptional':
            const innerType = (value as any)._def.innerType;
            if (innerType._def.typeName === 'ZodString') {
              defaultSettings[key] = '';
            } else if (innerType._def.typeName === 'ZodNumber') {
              defaultSettings[key] = 0;
            } else {
              defaultSettings[key] = undefined;
            }
            break;
          default:
            console.log(`Unhandled type: ${(value as any)._def.typeName}`);
            defaultSettings[key] = undefined;
        }
      }

      return defaultSettings;
    } catch (error) {
      console.error('Error generating default settings:', error);
      console.error(
        'Error details:',
        error instanceof Error ? error.message : error,
      );
      return {};
    }
  }
}
