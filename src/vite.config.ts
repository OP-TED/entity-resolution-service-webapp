import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './components'),
      '@api': path.resolve(__dirname, './api'),
      '@utils': path.resolve(__dirname, './utils'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@styles': path.resolve(__dirname, './styles'),
      '@types': path.resolve(__dirname, './types'),
      '@context': path.resolve(__dirname, './context'),
      '@router': path.resolve(__dirname, './router'),
      '@pages': path.resolve(__dirname, './pages')
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['./test/**/*.test.ts', './test/**/*.test.tsx'],
    exclude: ['./test/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['**/*.{ts,tsx}'],
      exclude: [
        'api/**',
        'main.tsx',
        'router/**',
        'App.tsx',
        'styles/theme.ts',
        'types/**',
        'vite.config.ts',
        'openapi-ts.config.ts',
        'test/e2e/**'
      ]
    }
  }
})
