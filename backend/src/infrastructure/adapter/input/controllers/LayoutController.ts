import { Request, Response } from 'express';
import { LayoutService } from '../../../../application/services/LayoutService';

export class LayoutController {
  constructor(private layoutService: LayoutService) { }

  async getLayout(req: Request, res: Response) {
    const { dashboardId } = req.params;

    if (!dashboardId) {
      res.status(400).json({ message: 'Dashboard ID is required' });
      return;
    }

    try {
      const layoutConfig =
        await this.layoutService.findLayoutByDashboardId(dashboardId);
      res.json(layoutConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch layout config' });
    }
  }

  async updateLayout(req: Request, res: Response) {
    const userId = req.auth?.payload?.sub;

    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    try {
      const layoutConfig = await this.layoutService.updateLayout(
        req.body,
      );
      res.json(layoutConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update layout config' });
    }
  }
}
