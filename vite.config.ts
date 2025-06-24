import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this base path for GitHub Pages deployment
  base: '/color-grid-generator/', // <--- THIS IS THE MISSING LINE
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});