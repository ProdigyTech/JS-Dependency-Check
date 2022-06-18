import { readPackageJson } from "../src/readPackage.js";
import { checkDependencies } from "../src/checkDependencies.js";
import {
  generateHTMLReportFromRawData,
  generateJSONReportFromRawData,
  generateCiReportFromRawData,
  writeReport,
} from "../src/reportGenerator.js";

import { reportTypes } from "../src/enums.js";

export const getReportType = () => {
  const typeArg = args.find((a) => a.includes("--report-type="));
  if (typeArg) {
    const type = typeArg.split("=");
    return (
      Object.keys(reportTypes).find((a) => a == type[1]) || reportTypes.HTML
    );
  } else {
    return reportTypes.HTML;
  }
};

const args = process.argv.slice(2);

export const runScript = async (type) => {
  const reportType = type || getReportType();
  try {
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
    console.log(reportType, "report type");
    /**
     *  Generate a report from the registry lookup
     */
    switch (reportType) {
      case reportTypes.HTML:
        const htmlReport = generateHTMLReportFromRawData(rawData, repoInfo);
        await writeReport(htmlReport, reportTypes.HTML);
        break;
      case reportTypes.JSON:
        const jsonReport = generateJSONReportFromRawData(rawData, repoInfo);
        await writeReport(jsonReport, reportTypes.JSON);
        break;
      case reportTypes.CI:
        const ciReport = generateCiReportFromRawData(rawData, repoInfo);
        const { exitCode, report } = ciReport;
        console.log(report);
        process.exit(exitCode);
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

runScript();
