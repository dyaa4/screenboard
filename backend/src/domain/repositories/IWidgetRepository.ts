import { IWidgetDocument } from "../../domain/types";

export interface IWidgetRepository {
  create(widget: IWidgetDocument): Promise<IWidgetDocument>;
  findWidgetByIdAndDashboardId(
    id: string,
    dashboardId: string,
  ): Promise<IWidgetDocument | null>; // Now accepts userId
  findWidgetListByDashboardId(dashboardId: string): Promise<IWidgetDocument[]>; // Now accepts userId
  update(widget: IWidgetDocument): Promise<IWidgetDocument | null>;
}
