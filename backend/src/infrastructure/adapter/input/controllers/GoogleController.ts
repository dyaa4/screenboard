import { GoogleService } from "../../../../application/services/GoogleService"
import { Request, Response } from "express"
import logger from "../../../../utils/logger"

export class GoogleController {
  constructor(private googleService: GoogleService) { }

  async handleLogin(req: Request, res: Response): Promise<void> {
    const timer = logger.startTimer('Google OAuth Login')

    try {
      const { googleAuthCode } = req.body
      const userId = req.auth?.payload?.sub
      const { dashboardId } = req.query

      logger.auth('Google OAuth login attempt', userId, 'Google')

      if (!googleAuthCode) {
        logger.warn('Google auth code missing', { userId, dashboardId }, 'GoogleController')
        res.status(400).json({ error: "googleAuthCode fehlt" })
        return
      }

      if (!userId) {
        logger.warn('UserId missing in Google auth', { dashboardId }, 'GoogleController')
        res.status(400).json({ error: "userId fehlt" })
        return
      }

      if (!dashboardId) {
        logger.warn('DashboardId missing in Google auth', { userId }, 'GoogleController')
        res.status(400).json({ error: "dashboardId fehlt" })
        return
      }

      await this.googleService.handleGoogleAuthCode(
        userId,
        dashboardId as string,
        googleAuthCode
      )

      logger.auth('Google OAuth login successful', userId, 'Google', true)
      res.status(204).json()
      timer()
    } catch (error) {
      logger.error('Google login error', error as Error, 'GoogleController')
      logger.auth('Google OAuth login failed', req.auth?.payload?.sub, 'Google', false)
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
      logger.webhook('Google', 'request_received', 'received', {
        method: req.method,
        url: req.url,
        headers: {
          'x-goog-channel-token': req.headers["x-goog-channel-token"] ? '***' : undefined,
          'x-goog-channel-id': req.headers["x-goog-channel-id"],
          'x-goog-resource-id': req.headers["x-goog-resource-id"]
        }
      })

      const channelToken = req.headers["x-goog-channel-token"]

      if (!channelToken) {
        logger.warn('Google webhook missing channel token', {}, 'GoogleController')
        logger.webhook('Google', 'missing_token', 'failed')
        res.status(400).json({ error: "x-goog-channel-token fehlt" })
        return
      }

      const id = req.headers["x-goog-channel-id"];
      const resourceId = req.headers["x-goog-resource-id"];

      if (typeof id !== 'string' || typeof resourceId !== 'string') {
        logger.warn('Google webhook invalid header values', { id: typeof id, resourceId: typeof resourceId }, 'GoogleController')
        logger.webhook('Google', 'invalid_headers', 'failed')
        res.status(400).json({ error: "Ungültige Header-Werte" })
        return
      }

      logger.webhook('Google', 'calendar_notification', 'processed', {
        channelId: id,
        resourceId
      })

      const data = { id, resourceId }
      await this.googleService.handleCalendarWebhook(data)

      logger.webhook('Google', 'calendar_webhook', 'processed')
      res.json({ message: "Webhook erfolgreich verarbeitet" })
    } catch (error) {
      logger.error('Google calendar webhook processing failed', error as Error, 'GoogleController')
      logger.webhook('Google', 'processing_error', 'failed', { error: (error as Error).message })
      res.status(500).json({ error: "Fehler beim Verarbeiten des Webhooks" })
    }
  }
}
