#!/usr/bin/env node
import path from 'path';
import { promises } from 'fs';
import appRoot from 'app-root-path';
import axios from 'axios';
import semverGte from 'semver/functions/gte.js';
import diff from 'semver/functions/diff.js';
import Table from 'cli-table';

const readFile = async ({
  path
}) => {
  try {
    const fileData = promises.readFile(path);
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

const transformDependencyObject = (dep = {}) => Object.keys(dep).map(key => ({
  package: key,
  version: dep[key]
}));
const BASE_DIR = appRoot.path;

/* eslint-disable node/no-unsupported-features/es-syntax */
const readPackageJson = async () => {
  const packagePath = path.join(BASE_DIR, "package.json");
  const jsonFile = JSON.parse(await readFile({
    path: packagePath
  }));
  return {
    repoInfo: {
      name: jsonFile.name || "",
      version: jsonFile.version || "",
      type: jsonFile.type || ""
    },
    dependencies: transformDependencyObject(jsonFile.dependencies) || [],
    peerDependencies: transformDependencyObject(jsonFile.peerDependencies) || [],
    devDependencies: transformDependencyObject(jsonFile.devDependencies) || []
  };
};
const readConfigFile = async (type = "") => {
  try {
    if (type === "module") {
      const jsPath = path.join(BASE_DIR, "dependencyCheckConfig.js");
      const jsFile = await import(`${jsPath}`);
      return jsFile.default;
    } else {
      const jsPath = path.join(BASE_DIR, "dependencyCheckConfig.js");
      const jsFile = await require(`${jsPath}`);
      return jsFile.default;
    }
  } catch (e) {
    console.error('error reading config file');
    console.log(e);
    process.exit(1);
  }
};

const NPM_REGISTRY_URL = "https://registry.npmjs.org";
const NPM_PACKAGE_URL = "https://www.npmjs.com/package";

const filterDependencies = (whiteList, dep) => dep.filter(d => !whiteList.includes(d.package));

const performDependencyLookup = async (dep, whiteList) => {
  try {
    const failedLookups = [];
    const filteredDeps = filterDependencies(whiteList, dep);
    const processedData = await Promise.all(filteredDeps.map(async current => {
      const data = await checkDependencyInNPMRegistry({
        package: current.package
      });
      return await transformDependencyData(data, current);
    }));
    const successfulLookups = processedData.filter(f => {
      if (f.package.error) {
        failedLookups.push(f);
        return false;
      }

      return true;
    });
    return {
      successfulLookups,
      failedLookups
    };
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

const checkDependencyInNPMRegistry = async ({
  package: jsPackage
}) => {
  const url = `${NPM_REGISTRY_URL}/${jsPackage}`;

  try {
    const {
      data
    } = await axios.get(url);
    const {
      time
    } = data;
    const tags = data["dist-tags"];
    return {
      versionTimeline: time,
      tags
    };
  } catch (e) {
    console.error(`There was an issue searching the registry for ${jsPackage}, skipping...`);
    return {
      error: true,
      name: jsPackage,
      url,
      stackTrace: e
    };
  }
};

const checkDependencies = async ({
  peerDependencies = [],
  devDependencies = [],
  dependencies = [],
  config = {}
}) => {
  const failedLookupResult = [];
  const ignoreList = config.ignorePackages || [];
  const {
    successfulLookups: peerDependenciesResult,
    failedLookups: failedPeerDependencies
  } = await performDependencyLookup(peerDependencies, ignoreList);
  const {
    successfulLookups: devDependenciesResult,
    failedLookups: failedDevDependencies
  } = await performDependencyLookup(devDependencies, ignoreList);
  const {
    successfulLookups: dependenciesResult,
    failedLookups: failedDependencies
  } = await performDependencyLookup(dependencies, ignoreList);
  failedLookupResult.push(...failedDependencies, ...failedDevDependencies, ...failedPeerDependencies);
  return {
    peerDependenciesResult,
    devDependenciesResult,
    dependenciesResult,
    failedLookupResult
  };
};

const generateVersionObject = ({
  name,
  versionTimeline,
  latest,
  definedVersion,
  error = false,
  currentPackage,
  stackTrace
}) => {
  if (error) return {
    package: {
      error,
      name: currentPackage.package,
      version: currentPackage.version,
      stackTrace: stackTrace
    }
  };
  return {
    package: {
      name,
      registry_url: `${NPM_REGISTRY_URL}/${name}`,
      npm_url: `${NPM_PACKAGE_URL}/${name}`,
      latest: {
        version: latest || definedVersion,
        releaseDate: versionTimeline[latest] || versionTimeline[definedVersion]
      },
      current: {
        version: definedVersion,
        releaseDate: versionTimeline[definedVersion]
      },
      upgradeType: `${diff(definedVersion, latest || definedVersion) || "N/A"}`.toUpperCase(),
      error
    }
  };
};

const getDefinedVersion = currentPackage => {
  /**
   * For versions defined like ^3.0.0 or ~3.0.0, remove the ^ or ~
   */
  if (Number.isNaN(Number.parseFloat(currentPackage.version))) {
    const v = currentPackage.version.split("");
    const [, ...rest] = v;
    return rest.join("");
  }

  return currentPackage.version;
};

const transformDependencyData = async ({
  versionTimeline,
  tags,
  error = false,
  stackTrace
}, currentPackage) => new Promise((resolve, reject) => {
  try {
    if (error) {
      return resolve(generateVersionObject({
        error,
        currentPackage,
        stackTrace
      }));
    }

    const definedVersion = getDefinedVersion(currentPackage);
    const {
      latest
    } = tags;
    let versionInfo = {};

    if (!semverGte(definedVersion, latest)) {
      versionInfo = generateVersionObject({
        name: currentPackage.package,
        versionTimeline,
        latest,
        definedVersion
      });
    } else {
      versionInfo = generateVersionObject({
        name: currentPackage.package,
        versionTimeline,
        definedVersion
      });
    }

    resolve(versionInfo);
  } catch (e) {
    console.warn(e);
    reject(e);
  }
});

const reportTypes = {
  JSON: "JSON",
  HTML: "HTML",
  CI: "CI"
};
const dependencyTypes = {
  DEV: "Dev Dependencies",
  PEER: "Peer Dependencies",
  DEP: "Dependencies"
};
const ciFailKeys = {
  MAJOR: "MAJOR",
  MINOR: "MINOR",
  PREMAJOR: "PREMAJOR",
  PREMINOR: "PREMINOR",
  PREPATCH: "PREPATCH",
  PRERELEASE: "PRERELEASE",
  PATCH: "PATCH",
  DEFAULT: "MINOR",
  NONE: "NONE"
};
const FAIL = "Failed Lookups";
const STATUS_UP_TO_DATE = "UP TO DATE";
const STATUS_OUTDATED = "OUTDATED";
const STATUS_UNKNOWN = "UNKNOWN";

const prettyFailedSummary = rawData => {
  return new Promise((resolve, reject) => {
    try {
      const table = new Table({
        head: ["Packages Requiring Attention", "Project Version", "Latest Version", "Upgrade Type"],
        colWidths: [30, 25, 25, 25],
        colors: true
      });
      rawData.forEach(({
        package: depPackage
      }) => {
        const {
          name,
          current,
          latest,
          upgradeType
        } = depPackage;
        table.push([name, current.version, latest.version, upgradeType.toUpperCase()]);
      });
      console.log(table.toString());
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
const prettyCiReport = rawData => {
  return new Promise((resolve, reject) => {
    try {
      const {
        devDependencies,
        peerDependencies,
        dependencies,
        failedLookups
      } = rawData.packages;
      const devTable = generateTableFromData(devDependencies, dependencyTypes.DEV);
      const peerTable = generateTableFromData(peerDependencies, dependencyTypes.PEER);
      const depTable = generateTableFromData(dependencies, dependencyTypes.DEP);
      const failedTable = generateTableFromData(failedLookups, FAIL);
      console.log(devTable.toString());
      console.log(peerTable.toString());
      console.log(depTable.toString());
      console.log(failedTable.toString());
      resolve();
    } catch (e) {
      console.error(e);
      reject(e);
      process.exit(1);
    }
  });
};

const generateTableFromData = (dep, name) => {
  if (dep.length) {
    const table = new Table({
      head: name === FAIL ? [name, "Project Version", "Error Info"] : [name, "Project Version", "Latest Version", "Upgrade Type"],
      colWidths: name === FAIL ? [25, 25, 25] : [25, 25, 25, 25],
      colors: true
    });
    dep.forEach(({
      package: depPackage
    }) => {
      const {
        name,
        current,
        latest,
        upgradeType,
        error
      } = depPackage;
      error ? table.push([name, depPackage.version, depPackage.stackTrace]) : table.push([name, current.version, latest.version, upgradeType.toUpperCase()]);
    });
    return table;
  } else {
    return "";
  }
};

const DIR_BASE = path.resolve(appRoot.path);

const filterByMajor = k => k.upgradeType != "N/A";

const filterByPatch = k => k.upgradeType === ciFailKeys.PATCH;

const filterByMinor = k => k.upgradeType === ciFailKeys.MINOR || k === ciFailKeys.PATCH;

const filterByPreMajor = k => k.upgradeType.includes("PRE");

const filterByPreMinor = k => k.upgradeType === ciFailKeys.PREMINOR || k === ciFailKeys.PREPATCH;

const filterByPrePatch = k => k.upgradeType === ciFailKeys.PREPATCH;

const filterByPreRelease = k => k.upgradeType === ciFailKeys.PRERELEASE;

const lookupByFailKey = {
  [ciFailKeys.MAJOR]: filterByMajor,
  [ciFailKeys.PATCH]: filterByPatch,
  [ciFailKeys.MINOR]: filterByMinor,
  [ciFailKeys.PREMAJOR]: filterByPreMajor,
  [ciFailKeys.PREMINOR]: filterByPreMinor,
  [ciFailKeys.PREPATCH]: filterByPrePatch,
  [ciFailKeys.PRERELEASE]: filterByPreRelease,
  [ciFailKeys.NONE]: () => false
};

const generateStats = ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult
}) => {
  return [...peerDependenciesResult, ...devDependenciesResult, ...dependenciesResult].reduce((acc, {
    package: pkg
  }) => {
    const {
      upgradeType
    } = pkg;

    if (!acc[upgradeType]) {
      return { ...acc,
        [upgradeType]: 1
      };
    } else {
      return { ...acc,
        [upgradeType]: acc[upgradeType] + 1
      };
    }
  }, {});
};

const generateJSONReportFromRawData = ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult,
  failedLookupResult,
  disableTime = false
}, {
  name,
  version
}) => {
  const date = new Date();
  return JSON.stringify({
    repoInfo: {
      name,
      version
    },
    packages: {
      devDependencies: devDependenciesResult,
      peerDependencies: peerDependenciesResult,
      dependencies: dependenciesResult,
      failedLookups: failedLookupResult
    },
    stats: generateStats({
      peerDependenciesResult,
      devDependenciesResult,
      dependenciesResult
    }),
    reportGeneratedAt: {
      date: !disableTime && date.toLocaleDateString(),
      time: !disableTime && date.toLocaleTimeString()
    }
  }, null, 2);
};

const getFailedPackageInfoCI = (data, failOn) => {
  let packagesMatchingCriteria = [];

  if (lookupByFailKey[failOn]) {
    packagesMatchingCriteria = data.filter(({
      package: dpack
    }) => {
      return lookupByFailKey[failOn](dpack);
    });
  } else {
    console.log(`Unknown failOnKey: ${failOn} passed in package.json, using default ${ciFailKeys.DEFAULT}`);
    packagesMatchingCriteria = data.filter(({
      package: dpack
    }) => {
      return lookupByFailKey[ciFailKeys.DEFAULT](dpack);
    });
  }

  return packagesMatchingCriteria;
};

const grabExitCodeFromStats = (data, failOn = ciFailKeys.MINOR) => {
  // TODO:
  // failOnMajor -> fails on EVERYTHING; Most restricitve
  // failOnPatch -> fails only on patch upgrades
  // failOnMinor -> fails on Minor upgrades and Patch upgrades
  // TODO add the following  premajor, preminor, prepatch, or prerelease
  return new Promise((resolve, reject) => {
    try {
      const {
        devDependencies,
        peerDependencies,
        dependencies
      } = data.packages;
      let failedPackages = [];
      failedPackages = getFailedPackageInfoCI([...devDependencies, ...peerDependencies, ...dependencies], failOn);

      if (failedPackages.length > 0) {
        resolve({
          exitCode: 1,
          failedPackages
        });
      } else {
        console.log(`Dependencies are up to date.`);
        resolve({
          exitCode: 0,
          failedPackages: []
        });
      }
    } catch (e) {
      console.log(e);
      reject({
        exitCode: 1,
        failedPackages: []
      });
    }
  });
};

const generateCiReportFromRawData = async ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult,
  failedLookupResult,
  disableTime = false
}, {
  name,
  version
}, {
  failOn
}) => {
  try {
    const date = new Date();
    const data = {
      repoInfo: {
        name,
        version
      },
      packages: {
        devDependencies: devDependenciesResult,
        peerDependencies: peerDependenciesResult,
        dependencies: dependenciesResult,
        failedLookups: failedLookupResult
      },
      stats: generateStats({
        peerDependenciesResult,
        devDependenciesResult,
        dependenciesResult
      }),
      reportGeneratedAt: {
        date: !disableTime && date.toLocaleDateString(),
        time: !disableTime && date.toLocaleTimeString()
      }
    };
    const {
      exitCode,
      failedPackages
    } = await grabExitCodeFromStats(data, failOn);
    await prettyCiReport(data);
    failedPackages.length > 0 && (await prettyFailedSummary(failedPackages));
    exitCode > 0 && console.log("Out of date dependencies detected. Please upgrade or ignore out of date dependencies. \n Review the Packages Requiring Attention section for more info");
    return {
      exitCode
    };
  } catch (e) {
    console.error(e);
  }
};
const generateHTMLReportFromRawData = ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult,
  failedLookupResult
}, {
  name,
  version
}) => {
  const {
    template: depTable,
    outdated_counter: depOutdatedCounter
  } = generateTableFromDepResult(dependenciesResult, "Dependencies");
  const {
    template: devTable,
    outdated_counter: devTableOutdatedCounter
  } = generateTableFromDepResult(devDependenciesResult, "Dev Dependencies");
  const {
    template: peerTable,
    outdated_counter: peerTableOutdatedCounter
  } = generateTableFromDepResult(peerDependenciesResult, "Peer Dependencies");
  const {
    errorTable
  } = generateTableFromErrorResult(failedLookupResult);
  const legendTable = generateLegendTable();
  const statsTable = generateStatsTable({
    peerDependenciesResult,
    devDependenciesResult,
    dependenciesResult,
    failedLookupResult
  });

  const dependencyString = () => {
    const totalOutdated = devTableOutdatedCounter + peerTableOutdatedCounter + depOutdatedCounter;

    if (totalOutdated == 0) {
      return `🎉 There are ${totalOutdated} packages that need to be updated. Woohoo! `;
    }

    if (totalOutdated == 1) {
      return `⚠️ There is ${totalOutdated} package that needs to be updated - Not bad! `;
    }

    if (totalOutdated > 1 && totalOutdated < 10) {
      return `⚠️ There are  ${totalOutdated} packages that need to be updated`;
    }

    if (totalOutdated >= 10) {
      return `​​⚠️​😱​ Ouch... There are ${totalOutdated} packages that need to be updated 🙈 Good Luck! `;
    }
  };

  return `
        <html>
        <title> Dependency Check -- Report </title>
        <head>
        </head>
        <style>
        {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        }

        div.wrapper{
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        width:100%;
        }

        .header, .sub-header{
          flex-direction: row;
          width:90%;
        }
        
        .legend-table {
          flex-direction: row;
          width: 50%;
          margin-right: 3em;
        }
        
        .dep-table, .dev-table, .peer-table, .error-table {
             width: 80%;
             flex-direction: row;
             min-width: 60%;
        }
        .status {
          min-width: 5em;
        }

         td, th {
        border: 1px solid #ddd;
        padding: 8px;
        }
        tr {
            cursor: pointer;
        }
        tr:nth-child(even){background-color: #f2f2f2;}

        tr:hover {background-color: #ddd;}

        #th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #04AA6D;
        color: white;
        }
        </style>
    
        <body>
        <div class="wrapper">
        <div class=header>
        <h2>Dependency Check Results for ${name} v${version} </h2>
        </div>
        <div class="sub-header">
          <h3>${dependencyString()} </h3>
        </div>
        
        <div class="legend-table"> 
          ${legendTable}
        </div>
        <div class="stats-table">
          ${statsTable}
        </div>
        <div class="dep-table">
                ${depTable}
        </div>
        <div class="dev-table">
                ${devTable}
        </div>
        <div class="peer-table">
                ${peerTable}
        </div>
        <div class="error-table">
            ${errorTable}
        </div>
        </div>
        </body>
        </html>
    `;
};
const legendLookup = [{
  key: [STATUS_UP_TO_DATE, "N/A"],
  color: "background-color:green",
  meaning: "Up to date, no action needed."
}, {
  key: ["PATCH"],
  color: "background-color:yellowgreen",
  meaning: "Patch upgrade, no breaking changes"
}, {
  key: ["PREPATCH", "PREMINOR", "MINOR"],
  color: "background-color:yellow",
  meaning: "Minor upgrade, possible breaking changes. \n Consult the change log"
}, {
  key: ["PRERELEASE", "MAJOR", "PREMAJOR"],
  color: "background-color:red",
  meaning: "Major upgrade with breaking changes. \n Consult the change log"
}];

