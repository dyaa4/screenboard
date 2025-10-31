import { Button, Card, CardBody, CardHeader, Divider, CardFooter } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSmartThingsCallback } from '@hooks/sites/smartthings/useSmartThingsCallback';
import { ROUTE_DASHBOARD, ROUTE_HOME, ROUTE_DASHBOARD_ID, ROUTE_CONFIG_WIDGETS } from '@common/routes';
import { replaceDashboardId } from '@common/helpers/objectHelper';

export const SmartThingsCallback: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [dashboardId, setDashboardId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(true);
  const isPopup = window.opener !== null;

  useEffect(() => {
    const { processCallback } = useSmartThingsCallback();

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
        const success = await processCallback(location.search);
        setIsSuccess(success);

        const extractedDashboardId = extractDashboardId();
        setDashboardId(extractedDashboardId);

        if (window.opener) {
          if (success) {
            // Send message to main window with code/state for potential reload
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state');

            window.opener.postMessage(
              {
                type: 'smartthings-auth-success',
                dashboardId: extractedDashboardId,
                code,
                state,
              },
              window.location.origin,
            );

            // Close window after a short delay (so user sees success message)
            setTimeout(() => window.close(), 1200);
          } else {
            window.opener.postMessage(
              {
                type: 'smartthings-auth-error',
                error: 'Failed to complete auth',
              },
              window.location.origin,
            );
          }
        }
      } catch (error) {
        console.error('Error processing callback:', error);
        setIsSuccess(false);
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [location.search]);

  // Always show UI; the hook/process controls success state and window closing.

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px] p-4">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">
              {t('sites.smartThings.title', 'SmartThings Autorisierung')}
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex items-center justify-center mb-4">
            <i className="fas fa-home-alt text-6xl text-blue-500"></i>
          </div>
          {isProcessing ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-blue-500">
                {t('sites.smartThings.processing', 'Wird verarbeitet...')}
              </h2>
              <p className="text-center">
                {t(
                  'sites.smartThings.processingMessage',
                  'Deine SmartThings-Verbindung wird hergestellt...',
                )}
              </p>
            </div>
          ) : isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-green-500">
                {t('sites.smartThings.success', 'Autorisierung erfolgreich')}
              </h2>
              <p className="text-center">
                {t(
                  'sites.smartThings.successMessage',
                  'Dein SmartThings-Konto wurde erfolgreich verbunden.',
                )}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-yellow-500">
                {t('sites.smartThings.error', 'Autorisierung fehlgeschlagen')}
              </h2>
              <p className="text-center">
                {t(
                  'sites.smartThings.errorMessage',
                  'Es gab ein Problem bei der Verbindung mit SmartThings.',
                )}
              </p>
            </>
          )}
        </CardBody>
        <Divider />
        <CardFooter className="justify-center flex gap-2">
          {!isProcessing && (
            <>
              {isSuccess ? (
                <>
                  {!isPopup && (
                    <>
                      <Button
                        variant="bordered"
                        onClick={() => navigate(ROUTE_HOME)}
                      >
                        {t('sites.smartThings.goToHome', 'Zur Startseite')}
                      </Button>
                      {dashboardId && (
                        <Button
                          variant="solid"
                          onClick={() =>
                            navigate(
                              replaceDashboardId(
                                ROUTE_DASHBOARD + ROUTE_DASHBOARD_ID,
                                dashboardId,
                              ),
                            )
                          }
                        >
                          {t('sites.smartThings.goToDashboard', 'Zum Dashboard')}
                        </Button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {!isPopup && (
                    <Button
                      variant="solid"
                      onPress={() =>
                        navigate(
                          dashboardId
                            ? replaceDashboardId(ROUTE_CONFIG_WIDGETS, dashboardId)
                            : ROUTE_HOME,
                        )
                      }
                    >
                      {t('sites.smartThings.retry', 'Erneut versuchen')}
                    </Button>
                  )}
                </>
              )}
              {isPopup && (
                <Button
                  variant="ghost"
                  onPress={() => window.close()}
                >
                  {t('sites.smartThings.close', 'Fenster schließen')}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SmartThingsCallback;
