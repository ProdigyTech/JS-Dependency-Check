import { readPackageJson } from "../src/readPackage.js";
import { checkDependencies } from "../src/checkDependencies.js";
import {
  generateHTMLReportFromRawData,
  generateJSONReportFromRawData,
  writeReport,
} from "../src/reportGenerator.js";

import { reportTypes } from "../src/enums.js";

import appRoot from "app-root-path";
global.__basedir = appRoot.path;

export const getReportType = () => {
  const type = args.find((a) => Object.values(reportTypes).includes(a));
  return type || reportTypes.HTML;
};


const args = process.argv.slice(2);
const reportType = getReportType();

if (process.env.NODE_ENV !== "ci") {
  try {
    /**
     *  TODO: Possibly check resolutions (yarn) field?
     */

    /**
     *  Read the package.json, pull dependency information
     */
    const dependenciesObject = await readPackageJson();

    console.log(dependenciesObject)

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
    if (!reportType || reportType == reportTypes.HTML) {
      const htmlReport = generateHTMLReportFromRawData(rawData, repoInfo);
      await writeReport(htmlReport, reportTypes.HTML);
    } else {
      const jsonReport = generateJSONReportFromRawData(rawData, repoInfo);
      await writeReport(jsonReport, reportTypes.JSON);
    }
      console.log(a)
    /**
     *  Save the report
     */
  } catch (e) {
    console.log("Something went wrong while running the utility");
    console.error(e);
    console.log(e);
    process.exit(1);
  }
}
