import { useSpotifyAuth } from '@hooks/sites/configSite/useSpoitfyAuth';
import { Button, Spinner } from '@heroui/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSpotify } from 'react-icons/fa';

export interface MusicEditProps {
  onHideSaveButton: (hide: boolean) => void;
  dashboardId: string;
}

export const MusicEdit: React.FC<MusicEditProps> = ({
  onHideSaveButton,
  dashboardId,
}) => {
  const { t } = useTranslation();
  const { isLoggedIn, isLoading, login, logout } = useSpotifyAuth(dashboardId);

  useEffect(() => {
    onHideSaveButton(true);
  }, [onHideSaveButton]);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center p-4 space-y-4">
        <p className="text-center">
          {t('sites.config.components.musicEdit.description')}
        </p>
        <Button
          onPress={() => login(dashboardId)}
          color="success"
          startContent={<FaSpotify />}
        >
          {t('sites.config.components.musicEdit.login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <FaSpotify className="text-green-500 text-4xl" />
      <h3 className="text-lg font-semibold text-center text-green-500">
        {t('sites.config.components.musicEdit.connected')}
      </h3>
      <p className="text-center text-sm">
        {t('sites.config.components.musicEdit.connectedMessage')}
      </p>
      <Button onPress={logout} color="danger">
        {t('sites.config.components.musicEdit.logout')}
      </Button>
    </div>
  );
};

export default MusicEdit;
