import { readPackageJson } from "../src/readPackage.js";
import { checkDependencies } from "../src/checkDependencies.js";
import { generateReportFromRawData, writeReport  } from "../src/util/sharedUtils.js";

import appRoot from "app-root-path";
global.__basedir = appRoot.path;

//TODO allow package whitelists

const dependenciesObject = await readPackageJson();

const { peerDependencies, dependencies, devDependencies, repoInfo } =
  dependenciesObject;

const rawData = await checkDependencies({
  peerDependencies,
  dependencies,
  devDependencies,
});

const htmlReport =  generateReportFromRawData(rawData);
await writeReport(htmlReport)



