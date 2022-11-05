import { readPackageJson, readConfigFile } from "../src/readPackage.js";
import { checkDependencies } from "../src/checkDependencies.js";
import {
  generateHTMLReportFromRawData,
  generateJSONReportFromRawData,
  generateCiReportFromRawData,
  writeReport,
} from "../src/reportGenerator.js";

import { verifyConfig } from "../src/util/configVerify.js";

import { reportTypes } from "../src/enums.js";

let reportTypeCliArg = false;

export const getReportType = (config) => {
  const typeArg = args.find((a) => a.includes("--report-type="));
  if (typeArg) {
    const type = typeArg.split("=");
    reportTypeCliArg = true;

    const r = Object.keys(reportTypes).find((a) => a == type[1]);

    if (r) {
      return r;
    } else {
      console.log(
        `You've supplied an invalid report type, Valid types are CI, JSON, HTML... You supplied ${type[1]} \n defaulting to HTML`
      );
      return reportTypes.HTML;
    }
  } else if (config?.reportType) {
    return (
      Object.keys(reportTypes).find((a) => a == config.reportType) ||
      reportTypes.HTML
    );
  } else {
    return reportTypes.HTML;
  }
};

const args = process.argv.slice(2);

export const runScript = async (type) => {
  try {
    /**
     *  Read the package.json, pull dependency information & config info 
     */
    const dependenciesObject = await readPackageJson();
    let config;

    const { peerDependencies, dependencies, devDependencies, repoInfo, config:pkgConfig } =
      dependenciesObject;
        if (!pkgConfig) {
          config = await readConfigFile(dependenciesObject.repoInfo.type);
        } else {
          config = pkgConfig
        }
        
    const reportType = type || getReportType(config);
    verifyConfig(config, reportType, reportTypeCliArg);

    /**
     *  Check the set of dependencies through the npm registry lookup
     */
    const rawData = await checkDependencies({
      peerDependencies,
      dependencies,
      devDependencies,
      config,
    });

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
        const ciReport = await generateCiReportFromRawData(
          rawData,
          repoInfo,
          config
        );
        const { exitCode } = ciReport;
        if (process.env.NODE_ENV !== "test") {
          process.exit(exitCode);
        }
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
