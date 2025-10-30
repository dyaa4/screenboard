
import { ILayoutDocument } from '../../domain/types';
import { ILayoutRepository } from '../../domain/repositories/ILayoutConfigRepository';

export class LayoutService {
  constructor(private layoutRepository: ILayoutRepository) { }
  async createLayout(
    layout: ILayoutDocument,
  ): Promise<ILayoutDocument> {
    return this.layoutRepository.create(layout);
  }

  async findLayoutByDashboardId(
    dashboardId: string,
  ): Promise<ILayoutDocument | null> {
    return this.layoutRepository.findLayoutByDashboardId(dashboardId);
  }

  async updateLayout(
    layout: ILayoutDocument,
  ): Promise<ILayoutDocument | null> {
    return this.layoutRepository.update(layout);
  }
}
