import path from "path";
import { promises as fs } from "fs";
import semverGte from "semver/functions/gte.js";

export const readFile = async ({ path, encoding, ...rest }) => {
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
export const transformDependencyObject = (dep = {}) => {
  return Object.keys(dep).map((key) => ({ package: key, version: dep[key] }));
};

const STATUS_UP_TO_DATE = "UP TO DATE";
const STATUS_OUTDATED = "OUTDATED";
const STATUS_UNKNOWN = "UNKNOWN";

const legendLookup = [
  {
    key: [STATUS_UP_TO_DATE, "N/A"],
    color: "background-color:green",
    meaning: "Up to date, no action needed.",
  },
  {
    key: ["PATCH"],
    color: "background-color:yellowgreen",
    meaning: "Patch upgrade, no breaking changes",
  },
  {
    key: ["PREPATCH", "PREMINOR", "MINOR"],
    color: "background-color:yellow",
    meaning:
      "Minor upgrade, possible breaking changes. \n Consult the change log",
  },
  {
    key: ["PRERELEASE", "MAJOR", "PREMAJOR"],
    color: "background-color:red",
    meaning: "Major upgrade with breaking changes. \n Consult the change log",
  },
];

const getLegendDataByKey = (key) => {
  return legendLookup.find(({ key: keyArray }) => {
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
  const errorTable = errors.length
    ? `
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
                       ${errors
                         .map(({ package: depPackage }) => {
                           return `<tr>
                           <td>${depPackage.name}</td>
                           <td>${depPackage.version}</td>
                           <td>${STATUS_UNKNOWN}</td>
                           <td>${depPackage.stackTrace.toString()}</td>
                           </tr>`;
                         })
                         .join("")}
                    </tbody>
                    </table>`
    : "";
  return { errorTable };
};

const generateLegendTable = () =>
  `    
                    <h4>Legend </h4>
                <table id="legend">
                    <thead>
                        <tr>
                        <td>Color</td>
                        <td>Meaning</td>
                        <td>Upgrade Type</td>
                    </thead>
                    <tbody>
                       ${legendLookup
                         .map(({ color, meaning, key }) => {
                           return `<tr>
                           <td style="${color}"></td>
                           <td>${meaning}</td>
                           <td>${key.join(" ")}</td>
                           </tr>`;
                         })
                         .join("")}
                    </tbody>
                    </table>`;

const generateTableFromDepResult = (dep, type) => {
  const getStatusBgColor = (UPGRADE_TYPE) => {
    return getLegendDataByKey(UPGRADE_TYPE)?.color;
  };

  let outdated_counter = 0;
  const template = dep.length
    ? `
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
                       ${dep
                         .map(({ package: depPackage }) => {
                           const {
                             name,
                             registry_url,
                             npm_url,
                             latest,
                             current,
                             upgradeType,
                           } = depPackage;

                           const status = generateStatusString(
                             latest.version,
                             current.version
                           );

                           status === STATUS_OUTDATED && outdated_counter++;

                           const currentVersionDate = new Date(
                             current.releaseDate
                           ).toLocaleDateString();
                           const latestVersionReleaseDate = new Date(
                             latest.releaseDate
                           ).toLocaleDateString();
                           return `<tr>
                        <td>${name}</td>
                        <td> ${current.version} </td>
                        <td>${currentVersionDate}</td>
                        <td>${latest.version} </td>
                         <td>${latestVersionReleaseDate}</td>
                        <td class="status" style=${getStatusBgColor(
                          upgradeType.toUpperCase()
                        )}>${status}</td>
                        <td> ${upgradeType.toUpperCase()} </td>
                        <td> <a href=${registry_url} target="_blank"> ${registry_url} </a> </td>
                        <td> <a href=${npm_url} target="_blank"> ${npm_url} </a> </td>
                        </tr>`;
                         })
                         .join("")}
                    </tbody>
                    </table>`
    : "";

  return { template, outdated_counter };
};

export const generateReportFromRawData = (
  {
    peerDependenciesResult,
    devDependenciesResult,
    dependenciesResult,
    failedLookupResult,
  },
  { name, version }
) => {
  const { template: depTable, outdated_counter: depOutdatedCounter } =
    generateTableFromDepResult(dependenciesResult, "Dependencies");

  const { template: devTable, outdated_counter: devTableOutdatedCounter } =
    generateTableFromDepResult(devDependenciesResult, "Dev Dependencies");
  const { template: peerTable, outdated_counter: peerTableOutdatedCounter } =
    generateTableFromDepResult(peerDependenciesResult, "Peer Dependencies");

  const { errorTable } = generateTableFromErrorResult(failedLookupResult);

  const legendTable = generateLegendTable();

  const dependencyString = () => {
    const totalOutdated =
      devTableOutdatedCounter + peerTableOutdatedCounter + depOutdatedCounter;

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

export const writeReport = async (html) => {
  try {
    const p = path.join(__basedir, "dependency-status-report.html");
    await fs.writeFile(p, html);
    console.log(`Wrote report to ${p}`);
  } catch (e) {
    console.error(e);
  }
};
