import { ILayoutDocument } from "../../domain/types";

export interface ILayoutRepository {
  create(layout: ILayoutDocument): Promise<ILayoutDocument>;
  findLayoutByDashboardId(dashboardId: string,): Promise<ILayoutDocument | null>;
  update(layout: ILayoutDocument,): Promise<ILayoutDocument | null>;
}
