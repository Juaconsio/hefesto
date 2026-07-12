import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests run in a node environment and never touch the database: domain tests
// are pure, and service tests mock the repository layer. This keeps `pnpm test`
// fast and CI-friendly (no Postgres needed).
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
