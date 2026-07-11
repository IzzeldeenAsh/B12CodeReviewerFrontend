import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // Route-level code splitting is driven by React.lazy; keep vendor chunks
    // separated so the app shell stays small on first load.
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          msal: ['@azure/msal-browser', '@azure/msal-react'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Only the frontend's own tests — never the backend spec files or e2e.
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**', 'B12CodeReviewerBackend/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/mocks/**',
      ],
    },
  },
});
