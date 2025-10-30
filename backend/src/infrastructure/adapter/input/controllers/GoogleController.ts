import { GoogleService } from "../../../../application/services/GoogleService"
import { Request, Response } from "express"

export class GoogleController {
  constructor(private googleService: GoogleService) { }

  async handleLogin(req: Request, res: Response): Promise<void> {
    const { googleAuthCode } = req.body
    const userId = req.auth?.payload?.sub
    const { dashboardId } = req.query

    if (!googleAuthCode) {
      res.status(400).json({ error: "googleAuthCode fehlt" })
      return
    }

    if (!userId) {
      res.status(400).json({ error: "userId fehlt" })
      return
    }

    if (!dashboardId) {
      res.status(400).json({ error: "dashboardId fehlt" })
      return
    }

    try {
      await this.googleService.handleGoogleAuthCode(
        userId,
        dashboardId as string,
        googleAuthCode
      )
      res.status(204).json()
    } catch (error) {
      console.error("Fehler bei der Authentifizierung:", error)
      res.status(500).json({ error: "Fehler bei der Authentifizierung" })
    }
  }

  async getUserInfo(req: Request, res: Response): Promise<void> {
    const { dashboardId } = req.query
    const userId = req.auth?.payload?.sub

    if (!dashboardId) {
      res.status(400).json({ error: "dashboardId fehlt" })
      return
    }

    if (!userId) {
      res.status(400).json({ error: "userId fehlt" })
      return
    }

    try {
      const userInfo = await this.googleService.getUserInfo(
        userId,
        dashboardId as string
      )
      res.json(userInfo)
    } catch (error) {
      console.error("Fehler beim Abrufen der Benutzerinformationen:", error)
      res
        .status(500)
        .json({ error: "Fehler beim Abrufen der Benutzerinformationen" })
    }
  }

  async getCalendarList(req: Request, res: Response): Promise<void> {
    const { dashboardId } = req.query
    const userId = req.auth?.payload?.sub

    if (!dashboardId) {
      res.status(400).json({ error: "dashboardId fehlt" })
      return
    }

    if (!userId) {
      res.status(400).json({ error: "userId fehlt" })
      return
    }

    try {
      const calendars = await this.googleService.getCalendars(
        userId,
        dashboardId as string
      )
      res.json(calendars)
    } catch (error) {
      console.error("Fehler beim Abrufen der Kalender:", error)
      res.status(500).json({ error: "Fehler beim Abrufen der Kalender" })
    }
  }

  async getCalendarEvents(req: Request, res: Response): Promise<void> {
    const { dashboardId, calendarId } = req.query
    const userId = req.auth?.payload?.sub

    if (!dashboardId) {
      res.status(400).json({ error: "dashboardId fehlt" })
      return
    }

    if (!userId) {
      res.status(400).json({ error: "userId fehlt" })
      return
    }

    if (!calendarId) {
      res.status(400).json({ error: "calendarId fehlt" })
      return
    }

    try {
      const events = await this.googleService.getEvents(
        userId,
        dashboardId as string,
        calendarId as string
      )
      res.json(events)
    } catch (error) {
      console.error("Fehler beim Abrufen der Events:", error)
      res.status(500).json({ error: "Fehler beim Abrufen der Events" })
    }
  }

  async getLoginStatus(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.payload?.sub

    const dashboardId = req.query.dashboardId as string

    if (!dashboardId) {
      res.status(400).json({ error: "dashboardId fehlt" })
      return
    }

    if (!userId) {
      res.status(400).json({ error: "userId fehlt" })
      return
    }

    try {
      const isLoggedin = await this.googleService.getLoginStatus(
        userId,
        dashboardId
      )
      res.json({ isLoggedin })
    } catch (error) {
      console.error("Fehler beim Abrufen des Access Tokens:", error)
      res.status(500).json({ error: "Fehler beim Abrufen des Access Tokens" })
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.payload?.sub

    const { dashboardId } = req.query

    if (!dashboardId) {
      res.status(400).json({ error: "dashboardId fehlt" })
      return
    }

    if (!userId) {
      res.status(400).json({ error: "userId fehlt" })
      return
    }

    try {
      await this.googleService.logout(userId, dashboardId as string)
      res.json({ message: "Logout erfolgreich" })
    } catch (error) {
      console.error("Fehler beim Logout:", error)
      res.status(500).json({ error: "Fehler beim Logout" })
    }
  }

  async handleCalendarWebhook(req: Request, res: Response): Promise<void> {
    try {
      const channelToken = req.headers["x-goog-channel-token"]

      if (!channelToken) {
        console.log("Fehler beim Verarbeiten des Webhooks: x-goog-channel-token fehlt")
        res.status(400).json({ error: "x-goog-channel-token fehlt" })
        return
      }

      const id = req.headers["x-goog-channel-id"];
      const resourceId = req.headers["x-goog-resource-id"];

      if (typeof id !== 'string' || typeof resourceId !== 'string') {
        console.log("Fehler beim Verarbeiten des Webhooks: Ungültige Header-Werte")
        res.status(400).json({ error: "Ungültige Header-Werte" })
        return
      }

      const data = { id, resourceId }
      await this.googleService.handleCalendarWebhook(data)

      res.json({ message: "Webhook erfolgreich verarbeitet" })
    } catch (error) {
      console.error("Fehler beim Verarbeiten des Webhooks:", error)
      res.status(500).json({ error: "Fehler beim Verarbeiten des Webhooks" })
    }
  }
}
