import { Router } from "express";
import { MicrosoftService } from "../../application/services/MicrosoftService";
import { MicrosoftController } from "../../infrastructure/adapter/input/controllers/MicrosoftController";
import { MicrosoftAdapter } from "../../infrastructure/adapter/output/MicrosoftAdapter";
import { TokenRepository } from "../../infrastructure/repositories/TokenRepository";

const router = Router();

// Initialize dependencies following Hexagonal Architecture
const tokenRepository = new TokenRepository();
const microsoftAdapter = new MicrosoftAdapter();

// Application Service
const microsoftService = new MicrosoftService(
  microsoftAdapter,
  tokenRepository
);

// Input Adapter (Controller)
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

export default router;