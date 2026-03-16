/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import swc from 'unplugin-swc';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/apps/api',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [swc.vite({ module: { type: 'es6' } }) as any, nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    reporters: ['default'],
    setupFiles: ['src/test-setup.ts'],
  },
  define: {
    global: 'globalThis',
  },
});
