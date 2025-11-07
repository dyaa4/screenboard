import { Router } from 'express';
import { DashboardController } from '../adapter/input/controllers/DashboardController';
import { DashboardService } from '../../application/services/DashboardService';
import { DashboardRepository } from '../../infrastructure/repositories/DashboardRepository';
import { WidgetRepository } from '../../infrastructure/repositories/WidgetRepository';
import { LayoutRepository } from '../../infrastructure/repositories/LayoutRepository';
import { GoogleService } from '../../application/services/GoogleService';
import { MicrosoftService } from '../../application/services/MicrosoftService';
import { SmartThingsService } from '../../application/services/SmartThingsService';
import { GoogleAdapter } from '../adapter/output/GoogleAdapter';
import { MicrosoftAdapter } from '../adapter/output/MicrosoftAdapter';
import { SmartThingsAdapter } from '../adapter/output/SmartThingsAdapter';
import { TokenRepository } from '../repositories/TokenRepository';
import { EventSubscriptionRepository } from '../repositories/EventSubscription';
import { EventSubscriptionService } from '../../application/services/EventSubscriptionService';
import { AESEncryptionAdapter } from '../adapter/output/AESEncryptionAdapter';

const router = Router();

// Instanziiere die Abhängigkeiten
const dashboardRepository = new DashboardRepository();
const widgetRepository = new WidgetRepository();
const layoutRepository = new LayoutRepository();

// Service dependencies für Cleanup
const encryptionAdapter = new AESEncryptionAdapter();
const tokenRepository = new TokenRepository(encryptionAdapter);
const eventSubscriptionRepository = new EventSubscriptionRepository();
const eventSubscriptionService = new EventSubscriptionService(eventSubscriptionRepository);

// Service Adapters
const googleAdapter = new GoogleAdapter();
const microsoftAdapter = new MicrosoftAdapter();
const smartThingsAdapter = new SmartThingsAdapter();

// Service Instances
const googleService = new GoogleService(googleAdapter, tokenRepository, eventSubscriptionRepository);
const microsoftService = new MicrosoftService(microsoftAdapter, tokenRepository, eventSubscriptionRepository);
const smartThingsService = new SmartThingsService(smartThingsAdapter, tokenRepository, eventSubscriptionService, eventSubscriptionRepository);

const dashboardService = new DashboardService(
    dashboardRepository,
    widgetRepository,
    layoutRepository,
    googleService,
    microsoftService,
    smartThingsService
);
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
