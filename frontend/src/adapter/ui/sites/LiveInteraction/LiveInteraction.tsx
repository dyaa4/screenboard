import { Button, Divider, Select, SelectItem, Tab, Tabs, Textarea, Input } from '@heroui/react';
import { useGetDashboards } from '@hooks/index';
import { useCommunication } from '@hooks/sites/liveInteraction/useCommunication';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaComments, FaInfo, FaPaperPlane, FaClock, FaBell, FaExclamationTriangle } from 'react-icons/fa';

type InteractionType = 'message' | 'timer' | 'alert' | 'notification';

const LiveInteraction = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<InteractionType>('message');
  const [inputMessage, setInputMessage] = useState('');
  const [timerMessage, setTimerMessage] = useState('');
  const [timerDuration, setTimerDuration] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState<string | undefined>(undefined);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  const { sendMessage, lastReceivedMessage, error } = useCommunication(selectedDashboard);
  const { dashboards, error: errorGetDashboards, isLoading } = useGetDashboards();

  // Timer countdown effect - sends message automatically when timer reaches 0
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerRemaining !== null && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timerRemaining === 0 && timerActive) {
      setTimerActive(false);
      // Auto-send the message when timer reaches 0
      if (timerMessage.trim() && selectedDashboard) {
        sendMessage(timerMessage, selectedDashboard);
        setTimerMessage('');
        setTimerDuration('');
        setTimerRemaining(null);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerRemaining, timerMessage, sendMessage, selectedDashboard]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!selectedDashboard) {
      return;
    }

    if (selectedTab === 'message') {
      if (!inputMessage.trim()) {
        return;
      }
      sendMessage(inputMessage, selectedDashboard);
      setInputMessage('');
    } else if (selectedTab === 'timer') {
      if (!timerMessage.trim() || !timerDuration || parseInt(timerDuration) <= 0) {
        return;
      }
      const seconds = parseInt(timerDuration);
      setTimerRemaining(seconds);
      setTimerActive(true);
    } else if (selectedTab === 'alert') {
      if (!alertTitle.trim() || !alertMessage.trim()) {
        return;
      }
      sendMessage(
        JSON.stringify({
          type: 'alert',
          title: alertTitle,
          message: alertMessage,
          severity: alertSeverity,
        }),
        selectedDashboard
      );
      setAlertTitle('');
      setAlertMessage('');
    } else if (selectedTab === 'notification') {
      if (!notificationTitle.trim() || !notificationBody.trim()) {
        return;
      }
      sendMessage(
        JSON.stringify({
          type: 'notification',
          title: notificationTitle,
          body: notificationBody,
        }),
        selectedDashboard
      );
      setNotificationTitle('');
      setNotificationBody('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderAlert = (message: string, type: 'error' | 'warning' | 'info' | 'loading') => {
    const styles = {
      error: 'bg-red-50 border-red-200 text-red-700',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      info: 'bg-blue-50 border-blue-200 text-blue-700',
      loading: 'bg-gray-50 border-gray-200 text-gray-700',
    };

    return (
      <div className={`${styles[type]} border-l-4 px-6 py-4 rounded-r mb-6 flex items-center shadow-sm`}>
        <FaInfo className="mr-3 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-default-100">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
            <FaComments className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('sites.liveInteraction.title')}
            </h1>
            <p className="text-default-500 text-sm mt-1">
              {t('sites.config.components.communication.desc')}
            </p>
          </div>
        </div>

        <Divider className="my-6 opacity-50" />

        <div className="space-y-6">
          {error && renderAlert(error, 'error')}
          {errorGetDashboards && renderAlert(errorGetDashboards.message, 'error')}
          {dashboards && dashboards.length === 0 && !isLoading && renderAlert(t('sites.liveInteraction.noDashboards'), 'warning')}
          {isLoading && renderAlert(t('sites.liveInteraction.loading'), 'loading')}

          {/* Dashboard Selector */}
          <Select
            placeholder={t('sites.liveInteraction.selectDashboard')}
            selectedKeys={selectedDashboard ? [selectedDashboard] : []}
            className="max-w-xl"
            onChange={(e) => setSelectedDashboard(e.target.value)}
          >
            <SelectItem key="all" className="font-medium">
              {t('common.all')}
            </SelectItem>
            <>
              {dashboards.map((dashboard) => (
                <SelectItem key={dashboard._id}>{dashboard.name}</SelectItem>
              ))}
            </>
          </Select>

          {/* Last Received Message */}
          {lastReceivedMessage && (
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {t('sites.liveInteraction.lastMessage')}
              </h3>
              <p className="text-foreground">{lastReceivedMessage}</p>
            </div>
          )}

          {/* Interaction Type Tabs */}
          <Tabs
            aria-label="Interaction Types"
            color="primary"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as InteractionType)}
          >
            {/* Message Tab */}
            <Tab
              key="message"
              title={
                <div className="flex items-center space-x-2">
                  <FaPaperPlane />
                  <span>{t('sites.liveInteraction.tabs.message')}</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder={t('sites.liveInteraction.messageInput')}
                  value={inputMessage}
                  onValueChange={setInputMessage}
                  onKeyPress={handleKeyPress}
                  className="w-full shadow-sm"
                  rows={6}
                  minRows={3}
                  maxRows={8}
                />
              </div>
            </Tab>

            {/* Timer Tab */}
            <Tab
              key="timer"
              title={
                <div className="flex items-center space-x-2">
                  <FaClock />
                  <span>{t('sites.liveInteraction.tabs.timer')}</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                {timerActive ? (
                  <div className="flex flex-col items-center justify-center gap-6 py-8">
                    <p className="text-sm text-gray-500">Nachricht wird versendet in:</p>
                    <div className="text-6xl font-bold text-primary">{formatTime(timerRemaining || 0)}</div>
                    <p className="text-center text-foreground max-w-md break-words italic">"{timerMessage}"</p>
                    <Button
                      color="danger"
                      onPress={() => {
                        setTimerActive(false);
                        setTimerRemaining(null);
                        setTimerMessage('');
                        setTimerDuration('');
                      }}
                      size="lg"
                    >
                      Abbrechen
                    </Button>
                  </div>
                ) : (
                  <>
                    <Textarea
                      label="Nachricht"
                      placeholder="Geben Sie die Nachricht ein, die versendet werden soll"
                      value={timerMessage}
                      onValueChange={setTimerMessage}
                      className="w-full shadow-sm"
                      rows={4}
                      minRows={3}
                      maxRows={6}
                    />
                    <Input
                      type="number"
                      label="Verzögerung (Sekunden)"
                      placeholder="30"
                      value={timerDuration}
                      onValueChange={setTimerDuration}
                      onKeyPress={handleKeyPress}
                      min="1"
                      max="86400"
                    />
                    <p className="text-xs text-gray-500">Die Nachricht wird nach der eingestellten Zeit automatisch versendet</p>
                  </>
                )}
              </div>
            </Tab>

            {/* Alert Tab */}
            <Tab
              key="alert"
              title={
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle />
                  <span>{t('sites.liveInteraction.tabs.alert')}</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  label="Alert Title"
                  placeholder="Enter alert title"
                  value={alertTitle}
                  onValueChange={setAlertTitle}
                  onKeyPress={handleKeyPress}
                />
                <Textarea
                  label="Alert Message"
                  placeholder="Enter alert message"
                  value={alertMessage}
                  onValueChange={setAlertMessage}
                  className="w-full"
                  rows={4}
                  minRows={3}
                  maxRows={6}
                />
                <Select
                  label="Severity"
                  selectedKeys={[alertSeverity]}
                  onSelectionChange={(selected) => {
                    const key = Array.from(selected)[0];
                    if (key) setAlertSeverity(key as string);
                  }}
                  className="w-full max-w-xs"
                >
                  <SelectItem key="info">
                    Info
                  </SelectItem>
                  <SelectItem key="warning">
                    Warning
                  </SelectItem>
                  <SelectItem key="error">
                    Error
                  </SelectItem>
                  <SelectItem key="success">
                    Success
                  </SelectItem>
                </Select>
              </div>
            </Tab>

            {/* Notification Tab */}
            <Tab
              key="notification"
              title={
                <div className="flex items-center space-x-2">
                  <FaBell />
                  <span>{t('sites.liveInteraction.tabs.notification')}</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  label="Notification Title"
                  placeholder="Enter notification title"
                  value={notificationTitle}
                  onValueChange={setNotificationTitle}
                  onKeyPress={handleKeyPress}
                />
                <Textarea
                  label="Notification Body"
                  placeholder="Enter notification body"
                  value={notificationBody}
                  onValueChange={setNotificationBody}
                  className="w-full"
                  rows={4}
                  minRows={3}
                  maxRows={6}
                />
              </div>
            </Tab>
          </Tabs>

          {/* Send Button */}
          <div className="flex justify-end pt-4">
            <Button
              color="primary"
              onPress={handleSendMessage}
              isDisabled={!selectedDashboard || (selectedTab === 'timer' && timerActive)}
              className="px-8 py-6 font-semibold"
              size="lg"
              startContent={<FaPaperPlane className="mr-2" />}
            >
              {t('actions.send')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInteraction;
