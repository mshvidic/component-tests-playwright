import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The browser calls /api/*, and the dev server forwards it to Restful-Booker.
// This avoids CORS problems and keeps the API URL out of the components.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.API_TARGET ?? 'https://restful-booker.herokuapp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
