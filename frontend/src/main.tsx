import ReactDOM from 'react-dom/client';
import 'reflect-metadata';

import './main.css';
import Root from './root';
import { AuthProvider } from '@adapter/ui/contexts/AuthContext';
import { Auth0Provider } from '@auth0/auth0-react';
import { registerDi } from '@common/di';
import { HeroUIProvider } from '@heroui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID_GOOGLE_KALENDER;

registerDi();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain={domain!}
    clientId={clientId!}
    authorizationParams={{
      redirect_uri: `${window.location.origin}/auth0-callback`, // 👈 Callback-Route bleibt korrekt
      audience: audience,
      scope: 'openid profile email offline_access',
    }}
    cacheLocation="localstorage"
    useRefreshTokens={true}
    onRedirectCallback={(appState) => {
      // 👇 Diese Zeile ist entscheidend:
      window.location.replace(appState?.returnTo || '/');
    }}
  >
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <HeroUIProvider>
          <NextThemesProvider attribute="class" defaultTheme="dark">
            <Root />
          </NextThemesProvider>
        </HeroUIProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  </Auth0Provider>,
);
