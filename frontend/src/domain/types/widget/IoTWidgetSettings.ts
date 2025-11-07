// IoTWidgetSettings.ts

export type IoTProvider = 'smartthings' | 'tuya' | 'none';

export interface IoTDevice {
  deviceId: string;
  name: string;
  label?: string;
  roomName?: string;
  type: string;
  capabilities: string[];
  provider: IoTProvider;
  status?: Record<string, Record<string, any>>;
  selected: boolean;
  // Color control capabilities
  supportsColor?: boolean;
  supportsColorTemperature?: boolean;
  supportsBrightness?: boolean;
}

export interface IoTWidgetSettings {
  devices: IoTDevice[];
}

// DeviceCommand.ts (for use with the repository)
export interface DeviceCommand {
  component: string; // Usually "main" for most devices
  capability: string; // The capability ID (e.g., "switch", "switchLevel")
  command: string; // The command name (e.g., "on", "off", "setLevel")
  arguments: any[]; // Arguments for the command
  provider: IoTProvider; // Which provider this command is for
}
