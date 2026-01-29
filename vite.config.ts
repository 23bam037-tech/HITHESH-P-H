
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    // This allows the app to find your API key if you set it in a .env file
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || '')
    }
  }
});
