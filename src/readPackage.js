
import { readFile, transformDependencyObject } from './util/sharedUtils.js'
import path from "path";

export const readPackageJson = async () => {

    const packagePath = path.join(__basedir, "package.json");
    const jsonFile = JSON.parse(await readFile({path: packagePath}))

    return {
      repoInfo: {
        name: jsonFile.name || "",
        version: jsonFile.version || "",
      },
      dependencies: transformDependencyObject(jsonFile.dependencies) || [],
      peerDependencies:
        transformDependencyObject(jsonFile.peerDependencies) || [],
      devDependencies: transformDependencyObject(jsonFile.devDependencies) || [],
    };
}
