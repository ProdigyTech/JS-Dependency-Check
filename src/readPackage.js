/* eslint-disable node/no-unsupported-features/es-syntax */

import path from "path";
import { readFile, transformDependencyObject } from './util/sharedUtils.js'
import { BASE_DIR } from "./util/sharedUtils.js";

export const readPackageJson = async () => {

    const packagePath = path.join(BASE_DIR, "package.json");
    const jsonFile = JSON.parse(await readFile({path: packagePath}))

    return {
      repoInfo: {
        name: jsonFile.name || "",
        version: jsonFile.version || "",
      },
      dependencies: transformDependencyObject(jsonFile.dependencies) || [],
      peerDependencies:
        transformDependencyObject(jsonFile.peerDependencies) || [],
      devDependencies:
        transformDependencyObject(jsonFile.devDependencies) || [],
    };
}

export const readConfigFile = async () => {
  try{
    const jsPath = path.join(BASE_DIR, "dependencyCheckConfig.js");
    const jsFile = await import(`${jsPath}`);
    return jsFile.default
  } catch(e){
    console.error('error reading config file')
    console.log(e)
    process.exit(1)
  }
}
