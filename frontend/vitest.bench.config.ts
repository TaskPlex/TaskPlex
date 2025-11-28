/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest configuration for benchmark tests
 * Run with: npm run test:bench
 */
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/mocks': path.resolve(__dirname, './src/mocks'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    
    // Only run benchmark tests
    include: ['src/**/*.bench.{ts,tsx}'],
    
    // Benchmark configuration
    benchmark: {
      include: ['src/**/*.bench.{ts,tsx}'],
    },
    
    // Reporter for benchmark
    reporters: ['verbose'],
  },
});

