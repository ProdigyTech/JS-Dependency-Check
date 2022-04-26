import { readPackageJson } from "../src/readPackage.js";
import { checkDependencies } from "../src/checkDependencies.js";
import {
  generateReportFromRawData,
  writeReport,
} from "../src/util/sharedUtils.js";

import appRoot from "app-root-path";

try {
global.__basedir = appRoot.path;

/**
 *  TODO: Possibly check resolutions (yarn) field?
 */

/**
 *  Read the package.json, pull dependency information
 */
const dependenciesObject = await readPackageJson();

const { peerDependencies, dependencies, devDependencies, repoInfo } =
  dependenciesObject;

/**
 *  Check the set of dependencies through the npm registry lookup
 */
const rawData = await checkDependencies({
  peerDependencies,
  dependencies,
  devDependencies,
});



/**
 *  Generate a report from the registry lookup
 */
const htmlReport = generateReportFromRawData(rawData, repoInfo);

/**
 *  Save the report 
 */
await writeReport(htmlReport);
}catch(e) {
  console.log("Something went wrong while running the utility")
  console.error(e)
  process.exit(1)
}
