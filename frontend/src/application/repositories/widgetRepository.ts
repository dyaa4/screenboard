import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Widget } from '@domain/entities/Widget';

export interface WidgetRepository {
  get(id: string, dashboardId: string): Promise<Widget | null>;
  getAll(dashboardId: string): Promise<Widget[]>;
  update(
    widget: Widget,
    dashboardId: string,
    patchableProps: IPatchableProps,
  ): Promise<Widget>;
}
