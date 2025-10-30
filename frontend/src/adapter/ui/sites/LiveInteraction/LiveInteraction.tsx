import { Button, Divider, Select, SelectItem, Textarea } from '@heroui/react';
import { useGetDashboards } from '@hooks/index';
import { useCommunication } from '@hooks/sites/liveInteraction/useCommunication';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaComments, FaInfo, FaPaperPlane } from 'react-icons/fa';

const LiveInteraction = () => {
  const { t } = useTranslation();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState<
    string | undefined
  >(undefined);

  const { sendMessage, lastReceivedMessage, error } =
    useCommunication(selectedDashboard);

  const {
    dashboards,
    error: errorGetDashboards,
    isLoading,
  } = useGetDashboards();

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage, selectedDashboard);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderAlert = (
    message: string,
    type: 'error' | 'warning' | 'info' | 'loading',
  ) => {
    const styles = {
      error: 'bg-red-50 border-red-200 text-red-700',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      info: 'bg-blue-50 border-blue-200 text-blue-700',
      loading: 'bg-gray-50 border-gray-200 text-gray-700',
    };

    return (
      <div
        className={`${styles[type]} border-l-4 px-6 py-4 rounded-r mb-6 flex items-center shadow-sm`}
      >
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
        {dashboards &&
          dashboards.length === 0 &&
          !isLoading &&
          renderAlert(t('sites.liveInteraction.noDashboards'), 'warning')}
        {isLoading &&
          renderAlert(t('sites.liveInteraction.loading'), 'loading')}

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

        {lastReceivedMessage && (
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('sites.liveInteraction.lastMessage')}
            </h3>
            <p className="text-foreground">{lastReceivedMessage}</p>
          </div>
        )}

        <div className="mt-8">
          <Textarea
            placeholder={t('sites.liveInteraction.messageInput')}
            value={inputMessage}
            onValueChange={setInputMessage}
            onKeyPress={handleKeyPress}
            className="w-full mb-6 shadow-sm"
            rows={6}
            minRows={3}
            maxRows={8}
          />

          <div className="flex justify-end">
            <Button
              color="primary"
              onPress={handleSendMessage}
              isDisabled={!inputMessage.trim() || !selectedDashboard}
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
    </div>
  );
};

export default LiveInteraction;
