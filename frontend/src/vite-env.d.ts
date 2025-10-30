/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_CLIENT_ID_GOOGLE_KALENDER: string;
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_WEATHER_LONGITUDE: string;
  readonly VITE_WEATHER_LATITUDE: string;
  readonly VITE_KALENDER_INTERVALL_IN_SECONDS: string;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_LOGUT_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
