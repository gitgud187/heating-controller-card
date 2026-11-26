import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    // A single ES module: the Marketplace installs one file and browsers cache by URL.
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'heating-controller-card.js',
    },
    // The bundle is committed and CI fails when it differs from the source, so keep the
    // output readable: a diff then shows what actually changed.
    minify: false,
    sourcemap: false,
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
});
