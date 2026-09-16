import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 3000,

    proxy: {
      '/api/auth': {
        target:
          'https://dev.surveillance.dghs.gov.bd',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(
        __dirname,
        './src',
      ),
    },
  },
});