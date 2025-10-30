import { useAuth } from '@adapter/ui/contexts/AuthContext';
import { replaceDashboardId } from '@common/helpers/objectHelper';
import {
  ROUTE_CONFIG_WIDGETS,
  ROUTE_DASHBOARD,
  ROUTE_DASHBOARD_ID,
  ROUTE_HOME,
} from '@common/routes';
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

export const SmartThingsCallback: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardId, setDashboardId] = useState<string | undefined>(undefined);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Nachricht an das öffnende Fenster senden
    if (window.opener) {
      // Dashboard ID aus URL extrahieren (falls vorhanden)
      const urlParams = new URLSearchParams(location.search);
      const state = urlParams.get('state');
      let extractedDashboardId = undefined;

      if (state) {
        try {
          const decodedState = JSON.parse(atob(state));
          extractedDashboardId = decodedState.dashboardId;
          setDashboardId(extractedDashboardId);
        } catch (error) {
          console.error('Fehler beim Decodieren des State-Parameters:', error);
        }
      }

      // Erfolgsnachricht mit dashboardId senden, damit das Hauptfenster weiß,
      // für welches Dashboard die Geräte aktualisiert werden müssen
      window.opener.postMessage(
        {
          type: 'smartthings-auth-success',
          dashboardId: extractedDashboardId,
        },
        window.location.origin,
      );

      setIsSuccess(true);

      // Fenster nach kurzer Verzögerung schließen (damit Nutzer die Erfolgsmeldung sieht)
      setTimeout(() => window.close(), 2000);
    }
  }, [isAuthenticated, location.search]);

  if (!isAuthenticated) {
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
          {isSuccess ? (
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
          {isSuccess ? (
            <>
              <Button
                color="secondary"
                variant="shadow"
                onPress={() => navigate(ROUTE_HOME)}
              >
                {t('sites.smartThings.goToHome', 'Zur Startseite')}
              </Button>
              {dashboardId && (
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
                  {t('sites.smartThings.goToDashboard', 'Zum Dashboard')}
                </Button>
              )}
            </>
          ) : (
            <Button
              color="primary"
              variant="shadow"
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
          {window.opener && (
            <Button
              color="default"
              variant="light"
              onPress={() => window.close()}
            >
              {t('sites.smartThings.close', 'Fenster schließen')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SmartThingsCallback;
