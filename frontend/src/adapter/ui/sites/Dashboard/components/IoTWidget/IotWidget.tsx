import { t } from '@adapter/ui/i18n/i18n';
import NotConfiguredMessage from '@components/NotConfiguredMessage/NotConfiguredMessage';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Widget } from '../../../../../../domain/entities/Widget';
import { IoTDevice } from '../../../../../../domain/types';
import { Card, Chip } from '@heroui/react';
import { useSmartThings } from '@hooks/api/useSmartthings';
import { JSX, useEffect, useState } from 'react';
import MenuSection from '../MenuSection/MenuSection';
import {
  getCustomColorCssClass,
  getDeviceIcon,
} from '@adapter/ui/helpers/generalHelper';
import { getFontSizeClass } from '@sites/Dashboard/helper';
import { useTheme } from 'next-themes';

import { container } from 'tsyringe';
import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import { CommunicationRepository } from '../../../../../../application/repositories/communicationRepository';
import WidgetSkeleton from '../WidgetSkeleton/WidgetSkeleton';
import ColorControls from './ColorControls';

export interface IoTWidgetProps {
  widget: Widget;
  layout: Layout | undefined;
}

function IoTWidget({ widget, layout }: IoTWidgetProps): JSX.Element {
  const {
    devices: apiDevices,
    executeCommand,
    getDeviceStatus,
    initialLoading,
    error,
    deviceLoading,
    commandErrors,
    isLoggedIn,
    // Color control methods
    setDeviceColor,
    setDeviceColorTemperature,
    setDeviceBrightness,
  } = useSmartThings(widget.dashboardId);

  const { theme } = useTheme();

  const [deviceStates, setDeviceStates] = useState<Record<string, any>>({});
  const [availableDevices, setAvailableDevices] = useState<IoTDevice[]>([]);

  // CommunicationService via DI holen
  const communicationService = container.resolve<CommunicationRepository>(
    COMMUNICATION_REPOSITORY_NAME,
  );

  // Verfügbare Geräte filtern
  useEffect(() => {
    if (apiDevices.length > 0 && widget.settings?.devices?.length > 0) {
      const filteredDevices = apiDevices.filter((device) =>
        widget.settings?.devices?.some(
          (d: IoTDevice) => d.deviceId === device.deviceId,
        ),
      );

      setAvailableDevices(filteredDevices);
    }
  }, [apiDevices, widget.settings?.devices]);

  // Initialer Abruf der Gerätestatus
  useEffect(() => {
    if (isLoggedIn && apiDevices.length > 0) {
      const fetchAllDeviceStatuses = async () => {
        const states: Record<string, any> = {};

        for (const device of apiDevices) {
          if (
            widget.settings?.devices?.some(
              (d: IoTDevice) => d.deviceId === device.deviceId,
            )
          ) {
            try {
              const status = await getDeviceStatus(device.deviceId);
              states[device.deviceId] = status;
            } catch (err) {
              console.error(
                `Fehler beim Abrufen des Status für ${device.label || device.name}:`,
                err,
              );
            }
          }
        }

        setDeviceStates(states);
      };

      fetchAllDeviceStatuses();

      // SmartThings Nachrichten live empfangen
      const smartThingsMessageHandler = (event: any) => {
        console.log('SmartThings event empfangen:', event);

        const structuredValue = {
          components: {
            main: {
              switch: {
                switch: {
                  value: event.value,
                },
              },
            },
          },
        };

        // Beispiel: event enthält deviceId und Status-Update
        if (event.deviceId && event.value !== undefined) {
          setDeviceStates((prev) => ({
            ...prev,
            [event.deviceId]: structuredValue,
          }));
        }
      };

      communicationService.receiveSmartThingsMessage(smartThingsMessageHandler);

      communicationService.connect(widget.dashboardId);

      // Cleanup beim Unmount
      return () => {
        communicationService.abmelden('smartthings-device-event');
      };
    }
  }, [
    isLoggedIn,
    apiDevices,
    widget.settings?.devices,
    getDeviceStatus,
    communicationService,
  ]);

  // Gerät ein-/ausschalten
  const toggleDevice = async (
    deviceId: string,
    capability: string,
    commandValue: string,
    args: any[] = [],
  ) => {
    try {
      const smartThingsCommand = {
        commands: [
          {
            component: 'main',
            capability: capability,
            command: commandValue,
            arguments: args || [],
          },
        ],
      };

      await executeCommand(deviceId, { ...smartThingsCommand });

      // Optimistische UI-Aktualisierung
      setDeviceStates((prev) => ({
        ...prev,
        [deviceId]: {
          components: {
            main: {
              [capability]: {
                [capability]: {
                  value: commandValue,
                },
              },
            },
          },
        },
      }));
    } catch (err) {
      console.error('Fehler beim Ausführen des Befehls:', err);
    }
  };

  const isDeviceOn = (deviceId: string) =>
    deviceStates[deviceId]?.components?.main?.switch?.switch?.value === 'on';

  const renderDeviceCard = (device: IoTDevice) => {
    const isOn = isDeviceOn(device.deviceId);
    const hasError = commandErrors[device.deviceId];
    const deviceIcon = getDeviceIcon(device);

    return (
      <Card
        key={device.deviceId}
        className="p-4 transition-shadow duration-300 shadow-lg hover:shadow-xl"
        style={{
          width: device.supportsColor || device.supportsColorTemperature || device.supportsBrightness ? '280px' : '160px',
          minHeight: '120px',
          ...getCustomColorCssClass(layout, theme),
        }}
      >
        <div
          className="flex flex-col h-full justify-between"
          onClick={(e) => {
            if (!deviceStates[device.deviceId]?.components?.main?.switch || hasError || deviceLoading[device.deviceId]) {
              return;
            }
            e.stopPropagation();
            toggleDevice(device.deviceId, 'switch', isOn ? 'off' : 'on', []);
          }}
          style={{ cursor: (!deviceStates[device.deviceId]?.components?.main?.switch || hasError || deviceLoading[device.deviceId]) ? 'default' : 'pointer' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`text-2xl transition-colors duration-300 ${isOn ? 'text-success' : 'text-default-300'
                }`}
            >
              <i className={deviceIcon}></i>
            </div>
            {deviceLoading[device.deviceId] && (
              <div className="animate-spin">
                <i className="fa-solid fa-spinner text-primary"></i>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p
              className={`${getFontSizeClass(layout?.fontSize)} font-semibold truncate`}
              title={device.label || device.name}
            >
              {device.label || device.name}
            </p>
            {hasError ? (
              <Chip size="sm" color="danger" variant="flat" className="text-xs">
                <i className="fa-solid fa-xmark mr-1"></i> {t('sites.dashboard.components.iot.command_error')}
              </Chip>
            ) : (
              <Chip
                size="sm"
                color={isOn ? 'success' : 'default'}
                variant="flat"
                className={`${getFontSizeClass(layout?.fontSize)} font-medium`}
              >
                <i className={`fa-solid ${isOn ? 'fa-toggle-on' : 'fa-toggle-off'} mr-1`}></i>
                {isOn ? t('sites.dashboard.components.iot.on') : t('sites.dashboard.components.iot.off')}
              </Chip>
            )}
          </div>
        </div>

        {/* Color Controls for capable devices */}
        {(() => {
          console.log('🔍 IoT Widget Debug:', {
            deviceName: device.name,
            supportsColor: device.supportsColor,
            supportsColorTemperature: device.supportsColorTemperature,
            supportsBrightness: device.supportsBrightness,
            shouldShowControls: (device.supportsColor || device.supportsColorTemperature || device.supportsBrightness)
          });
          return (device.supportsColor || device.supportsColorTemperature || device.supportsBrightness);
        })() && (
            <ColorControls
              device={device}
              layout={layout}
              onColorChange={setDeviceColor}
              onColorTemperatureChange={setDeviceColorTemperature}
              onBrightnessChange={setDeviceBrightness}
              isLoading={deviceLoading[device.deviceId]}
              hasError={!!commandErrors[device.deviceId]}
            />
          )}
      </Card>
    );
  };

  return (
    <MenuSection
      icon="fa-solid fa-house-signal"
      layout={layout}
      scrollable
      title={t(widget.title || 'sites.dashboard.components.iot.title')}
    >
      {initialLoading ? (
        <WidgetSkeleton layout={layout} variant="iot" />
      ) : error || !isLoggedIn ? (
        <NotConfiguredMessage
          message={error || t('sites.dashboard.components.iot.not_connected')}
          icon={'fa-solid fa-house-signal'}
          color={'danger'}
          dashboardId={widget.dashboardId}
          layout={layout}
        />
      ) : widget.settings?.devices?.length === 0 ? (
        <NotConfiguredMessage
          message={t('sites.dashboard.components.iot.no_devices')}
          icon={'fa-solid fa-house-signal'}
          color={'warning'}
          dashboardId={widget.dashboardId}
          layout={layout}
        />
      ) : (
        <div className="w-full">
          <div className="flex min-w-max gap-3 overflow-auto">
            {availableDevices.map((device) => renderDeviceCard(device))}
          </div>
        </div>
      )}
    </MenuSection>
  );
}

export default IoTWidget;
