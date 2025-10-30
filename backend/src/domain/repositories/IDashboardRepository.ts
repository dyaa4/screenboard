import { IDashboardDocument } from "../../domain/types/IDashboardDocument";

export interface IDashboardRepository {
    create(dashboard: IDashboardDocument): Promise<IDashboardDocument>;
    getDashboardByIdAndUserId(
        dashboardId: string,
        userId: string
    ): Promise<IDashboardDocument | null>;
    getDashboardListByUserId(userId: string): Promise<IDashboardDocument[]>;
    update(dashboard: IDashboardDocument): Promise<IDashboardDocument | null>;
    delete(dashboardId: string, userId: string): Promise<void>;
}
