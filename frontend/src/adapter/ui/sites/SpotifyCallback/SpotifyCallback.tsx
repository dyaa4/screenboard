import { replaceDashboardId } from '@common/helpers/objectHelper';
import { ROUTE_CONFIG_WIDGETS, ROUTE_DASHBOARD, ROUTE_DASHBOARD_ID, ROUTE_HOME } from '@common/routes';
import { Button, Card, CardBody, CardFooter, CardHeader, Divider } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const SpotifyCallback: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [dashboardId, setDashboardId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(true);
  const isPopup = window.opener !== null;

  useEffect(() => {

    const extractDashboardId = () => {
      try {
        const params = new URLSearchParams(location.search);
        const state = params.get('state');
        if (state) {
          const decoded = JSON.parse(atob(state));
          return decoded.dashboardId;
        }
      } catch (error) {
        console.error('Error decoding state parameter:', error);
      }
      return undefined;
    };

    const processAuth = async () => {
      try {
        setIsProcessing(true);

        const extractedDashboardId = extractDashboardId();
        setDashboardId(extractedDashboardId);

        if (window.opener) {
          // Send message to main window with code/state for potential reload
          const params = new URLSearchParams(location.search);
          const code = params.get('code');
          const state = params.get('state');

          window.opener.postMessage(
            {
              type: 'spotify-auth-success',
              dashboardId: extractedDashboardId,
              code,
              state,
            },
            window.location.origin,
          );

          // Mark as success since we sent the message
          setIsSuccess(true);

          // Close window after a short delay (so user sees success message)
          setTimeout(() => window.close(), 1200);
        } else {
          // Fallback for non-popup scenarios
          setIsSuccess(true);
        }

        setIsProcessing(false);
      } catch (error) {
        console.error('Error during auth processing:', error);
        setIsProcessing(false);
        setIsSuccess(false);
      }
    };

    processAuth();
  }, [location.search]);

  if (isProcessing) {
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
            <h2 className="text-2xl font-bold text-center mb-2">
              {t('sites.spotifyCallback.processing')}
            </h2>
            <p className="text-center">
              {t('sites.spotifyCallback.pleaseWait')}
            </p>
          </CardBody>
        </Card>
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
          {isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-green-500">
                {t('sites.spotifyCallback.success')}
              </h2>
              <p className="text-center">
                {isPopup
                  ? t('sites.spotifyCallback.successMessagePopup')
                  : t('sites.spotifyCallback.successMessage')
                }
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-red-500">
                {t('sites.spotifyCallback.error')}
              </h2>
              <p className="text-center">
                {t('sites.spotifyCallback.errorMessage')}
              </p>
            </>
          )}
        </CardBody>
        <Divider />
        <CardFooter className="justify-center flex gap-2">
          {!isPopup && (
            <>
              <Button
                color="secondary"
                variant="shadow"
                onPress={() => navigate(ROUTE_HOME)}
              >
                {t('sites.spotifyCallback.goToHome')}
              </Button>
              {isSuccess && dashboardId && (
                <>
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
                  <Button
                    color="primary"
                    variant="shadow"
                    onPress={() =>
                      navigate(replaceDashboardId(ROUTE_CONFIG_WIDGETS, dashboardId))
                    }
                  >
                    {t('sites.spotifyCallback.toWidgets')}
                  </Button>
                </>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SpotifyCallback;
