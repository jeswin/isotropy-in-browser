/* @flow */
import type { KoaType } from "koa-in-browser";
import mount from "isotropy-mount";
import reactPlugin from "isotropy-plugin-react";

type Plugin = {
  getDefaults: (app: Object) => Object,
  setup: (appSettings: Object, instance: KoaType, options: PluginOptions) => Promise
};

type Plugins = {
  [key: string]: Plugin
}

type PluginOptions = {
  dir: string,
  port: number,
  graphiql?: boolean
}

type IsotropyOptionsType = {
  dir: string,
  port: number,
  plugins: Plugins
};

const isotropy = async function(apps: Object, options: IsotropyOptionsType) : Promise<IsotropyResultType> {
  const dir = options.dir || __dirname;
  const port = options.port || 8080;
  const plugins: Plugins = options.plugins || {};

  plugins["react"] = reactPlugin;

  const pluginOptions = {
    dir,
    port
  };

  for (let app of apps) {
    const plugin: Plugin = plugins[app.type];
    const appSettings = plugin.getDefaults(app);
    if (appSettings.path === "/") {
      await plugin.setup(appSettings, defaultInstance, pluginOptions);
    } else {
      await plugin.setup(appSettings, newInstance, pluginOptions);
      defaultInstance.use(mount(appSettings.path, newInstance));
    }
  }

  // If we were passed in defaultInstance via options, listen() must be done at callsite.
  if (!options.defaultInstance) {
    defaultInstance.listen(port);
  }

  return {
    koa: defaultInstance
  };
};

export default isotropy;
