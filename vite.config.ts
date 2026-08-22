import { defineConfig } from 'vite';

// Set PAGES_BASE=/repository-name/ in the Actions workflow or local shell.
export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
