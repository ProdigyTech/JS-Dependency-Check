import { readPackageJson } from "./readPackage.js";
import { checkDependencies } from "./checkDependencies.js";
import { generateReportFromRawData } from "./util/sharedUtils.js";

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

const report = generateReportFromRawData(rawData);
