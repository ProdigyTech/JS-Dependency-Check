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
const STATUS_UNKNOWN = "UNKNOWN"

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

const generateTableFromDepResult = (dep, type) => {
  const getStatusBgColor = (UPGRADE_TYPE) => {
    if (UPGRADE_TYPE !== "N/A") {
      switch (UPGRADE_TYPE) {
        case "PATCH":
          return "background-color:yellowgreen";
        case "PREPATCH":
        case "PREMINOR":
        case "MINOR":
          return "background-color:yellow";
        case "PRERELEASE":
        case "MAJOR":
        case "PREMAJOR":
          return "background-color:red";
        default:
          return "background-color:red";
      }
    } else {
      return "background-color:green";
    }
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
                        <td style=${getStatusBgColor(
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

export const generateReportFromRawData = ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult,
}) => {
  const { template: depTable, outdated_counter: depOutdatedCounter } =
    generateTableFromDepResult(dependenciesResult, "Dependencies");

  const { template: devTable, outdated_counter: devTableOutdatedCounter } =
    generateTableFromDepResult(devDependenciesResult, "Dev Dependencies");
  const { template: peerTable, outdated_counter: peerTableOutdatedCounter } =
    generateTableFromDepResult(peerDependenciesResult, "Peer Dependencies");

  const dependencyString = () => {
    const totalOutdated =
      devTableOutdatedCounter + peerTableOutdatedCounter + depOutdatedCounter;

    if (totalOutdated == 0) {
      return `🎉 There are ${totalOutdated} Packages that need to be updated. Woohoo! `;
    }
    if (totalOutdated == 1) {
      return `⚠️ There is ${totalOutdated} Package that needs to be updated - Not bad! `;
    }

    if (totalOutdated > 1 && totalOutdated < 10) {
      return `⚠️ There are  ${totalOutdated} Packages that need to be updated`;
    }

    if (totalOutdated >= 10) {
      return `​​⚠️​😱​ Ouch... There are ${totalOutdated} Packages that need to be updated 🙈 Good Luck! `;
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
        
        table {
            width:100%;
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
        <h1> Results Below: </h1>
        <h3>${dependencyString()} </h3>
        <div class="dep-table">
                ${depTable}
        </div>
        <div class="dev-table">
                ${devTable}
        </div>
        <div class="peer-table">
                ${peerTable}
        </div>
        </body>
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
