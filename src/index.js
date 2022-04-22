import { readPackageJson } from "./readPackage.js";
import { checkDependencies } from "./checkDependencies.js";

import appRoot from "app-root-path";
global.__basedir = appRoot.path;


//TODO allow package whitelists

const dependenciesObject = await readPackageJson();

const { peerDependencies, dependencies, devDependencies, repoInfo } =
  dependenciesObject;


const report = await checkDependencies({
  peerDependencies,
  dependencies,
  devDependencies,
});


//todo format this and make it pretty 

console.log(report)