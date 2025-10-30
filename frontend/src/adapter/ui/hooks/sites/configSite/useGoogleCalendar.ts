import { GOOGLE_REPOSITORY_NAME } from '@common/constants';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';
import { GoogleRepository } from '../../../../../application/repositories/googleRepository';

interface UseGoogleCalendarAuthReturn {
  user: { name: string; picture: string } | null;
  calendars: { id: string; summary: string }[];
  login: () => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

export const useGoogleCalendar = (
  dashboardId: string | undefined,
): UseGoogleCalendarAuthReturn => {
  const [user, setUser] = useState<{ name: string; picture: string } | null>(
    null,
  );
  const [calendars, setCalendars] = useState<{ id: string; summary: string }[]>(
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
        .resolve<GoogleRepository>(GOOGLE_REPOSITORY_NAME)
        .getLoginStatus(validDashboardId);
      setIsLoggedIn(isLoggedIn);
      return isLoggedIn;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  }, [dashboardId, handleApiError, validateDashboardId]);

  /**
   * Logs the user in using the Google OAuth flow
   */
  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError(null);
      try {
        if (!dashboardId) {
          return;
        }
        const authCode = codeResponse.code;
        await container
          .resolve<GoogleRepository>(GOOGLE_REPOSITORY_NAME)
          .loginForGoogleCalendar(dashboardId, authCode);

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
    },
    onError: (err) => {
      setError('Login fehlgeschlagen');
      console.error('Login fehlgeschlagen:', err);
    },
  });

  /**
   * Fetches user info from the Google API
   */
  const fetchUserInfo = useCallback(async () => {
    try {
      const validDashboardId = validateDashboardId();
      const userProfile = await container
        .resolve<GoogleRepository>(GOOGLE_REPOSITORY_NAME)
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
   * Fetches user calendars from the Google API
   */
  const fetchUserCalendars = useCallback(async () => {
    try {
      const validDashboardId = validateDashboardId();
      const calendarData = await container
        .resolve<GoogleRepository>(GOOGLE_REPOSITORY_NAME)
        .fetchGoogleUserCalendars(validDashboardId);

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
      googleLogout();
      await container
        .resolve<GoogleRepository>(GOOGLE_REPOSITORY_NAME)
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