const getLegendDataByKey = key => {
  return legendLookup.find(({
    key: keyArray
  }) => {
    return keyArray.includes(key);
  });
};

const generateStatusString = (latest, current) => {
  if (latest === "ERROR" || current === "ERROR") {
    return STATUS_UNKNOWN;
  }

  if (semverGte(current, latest)) {
    return STATUS_UP_TO_DATE;
  } else {
    return STATUS_OUTDATED;
  }
};

const generateTableFromErrorResult = (errors = []) => {
  const errorTable = errors.length ? `
                    <h2>Failed Lookups </h2>
                    <h4>We couldn't locate the packages below in the public npm registry </h4>
                <table id="result-table-error style="width:100%">
                    <thead>
                        <tr>
                        <td>Package</td>
                        <td>Current Version</td>
                        <td>Status</td>
                        <td>Response Code</td>
                    </thead>
                    <tbody>
                       ${errors.map(({
    package: depPackage
  }) => {
    return `<tr>
                           <td>${depPackage.name}</td>
                           <td>${depPackage.version}</td>
                           <td>${STATUS_UNKNOWN}</td>
                           <td>${depPackage.stackTrace.toString()}</td>
                           </tr>`;
  }).join("")}
                    </tbody>
                    </table>` : "";
  return {
    errorTable
  };
};

