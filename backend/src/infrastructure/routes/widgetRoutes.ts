import express from 'express';
import { WidgetService } from '../../application/services/WidgetService'; // Importiere den WidgetService
import { WidgetController } from '../adapter/input/controllers/WidgetController'; // Importiere den WidgetController
import { WidgetRepository } from '../repositories/WidgetRepository';
import { GoogleService } from '../../application/services/GoogleService';
import { TokenRepository } from '../../infrastructure/repositories/TokenRepository';
import { GoogleAdapter } from '../../infrastructure/adapter/output/GoogleAdapter';
import { SmartThingsAdapter } from '../../infrastructure/adapter/output/SmartThingsAdapter';
import { SmartThingsService } from '../../application/services/SmartThingsService';
import { EventSubscriptionService } from '../../application/services/EventSubscriptionService';
import { EventSubscriptionRepository } from '../../infrastructure/repositories/EventSubscription';

const router = express.Router();

// Erstelle Instanzen des Repositories, Services und Controllers
const widgetRepository = new WidgetRepository();
const eventSubscriptionRepository = new EventSubscriptionRepository();
const googleAdapter = new GoogleAdapter();
const smartthingsAdapter = new SmartThingsAdapter();
const tokenRepository = new TokenRepository();

const eventSubscriptionService = new EventSubscriptionService(eventSubscriptionRepository);
const googleService = new GoogleService(googleAdapter, tokenRepository, eventSubscriptionRepository);
const smartThingsService = new SmartThingsService(smartthingsAdapter, tokenRepository, eventSubscriptionService, eventSubscriptionRepository);
const widgetService = new WidgetService(widgetRepository, googleService, smartThingsService, eventSubscriptionService);
const widgetController = new WidgetController(widgetService);

// Definiere die Routen
router.get('/dashboard/:dashboardId/widgets/:id', (req, res) => widgetController.getWidgetById(req, res));
router.get('/dashboard/:dashboardId/widgets', (req, res) => widgetController.getWidgetsByDashboardId(req, res));
router.put('/dashboard/:dashboardId/widgets/:id', (req, res) => widgetController.updateWidget(req, res),);

export default router;
