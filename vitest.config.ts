import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Minimal config: resolve the "@/*" path alias (matches tsconfig) so tests can
// import modules that use it. Existing tests use relative imports and are
// unaffected; this only ADDS alias resolution.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
