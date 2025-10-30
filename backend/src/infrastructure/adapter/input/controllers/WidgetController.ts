
import { IWidgetDocument } from '../../../../domain/types';
import { Request, Response } from 'express';
import { WidgetService } from '../../../../application/services/WidgetService';

export class WidgetController {
  constructor(private widgetService: WidgetService) { }

  async createWidget(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const widgetData = req.body;
      const widget: IWidgetDocument = await this.widgetService.createWidget({
        ...widgetData,
        userId,
      });
      res.json(widget);
    } catch (error) {
      console.error('Fehler beim Erstellen des Widgets:', error);
      res.status(500).json({ message: 'Fehler beim Erstellen des Widgets' });
    }
  }

  // Handler zum Abrufen eines Widgets nach ID
  async getWidgetById(req: Request, res: Response): Promise<void> {
    try {

      const id = req.params.id;
      const dashboardId = req.params.dashboardId;

      if (!id) {
        res.status(400).json({ message: 'Widget ID is required' });
        return;
      }

      if (!dashboardId) {
        res.status(400).json({ message: 'Dashboard ID is required' });
        return;
      }

      const widget: IWidgetDocument | null =
        await this.widgetService.getWidgetById(id, dashboardId);
      if (widget) {
        res.json(widget);
      } else {
        res.status(404).json({ message: 'Widget nicht gefunden' });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Widgets:', error);
      res.status(500).json({ message: 'Fehler beim Abrufen des Widgets' });
    }
  }

  // Handler zum Abrufen aller Widgets
  async getWidgetsByDashboardId(req: Request, res: Response): Promise<void> {
    try {
      const dashboardId = req.params.dashboardId;

      if (!dashboardId) {
        res.status(400).json({ message: 'Dashboard ID is required' });
        return;
      }

      const widgets: IWidgetDocument[] =
        await this.widgetService.getWidgetsByDashboardId(dashboardId);
      res.status(200).json(widgets);
    } catch (error) {
      console.error('Fehler beim Abrufen der Widgets:', error);
      res.status(500).json({ message: 'Fehler beim Abrufen der Widgets' });
    }
  }
  /**
   *  Updates a widget and handles events if necessary.
   * @param req  The request object
   * @param res  The response object
   * @returns  A promise that resolves to void
   */
  async updateWidget(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const dashboardId = req.params.dashboardId;
      const userId = req.auth?.payload?.sub;

      if (!id || !dashboardId || !userId) {
        res.status(400).json({ message: 'Widget ID, Dashboard ID und User ID sind erforderlich' });
        return;
      }

      const props = req.body;

      const updatedWidget = await this.widgetService.updateWidgetAndHandleEvents(
        id,
        dashboardId,
        userId,
        props
      );

      res.status(200).json(updatedWidget);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Widgets:', error);
      res.status(500).json({ message: 'Fehler beim Aktualisieren des Widgets' });
    }
  }

}
