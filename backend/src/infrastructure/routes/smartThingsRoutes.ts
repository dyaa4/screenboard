
import { EventSubscriptionRepository } from "../../infrastructure/repositories/EventSubscription";
import { SmartThingsService } from "../../application/services/SmartThingsService";
import { SmartThingsController } from "../../infrastructure/adapter/input/controllers/SmartThingsController";
import { SmartThingsAdapter } from "../../infrastructure/adapter/output/SmartThingsAdapter";
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository";
import { EventSubscriptionService } from "../../application/services/EventSubscriptionService";
import { Router } from "express";
const router = Router();


const tokenRepository = new TokenRepository();
const eventSubscriptionRepository = new EventSubscriptionRepository();

const smartThingsAdapter = new SmartThingsAdapter();
const eventSubscriptionService = new EventSubscriptionService(eventSubscriptionRepository);

const smartThingsService = new SmartThingsService(smartThingsAdapter, tokenRepository, eventSubscriptionService);
const smartThingsController = new SmartThingsController(smartThingsService);

// Auth & Token Management
router.all("/auth/smartthings/callback", (req, res) =>
    smartThingsController.handleCallback(req, res));

router.get("/auth/smartthings/login", (_req, res) =>
    smartThingsController.initiateLogin(_req, res));

router.get("/auth/smartthings/:dashboardId/loginStatus", (req, res) =>
    smartThingsController.getLoginStatus(req, res));

router.get("/auth/smartthings/:dashboardId/logout", (req, res) =>
    smartThingsController.logout(req, res));

router.get("/auth/smartthings/:dashboardId/accessToken", (req, res) =>
    smartThingsController.getAccessToken(req, res));

// SmartThings Webhook Endpoints
router.post("/auth/smartthings/webhook", (req, res) =>
    smartThingsController.handleWebhook(req, res));


// Device Management
router.get("/smartthings/:dashboardId/devices", (req, res) =>
    smartThingsController.getDevices(req, res));

router.post("/smartthings/:dashboardId/devices/:deviceId/command", (req, res) =>
    smartThingsController.executeDeviceCommand(req, res));

router.get("/smartthings/:dashboardId/devices/:deviceId/status", (req, res) =>
    smartThingsController.getDeviceStatus(req, res));





export default router;