const generateLegendTable = () => `    
                    <h4>Legend </h4>
                <table id="legend">
                    <thead>
                        <tr>
                        <td>Color</td>
                        <td>Meaning</td>
                        <td>Upgrade Type</td>
                    </thead>
                    <tbody>
                       ${legendLookup.map(({
  color,
  meaning,
  key
}) => {
  return `<tr>
                           <td style="${color}"></td>
                           <td>${meaning}</td>
                           <td>${key.join(" ")}</td>
                           </tr>`;
}).join("")}
                    </tbody>
                    </table>`;

const generateTableFromDepResult = (dep, type) => {
  const getStatusBgColor = UPGRADE_TYPE => {
    return getLegendDataByKey(UPGRADE_TYPE).color;
  };

  let outdated_counter = 0;
  const template = dep.length ? `
                    <h2>${type}</h2>
                <table id="result-table-${type} style="width:100%">
                    <thead>
                        <tr>
                        <td>Package</td>
                        <td>Current Version</td>
                        <td>Current Release Date</td>
                        <td>Latest Version</td>
                        <td>Latest Version Release Date</td>
                        <td>Status</td>
                        <td> Upgrade Type </td>
                        <td> Link to package in registry </td>
                        <td> Link to package on NPM </td>
                        </tr>
                    </thead>
                    <tbody>
                       ${dep.map(({
    package: depPackage
  }) => {
    const {
      name,
      registry_url,
      npm_url,
      latest,
      current,
      upgradeType
    } = depPackage;
    const status = generateStatusString(latest.version, current.version);
    status === STATUS_OUTDATED && outdated_counter++;
    const currentVersionDate = new Date(current.releaseDate).toLocaleDateString();
    const latestVersionReleaseDate = new Date(latest.releaseDate).toLocaleDateString();
    return `<tr>
                        <td>${name}</td>
                        <td> ${current.version} </td>
                        <td>${currentVersionDate}</td>
                        <td>${latest.version} </td>
                         <td>${latestVersionReleaseDate}</td>
                        <td class="status" style=${getStatusBgColor(upgradeType.toUpperCase())}>${status}</td>
                        <td> ${upgradeType.toUpperCase()} </td>
                        <td> <a href=${registry_url} target="_blank"> ${registry_url} </a> </td>
                        <td> <a href=${npm_url} target="_blank"> ${npm_url} </a> </td>
                        </tr>`;
  }).join("")}
                    </tbody>
                    </table>` : "";
  return {
    template,
    outdated_counter
  };
};

