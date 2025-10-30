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

  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(
    settings.calendarId || null,
  );
  const [activeTab, setActiveTab] = useState<EventType>(
    settings.type || EventType.GOOGLE,
  );
  const [icalLink, setIcalLink] = useState<string>(settings.icalLink || '');

  const { t } = useTranslation();

  useEffect(() => {
    setActiveTab(settings.type || EventType.GOOGLE);
    setSelectedCalendar(settings.calendarId || null);
    setIcalLink(settings.icalLink || '');
  }, [settings]);

  useEffect(() => {
    if (user && calendars.length > 0 && !selectedCalendar) {
      handleCalendarSelect(new Set([calendars[0].id]));
    }
  }, [calendars, user]);

  const updateSettings = (newSettings: Partial<EventWidgetSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    const isValid =
      updatedSettings.type === EventType.GOOGLE
        ? !!updatedSettings.calendarId && !!user
        : !!updatedSettings.icalLink;
    onSettingsChange(updatedSettings, isValid);
  };

  const handleCalendarSelect = (selectedKeys: Selection) => {
    const selectedCalendarId = Array.from(selectedKeys).values().next()
      .value as string;
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

  useEffect(() => {
    // Trigger validation when user or selectedCalendar changes
    if (activeTab === EventType.GOOGLE) {
      updateSettings({
        type: EventType.GOOGLE,
        calendarId: selectedCalendar || undefined,
      });
    }
  }, [user, selectedCalendar]);

  if (loading)
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

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
          key="microsoft"
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
                  onPress={() => {
                    logout();
                    setSelectedCalendar(null);
                    updateSettings({
                      type: EventType.GOOGLE,
                      calendarId: undefined,
                    });
                  }}
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
                  onSelectionChange={handleCalendarSelect}
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
        {activeTab === EventType.ICAL && (
          <Input
            label="iCal Link"
            placeholder="Enter your iCal link here"
            value={icalLink}
            onChange={(e) => {
              setIcalLink(e.target.value);
              updateSettings({
                type: EventType.ICAL,
                icalLink: e.target.value,
              });
            }}
          />
        )}
        {activeTab === EventType.MICROSOFT && (
          <p className="text-center text-default-500">Coming soon</p>
        )}
      </div>
    </div>
  );
};

export default EventsEdit;
