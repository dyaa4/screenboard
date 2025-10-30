
import { ILayoutRepository } from '../../domain/repositories/ILayoutConfigRepository';
import { ILayoutDocument } from '../../domain/types';
import LayoutModel from '../../infrastructure/database/LayoutModel';


export class LayoutRepository implements ILayoutRepository {
  create(layout: ILayoutDocument): Promise<ILayoutDocument> {
    return LayoutModel.create(layout);
  }
  findLayoutByDashboardId(
    dashboardId: string,
  ): Promise<ILayoutDocument | null> {
    return LayoutModel.findOne({ dashboardId }).exec();
  }
  update(
    layout: ILayoutDocument,
  ): Promise<ILayoutDocument | null> {
    return LayoutModel.findOneAndUpdate(
      { _id: layout._id, dashboardId: layout.dashboardId },
      layout,
      { new: true },
    ).exec();
  }
}
