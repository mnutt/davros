import { createRequire } from 'node:module';
import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';
import { compatBuild } from '@embroider/compat';

const require = createRequire(import.meta.url);

export default async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');
  const isProd = process.env.EMBER_ENV === 'production';

  const app = new EmberApp(defaults, {
    babel: {
      plugins: [require.resolve('ember-concurrency/async-arrow-task-transform')],
    },
    postcssOptions: {
      compile: {
        plugins: [
          {
            module: require('postcss-import'),
            options: {
              path: ['node_modules'],
            },
          },
          require('tailwindcss')('./config/tailwind.js'),
        ],
      },
    },
  });

  return compatBuild(app, buildOnce, {
    staticComponents: isProd,
    staticHelpers: isProd,
    splitAtRoutes: [],
  });
}
