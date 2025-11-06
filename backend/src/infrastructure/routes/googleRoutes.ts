import { GoogleService } from "../../application/services/GoogleService"
import { GoogleController } from "../../infrastructure/adapter/input/controllers/GoogleController"
import { GoogleAdapter } from "../../infrastructure/adapter/output/GoogleAdapter"
import { getTokenRepository } from "../config/TokenDependencyConfig";
import { EventSubscriptionRepository } from "../../infrastructure/repositories/EventSubscription"
import { Router } from "express"

const router = Router()
const googleAdapter = new GoogleAdapter()
const tokenRepository = getTokenRepository();
const eventSubscriptionRepository = new EventSubscriptionRepository()
const googleService = new GoogleService(googleAdapter, tokenRepository, eventSubscriptionRepository)
const googleController = new GoogleController(googleService)

router.post("/auth/google/login", (req, res) =>
  googleController.handleLogin(req, res)
)
router.get("/auth/google/loginStatus", (req, res) =>
  googleController.getLoginStatus(req, res)
)
router.delete("/auth/google/logout", (req, res) =>
  googleController.logout(req, res)
)

router.get("/google/userinfo", (req, res) =>
  googleController.getUserInfo(req, res)
)

router.get("/google/calendar/list", (req, res) =>
  googleController.getCalendarList(req, res)
)

router.get("/google/calendar/events", (req, res) =>
  googleController.getCalendarEvents(req, res)
)

router.post("/google/calendar/webhook", (req, res) =>
  googleController.handleCalendarWebhook(req, res)
)

export default router
