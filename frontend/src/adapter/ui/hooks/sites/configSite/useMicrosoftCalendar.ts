import { MICROSOFT_REPOSITORY_NAME } from '@common/constants';
import { useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';
import { MicrosoftRepository } from '../../../../../application/repositories/microsoftRepository';

interface UseMicrosoftCalendarAuthReturn {
    user: { name: string; picture?: string } | null;
    calendars: { id: string; name: string }[];
    login: () => void;
    logout: () => void;
    loading: boolean;
    error: string | null;
    isLoggedIn: boolean;
}

export const useMicrosoftCalendar = (
    dashboardId: string | undefined,
): UseMicrosoftCalendarAuthReturn => {
    const [user, setUser] = useState<{ name: string; picture?: string } | null>(
        null,
    );
    const [calendars, setCalendars] = useState<{ id: string; name: string }[]>(
        [],
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const handleApiError = useCallback((error: any) => {
        if (error?.response?.status === 401) {
            setIsLoggedIn(false);
            setUser(null);
            setCalendars([]);
        } else {
            console.error('API Error:', error);
            setError('Ein Fehler ist aufgetreten');
        }
    }, []);

    /**
     * Validates the dashboard ID and throws an error if it is missing
     */
    const validateDashboardId = useCallback(() => {
        if (!dashboardId) {
            throw new Error('Dashboard ID ist erforderlich');
        }
        return dashboardId;
    }, [dashboardId]);

    /**
     * Checks the login status of the user
     */
    const checkLoginStatus = useCallback(async () => {
        try {
            const validDashboardId = validateDashboardId();
            const isLoggedIn = await container
                .resolve<MicrosoftRepository>(MICROSOFT_REPOSITORY_NAME)
                .getLoginStatus(validDashboardId);
            setIsLoggedIn(isLoggedIn);
            return isLoggedIn;
        } catch (err) {
            handleApiError(err);
            return false;
        }
    }, [dashboardId, handleApiError, validateDashboardId]);

    /**
     * Opens Microsoft OAuth popup for login
     */
    const login = useCallback(() => {
        if (!dashboardId) {
            setError('Dashboard ID ist erforderlich');
            return;
        }

        setLoading(true);
        setError(null);

        // Microsoft OAuth URL construction
        const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
        const redirectUri = `${window.location.origin}/microsoft/callback`;
        const state = btoa(JSON.stringify({ dashboardId }));

        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${clientId}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent('https://graph.microsoft.com/Calendars.Read https://graph.microsoft.com/User.Read')}&` +
            `state=${encodeURIComponent(state)}`;

        // Open popup window
        const popup = window.open(
            authUrl,
            'microsoftCalendarAuth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for messages from popup
        const messageListener = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            if (event.data.type === 'microsoft-calendar-auth-success') {
                window.removeEventListener('message', messageListener);

                try {
                    const { code, state } = event.data;
                    await container
                        .resolve<MicrosoftRepository>(MICROSOFT_REPOSITORY_NAME)
                        .loginForMicrosoftCalendar(dashboardId, code, state);

                    const isLoggedIn = await checkLoginStatus();
                    if (isLoggedIn) {
                        await loadUserAndCalendars();
                    }
                } catch (err) {
                    setError('Fehler beim Abrufen des Tokens vom Server');
                    console.error('Fehler beim Abrufen des Tokens vom Server:', err);
                } finally {
                    setLoading(false);
                }
            } else if (event.data.type === 'microsoft-calendar-auth-error') {
                window.removeEventListener('message', messageListener);
                setError('Microsoft Login fehlgeschlagen');
                setLoading(false);
            }
        };

        window.addEventListener('message', messageListener);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageListener);
                setLoading(false);
            }
        }, 1000);
    }, [dashboardId, checkLoginStatus]);

    /**
     * Fetches user info from the Microsoft API
     */
    const fetchUserInfo = useCallback(async () => {
        try {
            const validDashboardId = validateDashboardId();
            const userProfile = await container
                .resolve<MicrosoftRepository>(MICROSOFT_REPOSITORY_NAME)
                .fetchUserInfo(validDashboardId);
            setUser({
                name: userProfile.name,
                picture: userProfile.picture,
            });
        } catch (err: any) {
            handleApiError(err);
        }
    }, [dashboardId, handleApiError, validateDashboardId]);

    /**
     * Fetches user calendars from the Microsoft API
     */
    const fetchUserCalendars = useCallback(async () => {
        try {
            const validDashboardId = validateDashboardId();
            const calendarData = await container
                .resolve<MicrosoftRepository>(MICROSOFT_REPOSITORY_NAME)
                .fetchMicrosoftUserCalendars(validDashboardId);

            setCalendars(calendarData.items);
        } catch (err: any) {
            handleApiError(err);
        }
    }, [dashboardId, handleApiError, validateDashboardId]);

    /**
     * Logs the user out
     */
    const logout = useCallback(async () => {
        try {
            const validDashboardId = validateDashboardId();
            await container
                .resolve<MicrosoftRepository>(MICROSOFT_REPOSITORY_NAME)
                .logout(validDashboardId);
            setUser(null);
            setCalendars([]);
            setIsLoggedIn(false);
        } catch (err) {
            handleApiError(err);
        }
    }, [dashboardId, handleApiError, validateDashboardId]);

    /**
     * Loads user info and calendars
     */
    const loadUserAndCalendars = useCallback(async () => {
        setLoading(true);
        try {
            await fetchUserInfo();
            await fetchUserCalendars();
        } catch (err) {
            console.error('Error loading user and calendars:', err);
            setError('Fehler beim Laden der Benutzer- und Kalenderdaten');
        } finally {
            setLoading(false);
        }
    }, [fetchUserInfo, fetchUserCalendars]);

    useEffect(() => {
        if (!dashboardId) {
            return;
        }

        const initializeAuth = async () => {
            setLoading(true);
            try {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                    await loadUserAndCalendars();
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [dashboardId, checkLoginStatus, loadUserAndCalendars]);

    return {
        user,
        calendars,
        login,
        logout,
        loading,
        error,
        isLoggedIn,
    };
};