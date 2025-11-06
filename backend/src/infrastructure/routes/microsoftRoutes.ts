import { Router } from "express";
import { MicrosoftService } from "../../application/services/MicrosoftService";
import { MicrosoftController } from "../../infrastructure/adapter/input/controllers/MicrosoftController";
import { MicrosoftAdapter } from "../../infrastructure/adapter/output/MicrosoftAdapter";
import { getTokenRepository } from "../config/TokenDependencyConfig";

const router = Router();

// Initialize dependencies following Hexagonal Architecture with Encryption
const tokenRepository = getTokenRepository();
const microsoftAdapter = new MicrosoftAdapter();
const microsoftService = new MicrosoftService(microsoftAdapter, tokenRepository);
const microsoftController = new MicrosoftController(microsoftService);

// Authentication Routes
router.post("/auth/microsoft/login", (req, res) =>
  microsoftController.handleLogin(req, res)
);

router.get("/auth/microsoft/loginStatus", (req, res) =>
  microsoftController.getLoginStatus(req, res)
);

router.delete("/auth/microsoft/logout", (req, res) =>
  microsoftController.logout(req, res)
);

// Microsoft Calendar API Routes
router.get("/events/microsoft/calendar", (req, res) =>
  microsoftController.fetchCalendarEvents(req, res)
);

router.get("/events/microsoft/calendars", (req, res) =>
  microsoftController.fetchUserCalendars(req, res)
);

router.get("/events/microsoft/user", (req, res) =>
  microsoftController.fetchUserInfo(req, res)
);

// Microsoft Graph Webhook & Subscription Routes
router.post("/microsoft/calendar/webhook", (req, res) =>
  microsoftController.handleCalendarWebhook(req, res)
);

router.post("/microsoft/calendar/subscribe", (req, res) =>
  microsoftController.subscribeToCalendarEvents(req, res)
);

export default router;