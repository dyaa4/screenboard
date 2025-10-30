// NotesWidget.ts
import { z } from 'zod';
import { Widget } from '../entities/Widget';
import { WidgetTypeEnum } from '../../domain/types/widget/WidgetTyp';
import { NoteWidgetSettings } from '../../domain/types/widget/NoteWidgetSettings';

export class NotesWidget extends Widget {
  settings: NoteWidgetSettings;
  readonly type = WidgetTypeEnum.NOTES;

  constructor(
    userId: string,
    title: string,
    position: number,
    isActive: boolean,
    settings: NoteWidgetSettings,
    id?: string,
  ) {
    super(userId, title, position, isActive, WidgetTypeEnum.NOTES, id);
    this.settings = settings;
  }

  static settingsSchema = z.object({
    content: z.string().min(1),
  });

  validateSettings(): boolean {
    return NotesWidget.settingsSchema.safeParse(this.settings).success;
  }

  getSettingsSchema(): z.ZodSchema {
    return NotesWidget.settingsSchema;
  }
}
