import { SmartThingsRepository } from '../../../../application/repositories/smartThingsRepository';
import { SMARTTHINGS_REPOSITORY_NAME } from '@common/constants';
import { IoTDevice, IoTProvider } from '../../../../domain/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { container } from 'tsyringe';
interface UseSmartThingsReturn {
  user: { name: string; picture?: string } | null;
  devices: IoTDevice[];
  login: () => void;
  logout: () => void;
  initialLoading: boolean; // Geändert: Für initiale Ladeschritte
  deviceLoading: Record<string, boolean>; // Geändert: Für gerätespezifische Aktionen
  commandErrors: Record<string, string>;
  error: string | null;
  isLoggedIn: boolean;
  executeCommand: (deviceId: string, command: any) => Promise<void>;
  getDeviceStatus: (deviceId: string) => Promise<any>;
}

export const useSmartThings = (
  dashboardId: string | undefined,
): UseSmartThingsReturn => {
  const [user, setUser] = useState<{ name: string; picture?: string } | null>(
    null,
  );


  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true); // Geändert: Für Login und initiale Datenladung
  const [deviceLoading, setDeviceLoading] = useState<Record<string, boolean>>(
    {},
  ); // Geändert: Für gerätespezifische Aktionen
  const [commandErrors, setCommandErrors] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      // Sicherstellen, dass Nachricht vom eigenen Ursprung kommt
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'smartthings-auth-success') {
        const { code, state } = event.data;
        console.log('Received SmartThings auth:', code, state);

        try {
          setInitialLoading(true);

          // Backend aufrufen, um Code + State zu tauschen
          const smartThingsRepository = container.resolve<SmartThingsRepository>(
            SMARTTHINGS_REPOSITORY_NAME,
          );
          await smartThingsRepository.completeAuth(code, state);

          // Login-Status checken und Geräte laden
          const loggedIn = await checkLoginStatus();
          if (loggedIn) {
            await loadUserAndDevices();
          }
        } catch (err) {
          console.error('Fehler beim Token-Austausch:', err);
          setError('Login fehlgeschlagen beim Token-Austausch');
        } finally {
          setInitialLoading(false);
        }
      } else if (event.data?.type === 'smartthings-auth-error') {
        setError('Login fehlgeschlagen: ' + (event.data.error || 'Unbekannter Fehler'));
        setInitialLoading(false);
      }
    };

    window.addEventListener('message', handleAuthMessage);

    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  // Debounce-Timer für UI-Updates
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleApiError = useCallback((error: any) => {
    if (error?.response?.status === 401) {
      setIsLoggedIn(false);
      setUser(null);
      setDevices([]);
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
        .resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME)
        .getLoginStatus(validDashboardId);
      setIsLoggedIn(isLoggedIn);
      return isLoggedIn;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  }, [dashboardId, handleApiError, validateDashboardId]);

  /**
   * Fetches user devices from the SmartThings API
   */
  const fetchDevices = useCallback(async () => {
    setInitialLoading(true);

    try {
      const validDashboardId = validateDashboardId();
      const deviceData = await container
        .resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME)
        .getDevices(validDashboardId);

      // Konvertiere das Format und setze provider und selected
      const formattedDevices = deviceData.map((device) => ({
        ...device,
        provider: 'smartthings' as IoTProvider,
        selected: false,
      }));

      setDevices(formattedDevices);

      // Erstelle einen "virtuellen" Benutzer basierend auf den Geräten
      if (formattedDevices.length > 0 && !user) {
        setUser({
          name: 'SmartThings Benutzer',
          // picture wird optional vom Backend gesetzt, falls vorhanden
        });
      }
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setInitialLoading(false);
    }
  }, [dashboardId, handleApiError, validateDashboardId, user]);

  /**
   * Executes a command on a device
   */
  const executeCommand = useCallback(
    async (deviceId: string, command: any) => {
      setDeviceLoading((prev) => ({
        ...prev,
        [deviceId]: true,
      }));

      // Command-Fehler vor der Ausführung zurücksetzen
      setCommandErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[deviceId];
        return newErrors;
      });

      try {
        const validDashboardId = validateDashboardId();
        await container
          .resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME)
          .executeDeviceCommand(validDashboardId, deviceId, command);
      } catch (err) {
        console.error('Error executing command:', err);

        // Gerätespezifischen Fehler für 1 Sekunde setzen
        setCommandErrors((prev) => ({
          ...prev,
          [deviceId]: 'Fehler bei Befehl',
        }));

        // Fehler nach 1 Sekunde zurücksetzen
        setTimeout(() => {
          setCommandErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[deviceId];
            return newErrors;
          });
        }, 1000);
      } finally {
        setDeviceLoading((prev) => ({
          ...prev,
          [deviceId]: false,
        }));
      }
    },
    [validateDashboardId],
  );

  /**
   * Gets the status of a device
   */
  const getDeviceStatus = useCallback(
    async (deviceId: string) => {
      try {
        setDeviceLoading((prev) => ({
          ...prev,
          [deviceId]: true,
        }));
        const validDashboardId = validateDashboardId();
        return await container
          .resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME)
          .getDeviceStatus(validDashboardId, deviceId);
      } catch (err) {
        console.error('Error getting device status:', err);
        handleApiError(err);
        return null;
      } finally {
        setDeviceLoading((prev) => ({
          ...prev,
          [deviceId]: false,
        }));
      }
    },
    [validateDashboardId, handleApiError],
  );

  /**
   * Logs the user out
   */
  const logout = useCallback(async () => {
    setInitialLoading(true);

    try {
      const validDashboardId = validateDashboardId();
      await container
        .resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME)
        .logout(validDashboardId);
      setUser(null);
      setDevices([]);
      setIsLoggedIn(false);
    } catch (err) {
      handleApiError(err);
    } finally {
      setInitialLoading(false);
    }
  }, [dashboardId, handleApiError, validateDashboardId]);

  /**
   * Loads user devices
   */
  const loadUserAndDevices = useCallback(async () => {
    setInitialLoading(true);

    try {
      await fetchDevices();
    } catch (err) {
      console.error('Error loading devices:', err);
      setError('Fehler beim Laden der Gerätedaten');
    } finally {
      setInitialLoading(false);
    }
  }, [fetchDevices]);

  const login = useCallback(async () => {
    setInitialLoading(true);
    setError(null);

    try {
      const validDashboardId = validateDashboardId();
      const loginUrl = await container
        .resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME)
        .getLoginUrl(validDashboardId);

      // Öffne ein Popup-Fenster für den OAuth-Flow
      window.open(loginUrl, 'smartthings-auth', 'width=600,height=700');
    } catch (err) {
      setError('Fehler beim Login');
      console.error('Fehler beim Login:', err);
      setInitialLoading(false);
    }
  }, [validateDashboardId]);

  // Globaler Event-Listener für Nachrichten vom Auth-Fenster
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      // Überprüfe, ob die Nachricht vom erwarteten Ursprung kommt
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'smartthings-auth-success') {
        const { code, state } = event.data as { code?: string; state?: string };
        console.log('Received auth success (main window):', { code, state });

        if (!code || !state) {
          console.warn('SmartThings auth message missing code or state');
          setError('Login fehlgeschlagen: Ungültige Rückmeldedaten');
          setInitialLoading(false);
          return;
        }

        try {
          // Reiche Code/State an Backend weiter (Token wird im Adapter angehängt)
          await container
            .resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME)
            .completeAuth(code, state);

          // Warte kurz, um sicherzustellen, dass Backend-Verarbeitung abgeschlossen ist
          await new Promise((resolve) => setTimeout(resolve, 400));

          // Login-Status aktualisieren und Geräte laden
          const isLoggedIn = await checkLoginStatus();
          if (isLoggedIn) {
            await loadUserAndDevices();
          }
        } catch (err) {
          console.error('Fehler beim Token-Austausch:', err);
          setError('Login fehlgeschlagen beim Token-Austausch');
        } finally {
          setInitialLoading(false);
        }
      } else if (event.data?.type === 'smartthings-auth-error') {
        setError(
          'Login fehlgeschlagen: ' + (event.data.error || 'Unbekannter Fehler'),
        );
        setInitialLoading(false);
      }
    };

    // Event-Listener registrieren
    window.addEventListener('message', handleAuthMessage);

    // Event-Listener entfernen, wenn die Komponente unmontiert wird
    return () => {
      window.removeEventListener('message', handleAuthMessage);

      // Timer aufräumen
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [checkLoginStatus, loadUserAndDevices]);

  useEffect(() => {
    if (!dashboardId) {
      return;
    }

    const initializeAuth = async () => {
      setInitialLoading(true);

      try {
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
          await loadUserAndDevices();
        } else {
          setInitialLoading(false);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setInitialLoading(false);
      }
    };

    initializeAuth();
  }, [dashboardId, checkLoginStatus, loadUserAndDevices]);

  return {
    user,
    devices,
    login,
    logout,
    initialLoading, // Geändert: Umbenennung von loading zu initialLoading
    error,
    isLoggedIn,
    executeCommand,
    deviceLoading, // Geändert: Umbenennung von executeCommandLoading zu deviceLoading
    commandErrors,
    getDeviceStatus,
  };
};
