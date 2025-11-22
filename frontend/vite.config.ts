/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src-tauri/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
        '**/test-utils.tsx',
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          // PDF chunk (heavy dependencies)
          'pdf-vendor': ['react-pdf', 'pdfjs-dist'],
          // UI libraries
          'ui-vendor': ['lucide-react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
    // Increase chunk size warning limit since we're splitting properly
    chunkSizeWarningLimit: 1000,
  },
})
