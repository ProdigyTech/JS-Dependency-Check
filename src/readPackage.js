
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
      config: jsonFile.JSDependencyCheck || {}
    };
}
