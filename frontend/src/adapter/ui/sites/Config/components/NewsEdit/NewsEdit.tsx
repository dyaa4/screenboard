import { NewsWidgetSettings } from '@domain/types';
import { Input } from '@heroui/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface NewsEditProps {
  settings: NewsWidgetSettings;
  onSettingsChange: (settings: NewsWidgetSettings, valid: boolean) => void;
}

const NewsEdit: React.FC<NewsEditProps> = ({ settings, onSettingsChange }) => {
  const { t } = useTranslation();
  const [rssUrl, setRssUrl] = useState<string>(settings.rssUrl || '');

  const handleRssUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setRssUrl(url);

    onSettingsChange({ ...settings, rssUrl: url }, true);
  };

  return (
    <div>
      <Input
        type="url"
        label={t('sites.config.components.newsEdit.customUrl')}
        value={rssUrl}
        onChange={handleRssUrlChange}
        className="mt-4"
      />
    </div>
  );
};

export default NewsEdit;
