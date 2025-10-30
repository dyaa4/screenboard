import { DeviceCommand, IoTDevice } from '../../domain/types';

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
}
