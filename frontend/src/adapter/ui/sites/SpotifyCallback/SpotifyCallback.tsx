import { useAuth } from '@adapter/ui/contexts/AuthContext';
import { replaceDashboardId } from '@common/helpers/objectHelper';
import {
  ROUTE_CONFIG_WIDGETS,
  ROUTE_DASHBOARD,
  ROUTE_DASHBOARD_ID,
  ROUTE_HOME,
} from '@common/routes';
import { useSpotifyAuth } from '@hooks/sites/configSite/useSpoitfyAuth';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Spinner,
} from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const SpotifyCallback: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardId, setDashboardId] = useState<string | undefined>(undefined);
  const { isLoggedIn, isLoading, handleCallback } = useSpotifyAuth(dashboardId);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    if (!state || !code) {
      throw new Error('No state or Code found in the Spotify URL');
    }

    const decodedState = JSON.parse(atob(state));
    setDashboardId(decodedState.dashboardId);
    handleCallback(code, decodedState.dashboardId);
  }, [isAuthenticated]);

  if (isLoading || !isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px] p-4">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">{t('sites.spotifyCallback.title')}</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex items-center justify-center mb-4">
            <i className="fab fa-spotify text-6xl text-green-500"></i>
          </div>
          {isLoggedIn ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-green-500">
                {t('sites.spotifyCallback.success')}
              </h2>
              <p className="text-center">
                {t('sites.spotifyCallback.successMessage')}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-yellow-500">
                {t('sites.spotifyCallback.notLoggedIn')}
              </h2>
              <p className="text-center">
                {t('sites.spotifyCallback.loginPrompt')}
              </p>
            </>
          )}
        </CardBody>
        <Divider />
        <CardFooter className="justify-center flex gap-2">
          {isLoggedIn ? (
            <>
              <Button
                color="secondary"
                variant="shadow"
                onPress={() => navigate(ROUTE_HOME)}
              >
                {t('sites.spotifyCallback.goToHome')}
              </Button>
              <Button
                color="primary"
                variant="shadow"
                onPress={() =>
                  navigate(
                    replaceDashboardId(
                      ROUTE_DASHBOARD + ROUTE_DASHBOARD_ID,
                      dashboardId,
                    ),
                  )
                }
              >
                {t('sites.spotifyCallback.goToDashboard')}
              </Button>
            </>
          ) : (
            <Button
              color="primary"
              variant="shadow"
              onPress={() =>
                navigate(replaceDashboardId(ROUTE_CONFIG_WIDGETS, dashboardId))
              }
            >
              {t('sites.spotifyCallback.toWidgets')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SpotifyCallback;
