import axios from 'axios';
import { MicrosoftRepository } from '../../../domain/repositories/MicrosoftRepository';
import { MicrosoftEventDTO, MicrosoftTokenDTO } from '../../dtos/MicrosoftEventDTO';
import { MicrosoftCalendarListDto } from '../../dtos/MicrosoftCalendarListDTO';
import { MicrosoftUserInfoDTO } from '../../dtos/MicrosoftUserInfoDTO';
import { MicrosoftSubscriptionDTO } from '../../dtos/MicrosoftSubscriptionDTO';
import logger from '../../../utils/logger';

/**
 * MicrosoftAdapter - Infrastructure Layer
 * Implements Microsoft Graph API communication
 * Part of Hexagonal Architecture - Infrastructure/Adapter Layer
 */
export class MicrosoftAdapter implements MicrosoftRepository {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string;

  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID || '';
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
    this.redirectUri = process.env.MICROSOFT_REDIRECT_URI || '';
    this.scopes = 'https://graph.microsoft.com/Calendars.Read https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read offline_access';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Microsoft OAuth configuration missing. Please set MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_REDIRECT_URI environment variables.');
    }

    // Debug log (remove in production)
    console.log('Microsoft OAuth Config:', {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      scopes: this.scopes
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeAuthCodeForTokens(code: string): Promise<MicrosoftTokenDTO> {
    try {
      console.log('Attempting token exchange with:', {
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        codeLength: code?.length,
        scopes: this.scopes
      });

      // Microsoft OAuth requires form-encoded data
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('code', code);
      params.append('redirect_uri', this.redirectUri);
      params.append('grant_type', 'authorization_code');
      // NOTE: Don't include scope in token exchange - they were already set during authorization

      console.log('Token request params:', params.toString());

      const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      ); return {
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
        expiresIn: tokenResponse.data.expires_in,
        tokenType: tokenResponse.data.token_type,
        scope: tokenResponse.data.scope,
      };
    } catch (error: any) {
      console.error('Error exchanging Microsoft auth code for tokens:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<MicrosoftTokenDTO> {
    try {
      // Microsoft OAuth requires form-encoded data
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', refreshToken);
      params.append('grant_type', 'refresh_token');
      params.append('scope', this.scopes);

      const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token || refreshToken, // Microsoft may not return new refresh token
        expiresIn: tokenResponse.data.expires_in,
        tokenType: tokenResponse.data.token_type,
        scope: tokenResponse.data.scope,
      };
    } catch (error: any) {
      console.error('Error refreshing Microsoft access token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(_accessToken: string): Promise<void> {
    try {
      // Microsoft Graph doesn't have a specific revoke endpoint
      // The token will expire naturally or can be revoked via Azure portal
      console.log('Microsoft token revocation requested - token will expire naturally');
    } catch (error: any) {
      console.error('Error revoking Microsoft token:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Fetch calendar events
   */
  async fetchCalendarEvents(accessToken: string, calendarId: string): Promise<MicrosoftEventDTO[]> {
    try {
      const now = new Date();
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            $filter: `start/dateTime ge '${now.toISOString()}' and start/dateTime le '${oneMonthLater.toISOString()}'`,
            $orderby: 'start/dateTime',
            $top: 50, // Limit to 50 events
          },
        }
      );

      return response.data.value || [];
    } catch (error: any) {
      console.error('Error fetching Microsoft calendar events:', error.response?.data || error.message);
      throw new Error('Failed to fetch Microsoft calendar events');
    }
  }

  /**
   * Fetch user calendars
   */
  async fetchUserCalendars(accessToken: string): Promise<MicrosoftCalendarListDto> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me/calendars', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        value: response.data.value || [],
      };
    } catch (error: any) {
      console.error('Error fetching Microsoft calendars:', error.response?.data || error.message);
      throw new Error('Failed to fetch Microsoft calendars');
    }
  }

  /**
   * Fetch user information
   */
  async fetchUserInfo(accessToken: string): Promise<MicrosoftUserInfoDTO> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching Microsoft user info:', error.response?.data || error.message);
      throw new Error('Failed to fetch Microsoft user information');
    }
  }

  /**
   * Subscribe to calendar events using Microsoft Graph subscriptions
   */
  async subscribeToCalendarEvents(
    accessToken: string,
    calendarId: string,
    userId: string,
    dashboardId: string
  ): Promise<MicrosoftSubscriptionDTO> {
    const timer = logger.startTimer('Microsoft Graph Subscription Creation');

    try {
      // Remove auth0| prefix from userId for cleaner identification
      const userIdWithoutAuth0 = userId.replace("auth0|", "");
      const userIdWithDashboardId = `${userIdWithoutAuth0}-${dashboardId}`;

      // Calculate expiration time (maximum 4230 minutes = ~3 days for Microsoft Graph)
      const expirationDateTime = new Date();
      expirationDateTime.setTime(expirationDateTime.getTime() + (4230 * 60 * 1000));

      const subscription = {
        changeType: "created,updated,deleted",
        notificationUrl: process.env.MICROSOFT_CALENDAR_WEBHOOK_URL,
        resource: `me/calendars/${calendarId}/events`,
        expirationDateTime: expirationDateTime.toISOString(),
        clientState: userIdWithDashboardId, // Used to validate notifications
      };

      logger.info('Creating Microsoft Graph subscription', {
        resource: subscription.resource,
        notificationUrl: subscription.notificationUrl,
        expirationDateTime: subscription.expirationDateTime,
        clientState: subscription.clientState,
        userId,
        calendarId,
        dashboardId
      }, 'MicrosoftAdapter');

      logger.apiCall('Microsoft Graph', '/subscriptions', 'POST');

      const response = await axios.post(
        'https://graph.microsoft.com/v1.0/subscriptions',
        subscription,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      timer();
      logger.apiCall('Microsoft Graph', '/subscriptions', 'POST', response.status);
      logger.success('Microsoft Graph subscription created', {
        subscriptionId: response.data.id,
        resource: response.data.resource,
        expirationDateTime: response.data.expirationDateTime
      }, 'MicrosoftAdapter');

      return response.data;
    } catch (error: any) {
      logger.error('Microsoft Graph subscription creation failed', error, 'MicrosoftAdapter');
      logger.apiCall('Microsoft Graph', '/subscriptions', 'POST', error.response?.status);
      throw new Error('Failed to create Microsoft Graph subscription');
    }
  }

  /**
   * Renew an existing Microsoft Graph subscription
   */
  async renewSubscription(
    accessToken: string,
    subscriptionId: string
  ): Promise<MicrosoftSubscriptionDTO> {
    try {
      // Calculate new expiration time (maximum 4230 minutes)
      const expirationDateTime = new Date();
      expirationDateTime.setTime(expirationDateTime.getTime() + (4230 * 60 * 1000));

      const updateData = {
        expirationDateTime: expirationDateTime.toISOString(),
      };

      const response = await axios.patch(
        `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Microsoft Graph subscription renewed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error renewing Microsoft Graph subscription:', error.response?.data || error.message);
      throw new Error('Failed to renew Microsoft Graph subscription');
    }
  }

  /**
   * Delete Microsoft Graph subscription
   */
  async deleteSubscription(
    accessToken: string,
    subscriptionId: string
  ): Promise<void> {
    try {
      await axios.delete(
        `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Microsoft Graph subscription deleted:', subscriptionId);
    } catch (error: any) {
      console.error('Error deleting Microsoft Graph subscription:', error.response?.data || error.message);
      throw new Error('Failed to delete Microsoft Graph subscription');
    }
  }
}