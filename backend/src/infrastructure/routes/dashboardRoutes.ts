import { Router } from 'express';
import { DashboardController } from '../adapter/input/controllers/DashboardController';
import { DashboardService } from '../../application/services/DashboardService';
import { DashboardRepository } from '../../infrastructure/repositories/DashboardRepository';
import { WidgetRepository } from '../../infrastructure/repositories/WidgetRepository';
import { LayoutRepository } from '../../infrastructure/repositories/LayoutRepository';

const router = Router();

// Instanziiere die Abhängigkeiten
const dashboardRepository = new DashboardRepository();
const widgetRepository = new WidgetRepository();
const layoutRepository = new LayoutRepository();
const dashboardService = new DashboardService(dashboardRepository, widgetRepository, layoutRepository);
const dashboardController = new DashboardController(dashboardService);

// Route für ein spezifisches Dashboard abrufen
router.get('/dashboard/:dashboardId', (req, res) =>
    dashboardController.getDashboard(req, res),
);

// Route für alle Dashboards eines Benutzers abrufen
router.get('/dashboardList', (req, res) =>
    dashboardController.getDashboardList(req, res),
);

// Route für ein neues Dashboard erstellen
router.post('/dashboard', (req, res) =>
    dashboardController.createDashboard(req, res),
);

// Route für ein bestehendes Dashboard aktualisieren
router.put('/dashboard/:dashboardId', (req, res) => {
    console.log('updateDashboard');
    dashboardController.updateDashboard(req, res)
}
);

// Route für ein bestehendes Dashboard löschen
router.delete('/dashboard/:dashboardId', (req, res) =>
    dashboardController.deleteDashboard(req, res),
);

export default router;
