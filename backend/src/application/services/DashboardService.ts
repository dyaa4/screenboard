
import { IDashboardDocument } from '../../domain/types/IDashboardDocument';
import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { IWidgetRepository } from '../../domain/repositories/IWidgetRepository';
import { ILayoutRepository } from '../../domain/repositories/ILayoutConfigRepository';
import { initializeLayout } from '../../infrastructure/setup/layoutInitializer';
import { initializeWidgets } from '../../infrastructure/setup/widgetInitializer';
import { ILayoutDocument, IWidgetDocument } from '../../domain/types';

export class DashboardService {
    constructor(private dashboardRepository: IDashboardRepository,
        private widgetRepository: IWidgetRepository,
        private layoutRepository: ILayoutRepository,
    ) { }

    private async createDefaultWidgets(dashboardId: string): Promise<void> {
        const initialWidgets = await initializeWidgets(dashboardId);
        try {

            for (const widget of initialWidgets) {
                await this.widgetRepository.create(widget as IWidgetDocument);
            }
        } catch (e) {
            console.log(e)
        }
    }

    private async createDefaultLayout(dashboardId: string): Promise<void> {
        const initialLayout = await initializeLayout(dashboardId);
        await this.layoutRepository.create(initialLayout as ILayoutDocument);
    }


    async createDashboard(
        dashboard: IDashboardDocument,
    ): Promise<IDashboardDocument> {
        const dashboardCreated = await this.dashboardRepository.create(dashboard);

        await this.createDefaultWidgets(dashboardCreated.id);
        await this.createDefaultLayout(dashboardCreated.id);

        return dashboard;
    }

    async getDashboardByIdAndUserId(
        dashboardId: string,
        userId: string,
    ): Promise<IDashboardDocument | null> {
        return this.dashboardRepository.getDashboardByIdAndUserId(dashboardId, userId);
    }

    async getDashboardListByUserId(userId: string): Promise<IDashboardDocument[]> {
        return this.dashboardRepository.getDashboardListByUserId(userId);
    }

    async updateDashboard(
        dashboard: IDashboardDocument,
    ): Promise<IDashboardDocument | null> {
        return this.dashboardRepository.update(dashboard);
    }

    async deleteDashboard(dashboardId: string, userId: string): Promise<void> {
        return this.dashboardRepository.delete(dashboardId, userId);
    }
}
