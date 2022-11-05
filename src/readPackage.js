/* eslint-disable node/no-unsupported-features/es-syntax */

import path from "path";
import { readFile, transformDependencyObject } from "./util/sharedUtils.js";
import { BASE_DIR } from "./util/sharedUtils.js";


export const readPackageJson = async () => {
  const packagePath = path.join(BASE_DIR, "package.json");
  const jsonFile = JSON.parse(await readFile({ path: packagePath }));

  return {
    repoInfo: {
      name: jsonFile.name || "",
      version: jsonFile.version || "",
      type: jsonFile.type || "",
    },
    dependencies: transformDependencyObject(jsonFile.dependencies) || [],
    peerDependencies:
      transformDependencyObject(jsonFile.peerDependencies) || [],
    devDependencies: transformDependencyObject(jsonFile.devDependencies) || [],
    config: jsonFile.dependencyCheckConfig,
  };
};

export const readConfigFile = async () => {
  try {
      const configPath = path.join(BASE_DIR, "dependencyCheckConfig.json");
      const config = JSON.parse(await readFile({ path: configPath }));

      return config
  } catch (e) {
    console.error("error reading config file");
    console.log(e);
    process.exit(1);
  }
};
