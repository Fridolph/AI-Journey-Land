import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@ai-journey-land/shared': resolve(__dirname, '../../packages/shared/src'),
      '@ai-journey-land/ai-core': resolve(__dirname, '../../packages/ai-core/src'),
      '@ai-journey-land/demo-registry': resolve(__dirname, '../../packages/demo-registry/src'),
    },
  },
})
