import {
  getCustomColorCssClass,
  getDeviceIcon,
} from '@adapter/ui/helpers/generalHelper';
import { t } from '@adapter/ui/i18n/i18n';
import NotConfiguredMessage from '@components/NotConfiguredMessage/NotConfiguredMessage';
import { Card, Chip } from '@heroui/react';
import { useSmartThings } from '@hooks/api/useSmartthings';
import { getFontSizeClass, getGlassBackground } from '@sites/Dashboard/helper';
import { useTheme } from 'next-themes';
import { JSX, useEffect, useState } from 'react';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Widget } from '../../../../../../domain/entities/Widget';
import { IoTDevice } from '../../../../../../domain/types';
import MenuSection from '../MenuSection/MenuSection';

import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import { container } from 'tsyringe';
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
        console.log('🔄 Fetching device statuses for IoT Widget...');
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
              console.log(`📊 Device ${device.deviceId} status:`, status);
            } catch (err) {
              console.error(
                `❌ Fehler beim Abrufen des Status für ${device.label || device.name}:`,
                err,
              );
            }
          }
        }

        setDeviceStates(states);
        console.log('✅ All device statuses fetched');
      };

      fetchAllDeviceStatuses();
    }
  }, [
    isLoggedIn,
    apiDevices,
    widget.settings?.devices,
    getDeviceStatus,
  ]);

  // Separate useEffect für WebSocket-Verbindung
  useEffect(() => {
    if (!isLoggedIn || !widget.dashboardId) {
      console.log('⚠️ Skipping WebSocket setup: not logged in or no dashboard ID');
      return;
    }

    console.log(`🔌 Setting up WebSocket for dashboard: ${widget.dashboardId}`);

    // SmartThings Nachrichten live empfangen
    const smartThingsMessageHandler = (event: any) => {
      console.log('🔌 SmartThings WebSocket event empfangen:', event);

      if (!event.deviceId || event.value === undefined) {
        console.warn('❌ Invalid SmartThings event: missing deviceId or value');
        return;
      }

      // Aktualisiere den Device-State optimistisch
      setDeviceStates((prev) => {
        const currentState = prev[event.deviceId] || {};

        // Erstelle eine flexible Struktur basierend auf der aktuellen State
        const updatedState = {
          ...currentState,
          components: {
            ...currentState.components,
            main: {
              ...currentState.components?.main,
              switch: {
                switch: {
                  value: event.value,
                },
              },
            },
          },
        };

        console.log(`✅ Device ${event.deviceId} state updated: ${event.value}`);

        return {
          ...prev,
          [event.deviceId]: updatedState,
        };
      });
    };

    // WebSocket Handler registrieren
    communicationService.receiveSmartThingsMessage(smartThingsMessageHandler);

    // WebSocket Verbindung aufbauen
    communicationService.connect(widget.dashboardId)
      .then(() => {
        console.log('✅ WebSocket connection established for IoT Widget');
      })
      .catch((error) => {
        console.error('❌ WebSocket connection failed for IoT Widget:', error);
      });

    // Cleanup beim Unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket for IoT Widget');
      communicationService.abmelden('smartthings-device-event');
    };
  }, [
    isLoggedIn,
    widget.dashboardId,
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

  // Wrapper-Funktionen die den Device-Status nach Änderungen aktualisieren
  const handleSetDeviceColor = async (deviceId: string, hue: number, saturation: number) => {
    await setDeviceColor(deviceId, hue, saturation);

    // Nach Farbänderung wird das Licht automatisch eingeschaltet
    // Aktualisiere den lokalen State um das zu reflektieren
    setDeviceStates((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        components: {
          ...prev[deviceId]?.components,
          main: {
            ...prev[deviceId]?.components?.main,
            switch: {
              switch: {
                value: 'on', // Licht ist nach Farbänderung an
              },
            },
          },
        },
      },
    }));
  };

  const handleSetDeviceBrightness = async (deviceId: string, level: number) => {
    await setDeviceBrightness(deviceId, level);

    // Nach Helligkeitsänderung wird das Licht automatisch eingeschaltet
    setDeviceStates((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        components: {
          ...prev[deviceId]?.components,
          main: {
            ...prev[deviceId]?.components?.main,
            switch: {
              switch: {
                value: 'on', // Licht ist nach Helligkeitsänderung an
              },
            },
          },
        },
      },
    }));
  };

  const handleSetDeviceColorTemperature = async (deviceId: string, colorTemperature: number) => {
    await setDeviceColorTemperature(deviceId, colorTemperature);

    // Nach Farbtemperatur-Änderung wird das Licht automatisch eingeschaltet
    setDeviceStates((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        components: {
          ...prev[deviceId]?.components,
          main: {
            ...prev[deviceId]?.components?.main,
            switch: {
              switch: {
                value: 'on', // Licht ist nach Farbtemperatur-Änderung an
              },
            },
          },
        },
      },
    }));
  };

  const isDeviceOn = (deviceId: string) =>
    deviceStates[deviceId]?.components?.main?.switch?.switch?.value === 'on';

  const renderDeviceCard = (device: IoTDevice) => {
    const isOn = isDeviceOn(device.deviceId);
    const hasError = commandErrors[device.deviceId];
    const deviceIcon = getDeviceIcon(device);
    const customColors = getCustomColorCssClass(layout, theme);
    const hasCustomColor = layout?.customColor && customColors;

    return (
      <div key={device.deviceId} className="relative">
        <Card
          className="p-4 shadow-xl backdrop-blur-xl border border-white/10"
          style={{
            width: '160px',
            minHeight: '120px',
            background: hasCustomColor
              ? `linear-gradient(135deg, ${customColors!.backgroundColor || getGlassBackground(theme)} 0%, ${customColors!.backgroundColor || getGlassBackground(theme)} 100%)`
              : getGlassBackground(theme),
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: hasCustomColor
              ? `0 4px 16px 0 rgba(0, 0, 0, 0.1), 0 0 30px -8px ${customColors!.backgroundColor || 'transparent'}`
              : '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
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
              <div className="flex items-center gap-1">
                {/* Color Controls with Portal rendering - Prevent event propagation */}
                {(device.supportsColor || device.supportsColorTemperature || device.supportsBrightness) && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ColorControls
                      device={device}
                      layout={layout}
                      onColorChange={handleSetDeviceColor}
                      onColorTemperatureChange={handleSetDeviceColorTemperature}
                      onBrightnessChange={handleSetDeviceBrightness}
                      isLoading={deviceLoading[device.deviceId]}
                      hasError={!!commandErrors[device.deviceId]}
                    />
                  </div>
                )}
                {deviceLoading[device.deviceId] && (
                  <div className="animate-spin">
                    <i className="fa-solid fa-spinner text-primary"></i>
                  </div>
                )}
              </div>
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
        </Card>


      </div>
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
