import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import dotenv from 'dotenv';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: ['.replit.dev', '.replit.app', '.repl.co'],
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: ['.replit.dev', '.replit.app', '.repl.co'],
  },
  build: {
    chunkSizeWarningLimit: 1000, // Setzt das Limit auf 1 MB (default: 500 KB)
    outDir: path.resolve(__dirname, '../backend/public'),
    emptyOutDir: true,
  },
  define: {
    global: {},
  },
  plugins: [
    react(),

    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Setze das Limit auf 5 MB
      },
      registerType: 'autoUpdate', // Service Worker wird automatisch registriert
      manifest: {
        name: 'Screen Board',
        short_name: 'Screen Board',
        description: 'Your Day at a Glance',
        theme_color: '#964ED8', // Die Farbe der App-Leiste
        background_color: '#ffffff', // Hintergrundfarbe für das Splashscreen
        display: 'fullscreen', // App wird als eigenständige Anwendung angezeigt
        icons: [
          {
            src: '/public/images/icons/appIcon-light.png', // App-Icon für helle Themes
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/public/images/icons/appIcon-light.png', // App-Icon für dunkle Themes
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@components': '/src/adapter/ui/components',
      '@sites': '/src/adapter/ui/sites',
      '@assets': '/src/assets',
      '@config': '/src/config',
      '@utils': '/src/utils', // Beispiel für einen zusätzlichen Alias, falls benötigt
      '@hooks': '/src/adapter/ui/hooks',
      '@common': '/src/common',
      '@adapter': '/src/adapter',
      '@shared': '/src/shared',
      '@i18n': '/src/adapter/ui/i18n',
      '@application': '/src/application',
      '@domain': '/src/domain',
      // Füge hier weitere Aliase hinzu, falls nötig
    },
  },
});


// .env aus Projekt-Root laden
dotenv.config({ path: path.resolve(__dirname, '../.env') });