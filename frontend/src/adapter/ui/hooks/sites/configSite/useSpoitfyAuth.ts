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
    spotifyRepository.initiateLogin(dashboardId);
  }, []);

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