const generateStatsTable = ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult
}) => {
  const stats = generateStats({
    peerDependenciesResult,
    devDependenciesResult,
    dependenciesResult
  });
  const statKeys = Object.keys(stats).filter(k => k !== "N/A");
  return statKeys.length ? `    
                    <h4>Stats </h4>
                <table id="stats">
                    <thead>
                        <tr>
                        <td>Upgrade Type</td>
                        <td>Package Count</td>
                    </thead>
                    <tbody>
                    ${statKeys.map(st => {
    return `
                      <tr>
                      <td>${st.toUpperCase()}</td>
                      <td>${stats[st]}</td>
                      </tr>
                      `;
  }).join("")}
                    </tbody>
                    </table>` : "";
};

const writeReport = async (data, type) => {
  try {
    const p = path.join(DIR_BASE, `dependency-status-report.${type.toLowerCase()}`);
    await promises.writeFile(p, data);
    console.log(`Wrote report to ${p}`);
  } catch (e) {
    console.error(e);
  }
};

const verifyConfig = (config, reportType, reportTypeCliArg) => {
  if (!config) {
    console.log(`Couldn't find config options in your package.json, using default options`);
    return;
  } else {
    if (config.reportType && reportType && reportTypeCliArg) {
      console.log("Looks like you've supplied a reportType config option and a reportType CLI arg. Ignoring the config option from Package.json");
      console.log("Report Type: ", reportType);
    }

    if (config.failOn && reportType !== reportTypes.CI) {
      console.log("Looks like you've added a failOn config option. This only works when the report type is CI. Ignoring...");
    }

    if (config.ignorePackages) {
      console.log(`Ignoring the following packages... ${config.ignorePackages.join(" ")}`);
    }
  }
};

