import { replaceDashboardId } from '@common/helpers/objectHelper';
import { ROUTE_CONFIG_WIDGETS, ROUTE_DASHBOARD, ROUTE_DASHBOARD_ID, ROUTE_HOME } from '@common/routes';
import { Button, Card, CardBody, CardFooter, CardHeader, Divider } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const MicrosoftCalendarCallback: React.FC = () => {
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
                            type: 'microsoft-calendar-auth-success',
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
                    window.opener.postMessage(
                        {
                            type: 'microsoft-calendar-auth-error',
                            error: 'Failed to complete Microsoft Calendar auth',
                        },
                        window.location.origin,
                    );
                    setIsSuccess(false);
                }
            } catch (error) {
                console.error('Error processing Microsoft Calendar callback:', error);
                setIsSuccess(false);
            } finally {
                setIsProcessing(false);
            }
        };

        processAuth();
    }, [location.search]);

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-[400px] p-4">
                <CardHeader className="flex gap-3">
                    <div className="flex flex-col">
                        <p className="text-md">
                            {t('sites.microsoftCalendar.title', 'Microsoft Calendar Autorisierung')}
                        </p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex items-center justify-center mb-4">
                        <i className="fas fa-calendar-alt text-6xl text-blue-500"></i>
                    </div>
                    {isProcessing ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2 text-blue-500">
                                {t('sites.microsoftCalendar.processing', 'Wird verarbeitet...')}
                            </h2>
                            <p className="text-center">
                                {t(
                                    'sites.microsoftCalendar.processingMessage',
                                    'Deine Microsoft Calendar-Verbindung wird hergestellt...',
                                )}
                            </p>
                        </div>
                    ) : isSuccess ? (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-2 text-green-500">
                                {t('sites.microsoftCalendar.success', 'Autorisierung erfolgreich')}
                            </h2>
                            <p className="text-center">
                                {t(
                                    'sites.microsoftCalendar.successMessage',
                                    'Dein Microsoft Calendar wurde erfolgreich verbunden.',
                                )}
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-2 text-yellow-500">
                                {t('sites.microsoftCalendar.error', 'Autorisierung fehlgeschlagen')}
                            </h2>
                            <p className="text-center">
                                {t(
                                    'sites.microsoftCalendar.errorMessage',
                                    'Es gab ein Problem bei der Verbindung mit Microsoft Calendar.',
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
                                                {t('sites.microsoftCalendar.goToHome', 'Zur Startseite')}
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
                                                    {t('sites.microsoftCalendar.goToDashboard', 'Zum Dashboard')}
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
                                            {t('sites.microsoftCalendar.retry', 'Erneut versuchen')}
                                        </Button>
                                    )}
                                </>
                            )}
                            {isPopup && (
                                <Button
                                    variant="ghost"
                                    onPress={() => window.close()}
                                >
                                    {t('sites.microsoftCalendar.close', 'Fenster schließen')}
                                </Button>
                            )}
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default MicrosoftCalendarCallback;