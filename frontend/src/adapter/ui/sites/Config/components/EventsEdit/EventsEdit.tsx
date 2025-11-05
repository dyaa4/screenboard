import { Widget } from '../../../../../../domain/entities/Widget';
import { EventWidgetSettings } from '../../../../../../domain/types';
import { EventType } from '../../../../../../domain/types/widget/EventWidgetSettings';
import {
  Avatar,
  Button,
  Input,
  Listbox,
  ListboxItem,
  Selection,
  Spinner,
  Tab,
  Tabs,
} from '@heroui/react';
import { useGoogleCalendar } from '@hooks/sites/configSite/useGoogleCalendar';
import { useMicrosoftCalendar } from '@hooks/sites/configSite/useMicrosoftCalendar';
import { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaCalendar,
  FaCalendarAlt,
  FaGoogle,
  FaLink,
  FaMicrosoft,
  FaSignOutAlt,
} from 'react-icons/fa';

export interface EventsEditProps {
  widget: Widget;
  settings: EventWidgetSettings;
  onSettingsChange: (settings: EventWidgetSettings, valid: boolean) => void;
}

const EventsEdit = ({
  widget,
  settings,
  onSettingsChange,
}: EventsEditProps): JSX.Element => {
  const { user, calendars, login, logout, loading, error } = useGoogleCalendar(
    widget.dashboardId,
  );

  const {
    user: microsoftUser,
    calendars: microsoftCalendars,
    login: microsoftLogin,
    logout: microsoftLogout,
    loading: microsoftLoading,
    error: microsoftError
  } = useMicrosoftCalendar(widget.dashboardId);

  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(
    settings.calendarId || null,
  );
  const [activeTab, setActiveTab] = useState<EventType>(
    settings.type || EventType.GOOGLE,
  );
  const [icalLink, setIcalLink] = useState<string>(settings.icalLink || '');

  const { t } = useTranslation();

  // Update local state when settings change
  useEffect(() => {
    if (settings.type) {
      setActiveTab(settings.type);
    }
    setSelectedCalendar(settings.calendarId || null);
    setIcalLink(settings.icalLink || '');
  }, [settings]);

  // Validation helper
  const isConfigurationValid = (updatedSettings: EventWidgetSettings): boolean => {
    switch (updatedSettings.type) {
      case EventType.GOOGLE:
        return !!(updatedSettings.calendarId && user);
      case EventType.MICROSOFT:
        return !!(updatedSettings.calendarId && microsoftUser);
      case EventType.ICAL:
        return !!updatedSettings.icalLink;
      default:
        return false;
    }
  };

  // Settings update helper
  const updateSettings = (newSettings: Partial<EventWidgetSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    const isValid = isConfigurationValid(updatedSettings);
    onSettingsChange(updatedSettings, isValid);
  };

  // Event handlers
  const handleGoogleCalendarSelect = (selectedKeys: Selection) => {
    const selectedCalendarId = Array.from(selectedKeys)[0] as string;

    if (selectedCalendarId) {
      setSelectedCalendar(selectedCalendarId);
      updateSettings({
        type: EventType.GOOGLE,
        calendarId: selectedCalendarId,
      });
    } else {
      setSelectedCalendar(null);
      updateSettings({
        type: EventType.GOOGLE,
        calendarId: undefined,
      });
    }
  };

  const handleMicrosoftCalendarSelect = (selectedKeys: Selection) => {
    const selectedCalendarId = Array.from(selectedKeys)[0] as string;

    if (selectedCalendarId) {
      setSelectedCalendar(selectedCalendarId);
      updateSettings({
        type: EventType.MICROSOFT,
        calendarId: selectedCalendarId,
      });
    } else {
      setSelectedCalendar(null);
      updateSettings({
        type: EventType.MICROSOFT,
        calendarId: undefined,
      });
    }
  };

  const handleGoogleLogout = () => {
    logout();
    setSelectedCalendar(null);
    updateSettings({
      type: EventType.GOOGLE,
      calendarId: undefined,
    });
  };

  const handleMicrosoftLogout = () => {
    microsoftLogout();
    setSelectedCalendar(null);
    updateSettings({
      type: EventType.MICROSOFT,
      calendarId: undefined,
    });
  };

  const handleIcalLinkChange = (link: string) => {
    setIcalLink(link);
    updateSettings({
      type: EventType.ICAL,
      icalLink: link,
    });
  };

  // Auto-sync settings when dependencies change
  useEffect(() => {
    if (activeTab === EventType.GOOGLE) {
      updateSettings({
        type: EventType.GOOGLE,
        calendarId: selectedCalendar || undefined,
      });
    }
  }, [user, selectedCalendar, activeTab]);

  useEffect(() => {
    if (activeTab === EventType.MICROSOFT) {
      updateSettings({
        type: EventType.MICROSOFT,
        calendarId: selectedCalendar || undefined,
      });
    }
  }, [microsoftUser, selectedCalendar, activeTab]);

  // Handle tab changes
  useEffect(() => {
    if (activeTab !== settings.type) {
      setSelectedCalendar(null);
    }

    if (activeTab === EventType.ICAL) {
      updateSettings({
        type: EventType.ICAL,
        icalLink: icalLink,
      });
    } else if (activeTab === EventType.MICROSOFT && !selectedCalendar) {
      updateSettings({
        type: EventType.MICROSOFT,
      });
    } else if (activeTab === EventType.GOOGLE && selectedCalendar) {
      updateSettings({
        type: EventType.GOOGLE,
        calendarId: selectedCalendar,
      });
    } else if (activeTab === EventType.MICROSOFT && selectedCalendar) {
      updateSettings({
        type: EventType.MICROSOFT,
        calendarId: selectedCalendar,
      });
    }
  }, [activeTab]);

  // Loading state
  if (loading || microsoftLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  // Error states
  if (error && microsoftError) {
    return <p className="text-red-500">{error} / {microsoftError}</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (microsoftError) {
    return <p className="text-red-500">{microsoftError}</p>;
  }

  return (
    <div className="w-full mx-auto">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as EventType)}
        className="w-full mb-4"
      >
        <Tab
          key={EventType.GOOGLE}
          title={
            <div className="flex items-center space-x-2">
              <FaGoogle />
              <span>{t('sites.config.components.eventsEdit.google')}</span>
            </div>
          }
        />
        <Tab
          key={EventType.MICROSOFT}
          title={
            <div className="flex items-center space-x-2">
              <FaMicrosoft />
              <span>{t('sites.config.components.eventsEdit.microsoft')}</span>
            </div>
          }
        />
        <Tab
          key={EventType.ICAL}
          title={
            <div className="flex items-center space-x-2">
              <FaCalendarAlt />
              <span>{t('sites.config.components.eventsEdit.ical')}</span>
            </div>
          }
        />
      </Tabs>
      <div className="py-2">
        {activeTab === EventType.GOOGLE &&
          (!user ? (
            <Button onPress={login} startContent={<FaLink />} className="w-sm">
              {t('sites.config.components.eventsEdit.signInGoogle')}
            </Button>
          ) : (
            <>
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-2">
                  <Avatar src={user.picture} alt={user.name} size="sm" />
                  <span className="text-small">{user.name}</span>
                </div>
                <Button
                  color="danger"
                  variant="light"
                  endContent={<FaSignOutAlt />}
                  onPress={handleGoogleLogout}
                  size="sm"
                >
                  {t('actions.logout')}
                </Button>
              </div>
              {calendars.length > 0 ? (
                <Listbox
                  aria-label="Calendar selection"
                  selectionMode="single"
                  selectedKeys={selectedCalendar ? [selectedCalendar] : []}
                  onSelectionChange={handleGoogleCalendarSelect}
                  className="max-h-[300px] overflow-y-auto"
                >
                  {calendars.map((calendar) => (
                    <ListboxItem
                      key={calendar.id}
                      startContent={<FaCalendar className="text-default-500" />}
                      className="py-2"
                    >
                      {calendar.summary}
                    </ListboxItem>
                  ))}
                </Listbox>
              ) : (
                <p className="text-center text-default-500">
                  {t('sites.config.components.eventsEdit.noCalendarFound')}
                </p>
              )}
              {!selectedCalendar && (
                <p className="text-center text-danger mt-2">
                  {t('sites.config.components.eventsEdit.selectACalendar')}
                </p>
              )}
            </>
          ))}
        {activeTab === EventType.MICROSOFT &&
          (!microsoftUser ? (
            <Button onPress={microsoftLogin} startContent={<FaLink />} className="w-sm">
              {t('sites.config.components.eventsEdit.signInMicrosoft')}
            </Button>
          ) : (
            <>
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-2">
                  <Avatar src={microsoftUser.picture} alt={microsoftUser.name} size="sm" />
                  <span className="text-small">{microsoftUser.name}</span>
                </div>
                <Button
                  color="danger"
                  variant="light"
                  endContent={<FaSignOutAlt />}
                  onPress={handleMicrosoftLogout}
                  size="sm"
                >
                  {t('actions.logout')}
                </Button>
              </div>
              {microsoftCalendars.length > 0 ? (
                <Listbox
                  aria-label="Microsoft Calendar selection"
                  selectionMode="single"
                  selectedKeys={selectedCalendar ? [selectedCalendar] : []}
                  onSelectionChange={handleMicrosoftCalendarSelect}
                  className="max-h-[300px] overflow-y-auto"
                >
                  {microsoftCalendars.map((calendar) => (
                    <ListboxItem
                      key={calendar.id}
                      startContent={<FaCalendar className="text-default-500" />}
                      className="py-2"
                    >
                      {calendar.name}
                    </ListboxItem>
                  ))}
                </Listbox>
              ) : (
                <p className="text-center text-default-500">
                  {t('sites.config.components.eventsEdit.noCalendarFound')}
                </p>
              )}
              {!selectedCalendar && activeTab === EventType.MICROSOFT && (
                <p className="text-center text-danger mt-2">
                  {t('sites.config.components.eventsEdit.selectACalendar')}
                </p>
              )}
            </>
          ))}
        {activeTab === EventType.ICAL && (
          <Input
            label="iCal Link"
            placeholder="Enter your iCal link here"
            value={icalLink}
            onChange={(e) => handleIcalLinkChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default EventsEdit;
