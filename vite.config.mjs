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
