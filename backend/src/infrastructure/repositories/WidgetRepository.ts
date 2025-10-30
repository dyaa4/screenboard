// backend/infrastructure/repositories/WidgetRepository.ts
import { IWidgetRepository } from '../../domain/repositories/IWidgetRepository';
import { IWidgetDocument } from '../../domain/types';

import { WidgetModel } from '../../infrastructure/database/WidgetModel';


export class WidgetRepository implements IWidgetRepository {
  async create(widget: IWidgetDocument): Promise<IWidgetDocument> {
    // Create a new widget
    return WidgetModel.create(widget);
  }
  findWidgetByIdAndDashboardId(
    id: string,
    dashboardId: string,
  ): Promise<IWidgetDocument | null> {
    return WidgetModel.findOne({ _id: id, dashboardId }).exec();
  }

  findWidgetListByDashboardId(dashboardId: string): Promise<IWidgetDocument[]> {
    // Fetch all widgets for a specific user
    return WidgetModel.find({ dashboardId }).exec();
  }

  async update(widget: IWidgetDocument): Promise<IWidgetDocument | null> {
    // Update a widget. Ensure it includes the userId.
    return WidgetModel.findOneAndUpdate(
      { _id: widget._id, dashboardId: widget.dashboardId },
      widget,
      { new: true },
    ).exec();
  }
}
