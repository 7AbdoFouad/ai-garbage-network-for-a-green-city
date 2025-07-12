// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://greencityapi.runasp.net',
        changeOrigin: true,
        secure: false,
      },
    
    },
  },
});
