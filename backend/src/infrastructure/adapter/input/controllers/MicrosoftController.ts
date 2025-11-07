import { Request, Response } from 'express';
import { MicrosoftService } from '../../../../application/services/MicrosoftService';
import logger from '../../../../utils/logger';

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
    const timer = logger.startTimer('Microsoft OAuth Login');

    try {
      const { code } = req.body;
      const userId = req.auth?.payload?.sub;
      const { dashboardId } = req.query;

      logger.auth('Microsoft OAuth login attempt', userId, 'Microsoft');

      if (!code) {
        logger.warn('Microsoft auth code missing', { userId, dashboardId }, 'MicrosoftController');
        res.status(400).json({ error: 'Microsoft auth code is missing' });
        return;
      }

      if (!userId) {
        logger.warn('UserId missing in Microsoft auth', { dashboardId }, 'MicrosoftController');
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        logger.warn('DashboardId missing in Microsoft auth', { userId }, 'MicrosoftController');
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      await this.microsoftService.handleMicrosoftAuthCode(
        userId,
        dashboardId as string,
        code
      );

      logger.auth('Microsoft OAuth login successful', userId, 'Microsoft', true);
      res.status(204).json();
      timer();
    } catch (error: any) {
      logger.error('Microsoft login error', error, 'MicrosoftController');
      logger.auth('Microsoft OAuth login failed', req.auth?.payload?.sub, 'Microsoft', false);
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
      const simpleEvents = events.map(event => {
        // Microsoft Graph API returns times in UTC, convert to local timezone
        const formatDateTime = (dateTimeObj: any) => {
          if (!dateTimeObj?.dateTime) return null;

          // Convert UTC datetime to local timezone
          const utcDate = new Date(dateTimeObj.dateTime);
          return utcDate.toISOString();
        };

        return {
          id: event.id,
          summary: event.subject, // Backend uses subject from Microsoft Graph API
          description: event.bodyPreview || '',
          start: {
            dateTime: event.isAllDay ? null : formatDateTime(event.start),
            date: event.isAllDay ? event.start.dateTime.split('T')[0] : null,
          },
          end: {
            dateTime: event.isAllDay ? null : formatDateTime(event.end),
            date: event.isAllDay ? event.end.dateTime.split('T')[0] : null,
          },
          location: event.location?.displayName || '',
          creator: {
            email: event.organizer?.emailAddress?.address || '',
            displayName: event.organizer?.emailAddress?.name || '',
          },
        };
      });

      res.status(200).json(simpleEvents);
    } catch (error: any) {
      logger.error('Microsoft calendar events failed', error, 'MicrosoftController');

      // Check for authentication/authorization errors
      if (error.message.includes('authenticate') ||
        error.message.includes('Re-authentication required') ||
        error.message.includes('invalid or expired')) {
        res.status(401).json({
          error: 'Microsoft Calendar authentication required',
          details: 'Your Microsoft access token has expired. Please sign in again.',
          needsReauth: true
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

      // Extract the value array from Microsoft Graph response to match frontend expectations
      res.status(200).json(calendars.value || []);
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

  /**
   * Handle Microsoft Graph webhook notifications
   */
  async handleCalendarWebhook(req: Request, res: Response): Promise<void> {
    try {
      logger.webhook('Microsoft', 'request_received', 'received', {
        method: req.method,
        url: req.url,
        contentType: req.headers['content-type'],
        userAgent: req.headers['user-agent'],
        forwarded: req.headers['x-forwarded-for'],
        bodyLength: JSON.stringify(req.body).length
      });

      // Microsoft Graph webhook validation (when setting up subscription)
      const validationToken = req.query.validationToken;
      if (validationToken) {
        logger.webhook('Microsoft', 'validation_request', 'processed', {
          validationToken: validationToken.toString()
        });
        res.status(200).send(validationToken);
        return;
      }

      // Process actual webhook notifications
      const notifications = req.body.value;
      if (!notifications || !Array.isArray(notifications)) {
        logger.error('Invalid Microsoft webhook payload', req.body, 'MicrosoftController');
        logger.webhook('Microsoft', 'invalid_payload', 'failed');
        res.status(400).json({ error: 'Invalid notification payload' });
        return;
      }

      logger.info(`Processing ${notifications.length} Microsoft webhook notifications`, {
        notifications: notifications.map(n => ({
          subscriptionId: n.subscriptionId,
          changeType: n.changeType,
          resource: n.resource,
          clientState: n.clientState
        }))
      }, 'MicrosoftController');

      for (const notification of notifications) {
        const { subscriptionId, changeType, resource, clientState } = notification;

        logger.webhook('Microsoft', `${changeType}_notification`, 'processed', {
          subscriptionId,
          resource,
          clientState
        });

        await this.microsoftService.handleCalendarWebhook({
          subscriptionId,
          changeType,
          resource,
          clientState,
        });
      }

      logger.webhook('Microsoft', 'all_notifications', 'processed', {
        count: notifications.length
      });
      res.status(202).json({ message: 'Notifications processed' });
    } catch (error: any) {
      logger.error('Microsoft Graph webhook processing failed', error, 'MicrosoftController');
      logger.webhook('Microsoft', 'processing_error', 'failed', { error: error.message });
      res.status(500).json({
        error: 'Failed to process webhook notification',
        details: error.message
      });
    }
  }  /**
   * Subscribe to Microsoft Calendar events
   */
  async subscribeToCalendarEvents(req: Request, res: Response): Promise<void> {
    const timer = logger.startTimer('Microsoft Calendar Subscription');

    try {
      const { dashboardId, calendarId } = req.query;
      const userId = req.auth?.payload?.sub;

      logger.info('Microsoft calendar subscription attempt', {
        userId,
        dashboardId,
        calendarId
      }, 'MicrosoftController');

      if (!userId) {
        logger.warn('UserId missing in subscription request', { dashboardId, calendarId }, 'MicrosoftController');
        res.status(400).json({ error: 'userId is missing' });
        return;
      }

      if (!dashboardId) {
        logger.warn('DashboardId missing in subscription request', { userId, calendarId }, 'MicrosoftController');
        res.status(400).json({ error: 'dashboardId is missing' });
        return;
      }

      if (!calendarId) {
        logger.warn('CalendarId missing in subscription request', { userId, dashboardId }, 'MicrosoftController');
        res.status(400).json({ error: 'calendarId is missing' });
        return;
      }

      const subscription = await this.microsoftService.subscribeToCalendarEvents(
        userId,
        dashboardId as string,
        calendarId as string
      );

      logger.success('Microsoft calendar subscription created', {
        subscriptionId: subscription.id,
        userId,
        dashboardId,
        calendarId
      }, 'MicrosoftController');

      res.status(201).json(subscription);
      timer();
    } catch (error: any) {
      logger.error('Microsoft calendar subscription failed', error, 'MicrosoftController');

      if (error.message.includes('authenticate')) {
        res.status(401).json({
          error: 'Microsoft Calendar authentication required',
          details: error.message
        });
      } else {
        res.status(500).json({
          error: 'Failed to create Microsoft Calendar subscription',
          details: error.message
        });
      }
    }
  }
}