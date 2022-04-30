import { promises as fs } from "fs";

import appRoot from "app-root-path";

export const readFile = async ({ path }) => {
  try {
    const fileData = fs.readFile(path);

    return fileData;
  } catch (e) {
    console.error(`Error reading file ${path}`);
    console.error(e);
    process.exit(1);
  }
};

/**
 *
 * @param {*} dep
 * @returns [{
 * package: string,
 * version: string,
 * }]
 *  Transforms the package.json key value pair package/version for easier parsing
 */
export const transformDependencyObject = (dep = {}) => Object.keys(dep).map((key) => ({ package: key, version: dep[key] }));


export const BASE_DIR = appRoot.path