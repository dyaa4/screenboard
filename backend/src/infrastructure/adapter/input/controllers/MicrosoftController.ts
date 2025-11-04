import { Request, Response } from 'express';
import { MicrosoftService } from '../../../../application/services/MicrosoftService';

/**
 * MicrosoftController - Infrastructure Layer (Input Adapter)
 * Handles HTTP requests for Microsoft Calendar operations
 * Part of Hexagonal Architecture - Infrastructure/Adapter Layer
 */
export class MicrosoftController {
  constructor(private microsoftService: MicrosoftService) { }

  /**
   * Handle Microsoft OAuth login callback
   */
  async handleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      const userId = req.auth?.payload?.sub;
      const { dashboardId } = req.query;

      if (!code) {
        res.status(400).json({ error: 'Microsoft auth code is missing' });
        return;
      }

      if (!userId) {
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      await this.microsoftService.handleMicrosoftAuthCode(
        userId,
        dashboardId as string,
        code
      );

      res.status(204).json();
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      res.status(500).json({
        error: 'Failed to authenticate with Microsoft Calendar',
        details: error.message
      });
    }
  }

  /**
   * Get Microsoft Calendar login status
   */
  async getLoginStatus(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.query;
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      const isLoggedIn = await this.microsoftService.getLoginStatus(
        userId,
        dashboardId as string
      );

      res.status(200).json({ isLoggedin: isLoggedIn });
    } catch (error: any) {
      console.error('Microsoft login status error:', error);
      res.status(500).json({
        error: 'Failed to check Microsoft Calendar login status',
        details: error.message
      });
    }
  }

  /**
   * Logout from Microsoft Calendar
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.query;
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      await this.microsoftService.logout(userId, dashboardId as string);

      res.status(200).json({
        message: 'Microsoft Calendar logout successful'
      });
    } catch (error: any) {
      console.error('Microsoft logout error:', error);
      res.status(500).json({
        error: 'Failed to logout from Microsoft Calendar',
        details: error.message
      });
    }
  }

  /**
   * Fetch Microsoft Calendar events
   */
  async fetchCalendarEvents(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId, calendarId } = req.query;
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      if (!calendarId) {
        res.status(400).json({ error: 'calendarId is missing' });
        return;
      }

      const events = await this.microsoftService.fetchMicrosoftCalendarEvents(
        userId,
        dashboardId as string,
        calendarId as string
      );

      // Transform Microsoft events to SimpleEventDto format
      const simpleEvents = events.map(event => ({
        id: event.id,
        summary: event.subject,
        description: event.bodyPreview || '',
        start: {
          dateTime: event.isAllDay ? null : event.start.dateTime,
          date: event.isAllDay ? event.start.dateTime.split('T')[0] : null,
        },
        end: {
          dateTime: event.isAllDay ? null : event.end.dateTime,
          date: event.isAllDay ? event.end.dateTime.split('T')[0] : null,
        },
        location: event.location?.displayName || '',
        creator: {
          email: event.organizer?.emailAddress?.address || '',
          displayName: event.organizer?.emailAddress?.name || '',
        },
      }));

      res.status(200).json(simpleEvents);
    } catch (error: any) {
      console.error('Microsoft calendar events error:', error);

      if (error.message.includes('authenticate')) {
        res.status(401).json({
          error: 'Microsoft Calendar authentication required',
          details: error.message
        });
      } else {
        res.status(500).json({
          error: 'Failed to fetch Microsoft Calendar events',
          details: error.message
        });
      }
    }
  }

  /**
   * Fetch Microsoft user calendars
   */
  async fetchUserCalendars(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.query;
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      const calendars = await this.microsoftService.fetchMicrosoftUserCalendars(
        userId,
        dashboardId as string
      );

      res.status(200).json(calendars);
    } catch (error: any) {
      console.error('Microsoft calendars error:', error);

      if (error.message.includes('authenticate')) {
        res.status(401).json({
          error: 'Microsoft Calendar authentication required',
          details: error.message
        });
      } else {
        res.status(500).json({
          error: 'Failed to fetch Microsoft Calendar calendars',
          details: error.message
        });
      }
    }
  }

  /**
   * Fetch Microsoft user information
   */
  async fetchUserInfo(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.query;
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      const userInfo = await this.microsoftService.fetchUserInfo(
        userId,
        dashboardId as string
      );

      res.status(200).json(userInfo);
    } catch (error: any) {
      console.error('Microsoft user info error:', error);

      if (error.message.includes('authenticate')) {
        res.status(401).json({
          error: 'Microsoft Calendar authentication required',
          details: error.message
        });
      } else {
        res.status(500).json({
          error: 'Failed to fetch Microsoft user information',
          details: error.message
        });
      }
    }
  }
}