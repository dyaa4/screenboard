import { EventsController } from "../../infrastructure/adapter/input/controllers/EventsController"
import { EventsService } from "../../application/services/EventsService"
import { Router } from "express"

const router = Router()
const eventsService = new EventsService()
const eventsController = new EventsController(eventsService)

router.get("/events/ical", (req, res) =>
    eventsController.fetchICalEvents(req, res)
)

export default router
