import { SmartThingsRepository } from '../../application/repositories/smartThingsRepository';
import type { FetchAccessTokenInputPort } from '../../application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import axios from 'axios';
import { inject, singleton } from 'tsyringe';
import { getApiUrl } from './helper';
import { IoTDevice } from '../../domain/types';

@singleton()
export default class SmartThingsAdapter implements SmartThingsRepository {
  private accessTokenUseCase: FetchAccessTokenInputPort;

  constructor(
    @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
    fetchAccessTokenUseCase: FetchAccessTokenInputPort,
  ) {
    this.accessTokenUseCase = fetchAccessTokenUseCase;
  }

  async getCurrentAccessToken(dashboardId: string): Promise<string> {
    const appToken = await this.getAppToken();
    try {
      const response = await axios.get(
        `${getApiUrl('/api/auth/smartthings/accessToken')}`,
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
      console.error('Error getting SmartThings access token:', error);
      throw new Error('Failed to get SmartThings access token');
    }
  }

  async getLoginStatus(dashboardId: string): Promise<boolean> {
    const appToken = await this.getAppToken();
    try {
      const response = await axios.get(
        `${getApiUrl(`/api/auth/smartthings/${dashboardId}/loginStatus`)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
      return response.data.isLoggedin;
    } catch (error) {
      console.error('Error getting SmartThings login status:', error);
      throw new Error('Failed to get SmartThings login status');
    }
  }

  async logout(dashboardId: string): Promise<boolean> {
    const appToken = await this.getAppToken();
    try {
      const response = await axios.get(
        `${getApiUrl(`/api/auth/smartthings/${dashboardId}/logout`)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
      return response.data.loggedOut;
    } catch (error) {
      console.error('Error logging out of SmartThings:', error);
      throw new Error('Failed to log out of SmartThings');
    }
  }

  async getLoginUrl(dashboardId: string): Promise<string> {
    const appToken = await this.getAppToken();
    try {
      const redirectUrl = await axios.get(
        `${getApiUrl(`/api/auth/smartthings/login`)}`,
        {
          headers: {
            Authorization: `Bearer ${appToken}`,
          },
          params: {
            dashboardId: dashboardId,
          },
        },
      );

      return redirectUrl.data.authUrl;
    } catch (error) {
      console.error('Error getting SmartThings login URL:', error);
      throw new Error('Failed to get SmartThings login URL');
    }
  }

  async getDevices(dashboardId: string): Promise<IoTDevice[]> {
    const appToken = await this.getAppToken();
    const devices: IoTDevice[] = [];
    try {
      const response = await axios.get(
        `${getApiUrl(`/api/smartthings/${dashboardId}/devices`)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );

      for (const device of response.data) {
        const { deviceId, deviceTypeName, label, name } = device;
        const iOTdevice: IoTDevice = {
          deviceId: deviceId,
          name: name,
          label: label,
          type: deviceTypeName,
          provider: 'smartthings',
          capabilities: [],
          selected: false,
        };

        devices.push(iOTdevice);
      }
      return devices;
    } catch (error) {
      console.error('Error getting SmartThings devices:', error);
      throw new Error('Failed to get SmartThings devices');
    }
  }

  async executeDeviceCommand(
    dashboardId: string,
    deviceId: string,
    command: any,
  ): Promise<void> {
    const appToken = await this.getAppToken();
    try {
      await axios.post(
        `${getApiUrl(`/api/smartthings/${dashboardId}/devices/${deviceId}/command`)}`,
        { ...command },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
    } catch (error) {
      console.error('Error executing SmartThings device command:', error);
      throw new Error('Failed to execute SmartThings device command');
    }
  }

  async getDeviceStatus(dashboardId: string, deviceId: string): Promise<any> {
    const appToken = await this.getAppToken();
    try {
      const response = await axios.get(
        `${getApiUrl(`/api/smartthings/${dashboardId}/devices/${deviceId}/status`)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error getting SmartThings device status:', error);
      throw new Error('Failed to get SmartThings device status');
    }
  }

  async completeAuth(code: string, state: string): Promise<void> {
    console.log('SmartThingsAdapter.completeAuth called with code and state');
    try {
      await axios.post(`${getApiUrl(`/api/auth/smartthings/complete`)}`, { code, state }, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error completing SmartThings auth:', error);
      throw new Error('Failed to complete SmartThings auth');
    }
  }

  async subscribeToDeviceEvents(
    dashboardId: string,
    deviceId: string,
    event: any,
  ): Promise<void> {
    const appToken = await this.getAppToken();
    try {
      await axios.post(
        `${getApiUrl(`/api/smartthings/${dashboardId}/devices/${deviceId}/subscribe`)}`,
        { event },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appToken}`,
          },
        },
      );
    } catch (error) {
      console.error('Error subscribing to SmartThings device events:', error);
      throw new Error('Failed to subscribe to SmartThings device events');
    }
  }

  private async getAppToken(): Promise<string | null> {
    return await this.accessTokenUseCase.getAccessToken();
  }
}
