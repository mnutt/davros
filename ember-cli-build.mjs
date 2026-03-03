import { createRequire } from 'node:module';
import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';
import { prebuild } from '@embroider/compat';
import BroccoliPlugin from 'broccoli-plugin';

const require = createRequire(import.meta.url);

export default async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');
  const embroiderOptions = {
    staticComponents: true,
    staticHelpers: true,
    splitAtRoutes: [],
  };

  const app = new EmberApp(defaults, {
    babel: {
      plugins: [require.resolve('ember-concurrency/async-arrow-task-transform')],
    },
  });

  if (process.env.EMBROIDER_PREBUILD) {
    return prebuild(app, embroiderOptions);
  }

  class ViteBuild extends BroccoliPlugin {
    build() {
      return buildOnce(this.outputPath, app.env);
    }
  }

  return new ViteBuild([], {});
}
