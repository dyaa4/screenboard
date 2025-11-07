
import { IDashboardDocument } from '../../domain/types/IDashboardDocument';
import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { IWidgetRepository } from '../../domain/repositories/IWidgetRepository';
import { ILayoutRepository } from '../../domain/repositories/ILayoutConfigRepository';
import { initializeLayout } from '../../infrastructure/setup/layoutInitializer';
import { initializeWidgets } from '../../infrastructure/setup/widgetInitializer';
import { ILayoutDocument, IWidgetDocument } from '../../domain/types';
import { GoogleService } from './GoogleService';
import { MicrosoftService } from './MicrosoftService';
import { SmartThingsService } from './SmartThingsService';
import logger from '../../utils/logger';

export class DashboardService {
    constructor(
        private dashboardRepository: IDashboardRepository,
        private widgetRepository: IWidgetRepository,
        private layoutRepository: ILayoutRepository,
        private googleService: GoogleService,
        private microsoftService: MicrosoftService,
        private smartThingsService: SmartThingsService,
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
        const timer = logger.startTimer('Dashboard Deletion with Cleanup');
        logger.info('Dashboard deletion started', { dashboardId, userId }, 'DashboardService');

        try {
            // STEP 1: Cleanup all service subscriptions before deleting dashboard
            await this.cleanupAllServiceSubscriptions(userId, dashboardId);

            // STEP 2: Delete dashboard and associated data
            await this.dashboardRepository.delete(dashboardId, userId);

            logger.success('Dashboard deleted successfully with all subscriptions cleaned',
                { dashboardId, userId }, 'DashboardService');
            timer();
        } catch (error) {
            logger.error('Dashboard deletion failed', error as Error, 'DashboardService');
            throw error;
        }
    }

    /**
     * Cleanup all service subscriptions for a dashboard
     * This runs BEFORE dashboard deletion to ensure clean shutdown
     */
    private async cleanupAllServiceSubscriptions(userId: string, dashboardId: string): Promise<void> {
        logger.info('Starting subscription cleanup for all services',
            { userId, dashboardId }, 'DashboardService');

        const cleanupPromises = [];

        // Google Calendar Cleanup
        cleanupPromises.push(
            this.googleService.cleanup(userId, dashboardId).catch(error => {
                logger.warn('Google cleanup failed but continuing with others',
                    { error: error.message, userId, dashboardId }, 'DashboardService');
            })
        );

        // Microsoft Calendar Cleanup  
        cleanupPromises.push(
            this.microsoftService.cleanup(userId, dashboardId).catch(error => {
                logger.warn('Microsoft cleanup failed but continuing with others',
                    { error: error.message, userId, dashboardId }, 'DashboardService');
            })
        );

        // SmartThings Cleanup
        cleanupPromises.push(
            this.smartThingsService.cleanup(userId, dashboardId).catch(error => {
                logger.warn('SmartThings cleanup failed but continuing with others',
                    { error: error.message, userId, dashboardId }, 'DashboardService');
            })
        );

        // Execute all cleanups in parallel
        await Promise.allSettled(cleanupPromises);

        logger.success('All service subscription cleanups completed',
            { userId, dashboardId }, 'DashboardService');
    }
}
