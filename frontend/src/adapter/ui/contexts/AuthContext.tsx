import Auth0FetchAccessTokenAdapter from '@adapter/auth/Auth0FetchAccessTokenAdapter';
import { FetchAccessTokenOutputPort } from '@application/useCases/app/fetchAccessTokenUseCase/ports/outputs';
import { useAuth0, User } from '@auth0/auth0-react';
import { FETCH_ACCESS_TOKEN_OUTPUT_PORT } from '@common/constants';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { container } from 'tsyringe';

interface IAuthContext {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessToken: () => Promise<string>;
  loginWithRedirect: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const getAccessToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }, [getAccessTokenSilently]);

  const handleLogout = useCallback(async () => {
    auth0Logout({
      logoutParams: { returnTo: import.meta.env.VITE_LOGUT_REDIRECT_URI },
    });
  }, [auth0Logout]);

  const authContextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      getAccessToken,
      loginWithRedirect,
      logout: handleLogout,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      getAccessToken,
      loginWithRedirect,
      handleLogout,
    ],
  );

  useEffect(() => {
    if (isAuthenticated) {
      // Erstellen des Adapters mit der getAccessToken-Funktion
      const tokenAdapter = new Auth0FetchAccessTokenAdapter(getAccessToken);

      // Registrieren des Output-Ports mit der Adapter-Instanz
      container.registerInstance<FetchAccessTokenOutputPort>(
        FETCH_ACCESS_TOKEN_OUTPUT_PORT,
        tokenAdapter,
      );
    }
  }, [isAuthenticated, getAccessToken]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
