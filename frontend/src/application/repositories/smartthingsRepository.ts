import { DeviceCommand, IoTDevice } from '../../domain/types';

export interface SmartThingsColorControl {
  hue: number;
  saturation: number;
}

export interface SmartThingsRepository {
  getLoginUrl(dashboardId: string): Promise<string>;
  getLoginStatus(dashboardId: string): Promise<boolean>;
  logout(dashboardId: string): Promise<boolean>;
  getDevices(dashboardId: string): Promise<IoTDevice[]>;
  executeDeviceCommand(
    dashboardId: string,
    deviceId: string,
    command: DeviceCommand,
  ): Promise<void>;
  getDeviceStatus(dashboardId: string, deviceId: string): Promise<any>;
  /**
   * Completes the OAuth flow by sending the authorization code and state
   * (base64 encoded) to the backend for token exchange and storage.
   */
  completeAuth(code: string, state: string): Promise<void>;

  // Color control methods
  setDeviceColor(deviceId: string, hue: number, saturation: number): Promise<void>;
  setDeviceColorTemperature(deviceId: string, colorTemperature: number): Promise<void>;
  setDeviceBrightness(deviceId: string, level: number): Promise<void>;
}
