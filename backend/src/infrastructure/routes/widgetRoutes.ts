import express from 'express';
import { WidgetService } from '../../application/services/WidgetService'; // Importiere den WidgetService
import { WidgetController } from '../adapter/input/controllers/WidgetController'; // Importiere den WidgetController
import { WidgetRepository } from '../repositories/WidgetRepository';
import { GoogleService } from '../../application/services/GoogleService';
import { TokenRepository } from "../repositories/TokenRepository";
import { AESEncryptionAdapter } from "../adapter/output/AESEncryptionAdapter";
import { GoogleAdapter } from '../../infrastructure/adapter/output/GoogleAdapter';
import { SmartThingsAdapter } from '../../infrastructure/adapter/output/SmartThingsAdapter';
import { MicrosoftAdapter } from '../../infrastructure/adapter/output/MicrosoftAdapter';
import { SmartThingsService } from '../../application/services/SmartThingsService';
import { MicrosoftService } from '../../application/services/MicrosoftService';
import { EventSubscriptionService } from '../../application/services/EventSubscriptionService';
import { EventSubscriptionRepository } from '../../infrastructure/repositories/EventSubscription';

const router = express.Router();

// Erstelle Instanzen des Repositories, Services und Controllers
const widgetRepository = new WidgetRepository();
const eventSubscriptionRepository = new EventSubscriptionRepository();
const googleAdapter = new GoogleAdapter();
const smartthingsAdapter = new SmartThingsAdapter();
const microsoftAdapter = new MicrosoftAdapter();
const tokenRepository = new TokenRepository(new AESEncryptionAdapter());

const eventSubscriptionService = new EventSubscriptionService(eventSubscriptionRepository);
const googleService = new GoogleService(googleAdapter, tokenRepository, eventSubscriptionRepository);
const smartThingsService = new SmartThingsService(smartthingsAdapter, tokenRepository, eventSubscriptionService, eventSubscriptionRepository);
const microsoftService = new MicrosoftService(microsoftAdapter, tokenRepository);
const widgetService = new WidgetService(widgetRepository, googleService, smartThingsService, eventSubscriptionService, microsoftService);
const widgetController = new WidgetController(widgetService);

// Definiere die Routen
router.get('/dashboard/:dashboardId/widgets/:id', (req, res) => widgetController.getWidgetById(req, res));
router.get('/dashboard/:dashboardId/widgets', (req, res) => widgetController.getWidgetsByDashboardId(req, res));
router.put('/dashboard/:dashboardId/widgets/:id', (req, res) => widgetController.updateWidget(req, res),); export default router;
