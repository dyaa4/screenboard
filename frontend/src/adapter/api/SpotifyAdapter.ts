import { SpotifyRepository } from '@application/repositories/spotifyRepository';
import type { FetchAccessTokenInputPort } from '@application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import axios from 'axios';
import { container, singleton } from 'tsyringe';
import { getApiUrl } from './helper';

@singleton()
export default class SpotifyAdapter implements SpotifyRepository {
  private readonly CLIENT_ID: string;
  private readonly REDIRECT_URI: string;

  constructor() {
    this.CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    this.REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI_SPOTIFY;

    if (!this.CLIENT_ID || !this.REDIRECT_URI) {
      throw new Error('Spotify environment variables are not set correctly');
    }
  }

  async getCurrentAccessToken(dashboardId: string): Promise<string> {
    const appToken = await this.getAppToken();
    try {
      const response = await axios.get(
        `${getApiUrl('/api/auth/spotify/accessToken')}`,
        {
          params: { dashboardId },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
      return response.data.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw new Error('Failed to get Spotify access token');
    }
  }

  async getLoginStatus(dashboardId: string): Promise<boolean> {
    const appToken = await this.getAppToken();
    try {
      const response = await axios.get(
        `${getApiUrl('/api/auth/spotify/loginStatus')}`,
        {
          params: { dashboardId },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
      return response.data.isLoggedin;
    } catch (error) {
      console.error('Error getting Spotify login status:', error);
      throw new Error('Failed to get Spotify login  status');
    }
  }

  async logout(dashboardId: string): Promise<boolean> {
    const appToken = await this.getAppToken();
    try {
      const response = await axios.get(
        `${getApiUrl('/api/auth/spotify/logout')}`,
        {
          params: { dashboardId },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
      return response.data.loggedOut;
    } catch (error) {
      console.error('Error logging out of Spotify:', error);
      throw new Error('Failed to log out of Spotify');
    }
  }

  async saveActiveDevice(deviceId: string, dashboardId: string): Promise<void> {
    const appToken = await this.getAppToken();

    try {
      await axios.post(
        `${getApiUrl('/api/spotify/setActiveDevice')}`,
        {
          deviceId,
          dashboardId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          ' Error setting active device: ',
          error.response?.data || error.message,
        );
        throw error; // Re-throw the AxiosError
      }
      // This should never happen, but we'll handle it just in case
      throw new Error(
        'An unexpected error occurred while setting the active device',
      );
    }
  }

  getLoginUrl(dashboardId: string): string {
    try {
      const scopes = 'user-read-private user-read-email streaming';
      var state = {
        dashboardId: dashboardId,
      };
      var encodedState = btoa(JSON.stringify(state));

      return (
        'https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' +
        this.CLIENT_ID +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' +
        encodeURIComponent(this.REDIRECT_URI) +
        '&state=' +
        encodedState
      );
    } catch (error) {
      console.error('Error getting Spotify login URL:', error);
      throw new Error('Failed to get Spotify login URL');
    }
  }

  initiateLogin(dashboardId: string): void {
    // Open Spotify OAuth in popup window (like Microsoft Calendar)
    const popup = window.open(
      this.getLoginUrl(dashboardId),
      'spotifyAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      throw new Error('Failed to open Spotify login popup. Please allow popups for this site.');
    }
  }

  async handleCallback(code: string, dashboardId: string): Promise<void> {
    const token = await this.getAppToken();
    try {
      await axios.get(`${getApiUrl('/api/auth/spotify/callback')}`, {
        params: { code, dashboardId },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error handling Spotify callback:', error);
      throw new Error('Failed to handle Spotify login callback');
    }
  }

  private async getAppToken(): Promise<string | null> {
    const accessTokenUseCase = container.resolve<FetchAccessTokenInputPort>(FETCH_ACCESS_TOKEN_INPUT_PORT);
    return await accessTokenUseCase.getAccessToken();
  }
}