let reportTypeCliArg = false;
const getReportType = config => {
  const typeArg = args.find(a => a.includes("--report-type="));

  if (typeArg) {
    const type = typeArg.split("=");
    reportTypeCliArg = true;
    const r = Object.keys(reportTypes).find(a => a == type[1]);

    if (r) {
      return r;
    } else {
      console.log(`You've supplied an invalid report type, Valid types are CI, JSON, HTML... You supplied ${type[1]} \n defaulting to HTML`);
      return reportTypes.HTML;
    }
  } else if (config?.reportType) {
    return Object.keys(reportTypes).find(a => a == config.reportType) || reportTypes.HTML;
  } else {
    return reportTypes.HTML;
  }
};
const args = process.argv.slice(2);
const runScript = async type => {
  try {
    /**
     *  Read the package.json, pull dependency information
     */
    const dependenciesObject = await readPackageJson();
    const config = await readConfigFile(dependenciesObject.repoInfo.type);
    const {
      peerDependencies,
      dependencies,
      devDependencies,
      repoInfo
    } = dependenciesObject;
    const reportType = type || getReportType(config);
    verifyConfig(config, reportType, reportTypeCliArg);
    /**
     *  Check the set of dependencies through the npm registry lookup
     */

    const rawData = await checkDependencies({
      peerDependencies,
      dependencies,
      devDependencies,
      config
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
        const ciReport = await generateCiReportFromRawData(rawData, repoInfo, config);
        const {
          exitCode
        } = ciReport;
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

export { getReportType, runScript };
