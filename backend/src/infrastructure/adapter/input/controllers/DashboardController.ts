import { Request, Response } from 'express';
import { DashboardService } from '../../../../application/services/DashboardService';

export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    async getDashboard(req: Request, res: Response) {
        const { dashboardId } = req.params;
        const userId = req.auth?.payload?.sub;

        if (!dashboardId || !userId) {
            res.status(400).json({ message: 'Dashboard ID and User ID are required' });
            return;
        }

        try {
            const dashboard = await this.dashboardService.getDashboardByIdAndUserId(
                dashboardId,
                userId,
            );
            if (!dashboard) {
                res.status(404).json({ message: 'Dashboard not found' });
                return;
            }
            res.json(dashboard);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch dashboard' });
        }
    }

    async getDashboardList(req: Request, res: Response) {
        const userId = req.auth?.payload?.sub;

        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

        try {
            const dashboardList = await this.dashboardService.getDashboardListByUserId(userId);
            res.json(dashboardList);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch dashboard list' });
        }
    }

    async createDashboard(req: Request, res: Response) {
        const userId = req.auth?.payload?.sub;

        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

        try {
            const dashboardData = { ...req.body, userId };
            const newDashboard = await this.dashboardService.createDashboard(dashboardData);
            res.status(201).json(newDashboard);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create dashboard' });
        }
    }

    async updateDashboard(req: Request, res: Response) {
        const userId = req.auth?.payload?.sub;

        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

        try {
            const dashboardData = { ...req.body, userId };
            console.log(dashboardData);
            const updatedDashboard = await this.dashboardService.updateDashboard(dashboardData);
            if (!updatedDashboard) {
                res.status(404).json({ message: 'Dashboard not found' });
                return;
            }
            res.json(updatedDashboard);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update dashboard' });
        }
    }

    async deleteDashboard(req: Request, res: Response) {
        const { dashboardId } = req.params;
        const userId = req.auth?.payload?.sub;

        if (!dashboardId || !userId) {
            res.status(400).json({ message: 'Dashboard ID and User ID are required' });
            return;
        }

        try {
            await this.dashboardService.deleteDashboard(dashboardId, userId);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete dashboard' });
        }
    }
}
