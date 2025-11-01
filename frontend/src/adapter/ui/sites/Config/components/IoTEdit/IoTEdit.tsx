import { getDeviceIcon } from '@adapter/ui/helpers/generalHelper';
import { Widget } from '../../../../../../domain/entities/Widget';
import { IoTDevice, IoTWidgetSettings } from '../../../../../../domain/types';

import {
  Avatar,
  Button,
  Listbox,
  ListboxItem,
  Selection,
  Spinner,
} from '@heroui/react';
import { useSmartThings } from '@hooks/api/useSmartthings';
import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { FaLink, FaSignOutAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export interface IoTEditProps {
  widget: Widget;
  settings: IoTWidgetSettings;
  onSettingsChange: (settings: IoTWidgetSettings, valid: boolean) => void;
}

const DEFAULT_SETTINGS: IoTWidgetSettings = {
  devices: [],
};

const IoTEdit = ({
  widget,
  settings,
  onSettingsChange,
}: IoTEditProps): JSX.Element => {
  const {
    user,
    devices: apiDevices,
    login,
    logout,
    initialLoading,
    error,
    isLoggedIn,
  } = useSmartThings(widget.dashboardId);



  // Kombiniere die vorhandenen Einstellungen mit den Standardeinstellungen
  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

  const { t } = useTranslation();
  // Vermeidung von unnötigen Re-renderings durch useRef
  const updatePending = useRef(false);

  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(
    new Set(mergedSettings.devices?.map((device) => device.deviceId) || []),
  );

  const updateSettings = useCallback(() => {
    if (updatePending.current) return;
    updatePending.current = true;

    setTimeout(() => {
      const selectedDevicesList = apiDevices
        .filter((device) => selectedDevices.has(device.deviceId))
        .map((device) => ({
          ...device,
          selected: true,
        }));

      const updatedSettings: IoTWidgetSettings = {
        ...mergedSettings,
        devices: selectedDevicesList,
      };

      const isValid = selectedDevicesList.length > 0 && isLoggedIn;
      onSettingsChange(updatedSettings, isValid);

      updatePending.current = false;
    }, 0);
  }, [
    apiDevices,
    selectedDevices,
    isLoggedIn,
    onSettingsChange,
    mergedSettings,
  ]);

  const handleDeviceSelect = useCallback(
    (selectedKeys: Selection) => {
      const newSelectedDevices = new Set(
        Array.from(selectedKeys),
      ) as Set<string>;
      setSelectedDevices(newSelectedDevices);
    },
    [selectedDevices],
  );

  useEffect(() => {
    updateSettings();
  }, [selectedDevices, isLoggedIn, updateSettings]);

  useEffect(() => {
    if (JSON.stringify(settings) !== JSON.stringify(mergedSettings)) {
      setSelectedDevices(
        new Set(mergedSettings.devices?.map((device) => device.deviceId) || []),
      );
    }
  }, [settings]);

  if (initialLoading)
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full mx-auto">
      <div className="py-2">
        {!isLoggedIn ? (
          <Button onPress={login} startContent={<FaLink />} className="w-sm">
            {t('sites.config.components.iotEdit.loginWithSmartThings')}
          </Button>
        ) : (
          <>
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-2">
                <Avatar src={user?.picture} alt={user?.name || ''} size="sm" />
                <span className="text-small">{user?.name}</span>
              </div>
              <Button
                color="danger"
                variant="light"
                endContent={<FaSignOutAlt />}
                onPress={() => {
                  logout();
                  setSelectedDevices(new Set());
                }}
                size="sm"
              >
                {t('actions.logout')}
              </Button>
            </div>

            {apiDevices.length > 0 ? (
              <Listbox
                aria-label={t(
                  'sites.config.components.iotEdit.deviceSelection',
                )}
                selectionMode="multiple"
                selectedKeys={selectedDevices}
                onSelectionChange={handleDeviceSelect}
                className="max-h-[300px] overflow-y-auto"
              >
                {apiDevices.map((device: IoTDevice) => (
                  <ListboxItem
                    key={device.deviceId}
                    startContent={<i className={getDeviceIcon(device)} />}
                    description={`${t('sites.config.components.iotEdit.deviceType')}: ${device.name}${device.roomName
                      ? ` | ${t('sites.config.components.iotEdit.deviceRoom')}: ${device.roomName}`
                      : ''
                      }`}
                    className="py-2"
                  >
                    {device.label || device.name}
                  </ListboxItem>
                ))}
              </Listbox>
            ) : (
              <p className="text-center text-default-500">
                {t('sites.config.components.iotEdit.noDevices')}
              </p>
            )}

            {selectedDevices.size === 0 && (
              <p className="text-center text-danger mt-2">
                {t('sites.config.components.iotEdit.noSelectedDevice')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IoTEdit;
