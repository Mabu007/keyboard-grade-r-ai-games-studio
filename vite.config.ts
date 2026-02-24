import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Updates in background automatically
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'], // Extra files to cache
      manifest: {
        name: 'Grade-R Games Studio',
        short_name: 'Grade-R',
        description: 'School Games App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /(.*)/,           // Cache everything
            handler: 'CacheFirst',        // Serve cached version first
            options: {
              cacheName: 'offline-cache',
              expiration: {
                maxEntries: 2000,        // Keep up to 2000 items
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // Listen on all addresses for phone access
    port: 5173,
  },
});