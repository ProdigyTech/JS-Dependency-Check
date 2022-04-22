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

const generateStatusString = (latest, current) => {
  if (semverGte(current, latest)) {
    return STATUS_UP_TO_DATE;
  } else {
    return STATUS_OUTDATED;
  }
};

const generateTableFromDepResult = (dep, type) => {
  let outdated_counter = 0;
  const template = `
                    <h2>${type}</h2>
                <table id="result-table-${type}">
                    <thead>
                        <tr>
                        <td>Dependency Name</td>
                        <td>Current Version</td>
                        <td>Latest Version</td>
                        <td>Status</td>
                        <td> Upgrade Type </td>
                        </tr>
                    </thead>
                    <tbody>
                       ${dep
                         .map(({ package: depPackage }) => {
                           const { name, latest, current, upgradeType } =
                             depPackage;

                           const status = generateStatusString(
                             latest.version,
                             current.version
                           );

                           status === STATUS_OUTDATED && outdated_counter++;

                           return `<tr>
                        <td>${name}</td>
                        <td> ${current.version} </td>
                        <td>${latest.version} </td>
                        <td style=${
                          status === STATUS_OUTDATED
                            ? "background-color:red"
                            : "background-color:green"
                        }>${status}</td>
                        <td> ${upgradeType} </td>
                        </tr>`;
                         })
                         .join("")}
                    </tbody>
                    </table>`;

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
      return `There are ${totalOutdated} Packages that need to be updated. Woohoo! 🎉`;
    }
    if (totalOutdated == 1) {
      return `There is ${totalOutdated} Package that needs to be updated - Not bad! `;
    }

    if (totalOutdated > 1 && totalOutdated < 10) {
      return `There are  ${totalOutdated} Packages that need to be updated`;
    }

    if (totalOutdated >= 10) {
      return `Ouch... There are ${totalOutdated} Packages that need to be updated 🙈 Good Luck! `;
    }
  };

  return `
        <html>
        <title> Dependency Check -- Report </title>
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
