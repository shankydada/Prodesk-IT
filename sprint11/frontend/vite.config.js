import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * In local development the SPA calls `/api/...` (relative) and Vite proxies it
 * to the Express server, which keeps the browser on a single origin.
 * In production the build reads VITE_API_URL (the live Render URL) instead.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Hosts allowed to hit the dev server (sandbox preview + tunnels).
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
});
