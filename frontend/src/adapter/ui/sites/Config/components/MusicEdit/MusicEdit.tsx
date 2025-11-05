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
  const { isLoggedIn, isLoading, login, logout, handleCallback } = useSpotifyAuth(dashboardId);

  useEffect(() => {
    onHideSaveButton(true);
  }, [onHideSaveButton]);

  // Message listener for Spotify callback (like Microsoft/SmartThings pattern)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'spotify-auth-success') {
        console.log('Spotify auth success message received:', event.data);

        try {
          const { code, dashboardId: msgDashboardId } = event.data;

          if (code && msgDashboardId) {
            // Send code to backend via the hook (like it was done in SpotifyCallback before)
            await handleCallback(code, msgDashboardId);
            console.log('Spotify callback processed successfully');
          } else {
            console.error('Missing code or dashboardId in Spotify auth message');
          }
        } catch (error) {
          console.error('Error processing Spotify callback:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleCallback]);

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
