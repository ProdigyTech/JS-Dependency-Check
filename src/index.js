import { readPackageJson } from "./readPackage.js";
import appRoot from "app-root-path";

global.__basedir = appRoot.path;





const dependenciesObject = await readPackageJson();


console.log(dependenciesObject)