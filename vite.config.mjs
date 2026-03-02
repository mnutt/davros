import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

const backend = process.env.DAVROS_BACKEND_URL || 'http://localhost:8000';

export default defineConfig({
  css: {
    devSourcemap: true,
  },
  esbuild: {
    keepNames: true,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          // Split third-party modules into per-package chunks for better caching and
          // to avoid a single oversized vendor bundle.
          const path = id.split('node_modules/')[1];
          if (!path) {
            return 'vendor';
          }

          const [scopeOrName, maybeName] = path.split('/');
          if (scopeOrName.startsWith('@') && maybeName) {
            return `vendor-${scopeOrName.slice(1)}-${maybeName}`;
          }

          return `vendor-${scopeOrName}`;
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
      },
      '/dav': {
        target: backend,
        changeOrigin: true,
      },
      '/remote.php': {
        target: backend,
        changeOrigin: true,
      },
      '/status.php': {
        target: backend,
        changeOrigin: true,
      },
      '/ocs': {
        target: backend,
        changeOrigin: true,
      },
      '/changelog': {
        target: backend,
        changeOrigin: true,
      },
      '/ws-files': {
        target: backend,
        ws: true,
      },
    },
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
