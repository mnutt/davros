import { build } from 'esbuild';

await build({
  entryPoints: ['app.js'],
  outfile: 'output/app.js',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  sourcemap: true,
  minify: false,
  logLevel: 'info',
  define: {
    'global.GENTLY': 'false',
  },
  external: [
    'capnp-es',
    'capnp-es/*',
    'jsDAV',
    'jsDAV/*',
    'sharp',
    'node-ssh',
    'spawn-sync',
    '*.node',
  ],
});
