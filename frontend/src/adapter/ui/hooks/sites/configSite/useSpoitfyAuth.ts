import { SpotifyRepository } from '@application/repositories/spotifyRepository';
import { SPOTIFY_REPOSITORY_NAME } from '@common/constants';
import { useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';

export const useSpotifyAuth = (dashboardId: string | undefined) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const spotifyRepository = container.resolve<SpotifyRepository>(
    SPOTIFY_REPOSITORY_NAME,
  );

  const checkLoginStatus = useCallback(async () => {
    try {
      if (!dashboardId) {
        return;
      }
      setIsLoading(true);
      const repository = container.resolve<SpotifyRepository>(
        SPOTIFY_REPOSITORY_NAME,
      );

      const loggedIn = await repository.getLoginStatus(dashboardId);
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Failed to check login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  const login = useCallback((dashboardId: string) => {
    if (!dashboardId) {
      console.error('Dashboard ID ist erforderlich');
      return;
    }

    setIsLoading(true);

    // Open Spotify OAuth popup
    spotifyRepository.initiateLogin(dashboardId);

    // Listen for messages from popup (like Microsoft Calendar pattern)
    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'spotify-auth-success') {
        window.removeEventListener('message', messageListener);

        try {
          const { code } = event.data;
          await spotifyRepository.handleCallback(code, dashboardId);
          setIsLoggedIn(true);
          await checkLoginStatus(); // Refresh status
        } catch (err) {
          console.error('Fehler beim Abrufen des Tokens vom Server:', err);
          setIsLoggedIn(false);
        } finally {
          setIsLoading(false);
        }
      } else if (event.data.type === 'spotify-auth-error') {
        window.removeEventListener('message', messageListener);
        console.error('Spotify Login fehlgeschlagen');
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };

    window.addEventListener('message', messageListener);

    // Check if popup was closed manually (like Microsoft Calendar)
    // Note: We can't directly access the popup reference from SpotifyAdapter
    // So we'll use a timeout to reset loading state if no message is received
    const timeoutId = setTimeout(() => {
      window.removeEventListener('message', messageListener);
      setIsLoading(false);
    }, 60000); // 1 minute timeout

    // Clean up timeout when message is received
    const originalListener = messageListener;
    const wrappedListener = (event: MessageEvent) => {
      clearTimeout(timeoutId);
      originalListener(event);
    };

    window.removeEventListener('message', messageListener);
    window.addEventListener('message', wrappedListener);
  }, [spotifyRepository, checkLoginStatus]);

  const handleCallback = useCallback(
    async (code: string, dashboardId: string) => {
      setIsLoading(true);
      try {
        await spotifyRepository.handleCallback(code, dashboardId);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Login failed:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      if (!dashboardId) {
        return;
      }
      setIsLoading(true);
      spotifyRepository.logout(dashboardId);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return { isLoggedIn, isLoading, login, handleCallback, logout };
};
