import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// JARVIS dev server is supervised on port 3000 behind the Emergent https proxy
// by default. Honors PORT when set (e.g. by local preview tooling assigning a
// free port) so it doesn't collide with another instance on 3000.
const PORT = Number(process.env.PORT) || 3000;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: PORT,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
  },
  preview: {
    host: true,
    port: PORT,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['framer-motion'],
          radix: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
  },
});
