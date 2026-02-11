import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // API base URL - use Catalyst function in production, local proxy in dev
    const apiBaseUrl = mode === 'production'
      ? '/server/gemini_proxy'  // Catalyst serverless function path
      : 'http://localhost:3001'; // Local dev proxy

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // Build output to 'dist' folder (Catalyst GitHub integration expects this)
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
      plugins: [react(), tailwindcss()],
      define: {
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
        // Keep for local dev fallback only
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
