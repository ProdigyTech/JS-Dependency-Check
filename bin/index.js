import { readPackageJson } from "../src/readPackage.js";
import { checkDependencies } from "../src/checkDependencies.js";
import {
  generateHTMLReportFromRawData,
  generateJSONReportFromRawData,
  writeReport,
} from "../src/reportGenerator.js";

import { reportTypes } from "../src/enums.js";

export const getReportType = () => {
  const type = args.find((a) => Object.values(reportTypes).includes(a));
  return type || reportTypes.HTML;
};

const args = process.argv.slice(2);


export const runScript = async (type) => {
  const reportType = type || getReportType();
    try {
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
      switch(reportType) {
        case reportTypes.HTML:
          const htmlReport = generateHTMLReportFromRawData(rawData, repoInfo);
          await writeReport(htmlReport, reportTypes.HTML);
          break;
        case reportTypes.JSON:
          const jsonReport = generateJSONReportFromRawData(rawData, repoInfo);
          await writeReport(jsonReport, reportTypes.JSON);
          break;
        case reportTypes.CI:
          break;
        default: 
          const htmlReportDef = generateHTMLReportFromRawData(rawData, repoInfo);
          await writeReport(htmlReportDef, reportTypes.HTML);
          break;
      }
    

      /**
       *  Save the report
       */
    } catch (e) {
      console.log("Something went wrong while running the utility");
      console.error(e);
      process.exit(1);
    }
};

runScript()
