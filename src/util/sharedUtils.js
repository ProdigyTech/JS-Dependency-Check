import path from 'path'
import { promises as fs } from "fs";

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
const STATUS_OUTDATED = "OUTDATED"

const generateStatusString = (latest, current) => {
  if (latest >= current) {
    return STATUS_UP_TO_DATE;
  } else {
    return STATUS_OUTDATED;
  }
};

const generateTableFromDepResult = (dep, type) => {
  const template = `
                    <h2>${type}</h2>
                <table id="result-table-${type}">
                    <thead>
                        <tr>
                        <td>Dependency Name</td>
                        <td>Current Version</td>
                        <td>Latest Version</td>
                        <td>Status</td>
                        </tr>
                    </thead>
                    <tbody>
                       ${dep.map(({ package: depPackage }) => {
                         const { name, latest, current } = depPackage;

                         const status = generateStatusString(
                           latest.version,
                           current.version
                         );

                        return `<tr>
                        <td>${name}</td>
                        <td> ${current.version} </td>
                        <td>${latest.version} </td>
                        <td style=${
                          status === STATUS_OUTDATED
                            ? "background-color:red"
                            : "background-color:green"
                        }>${status}</td></tr>`;
                       }).join("")}
                    </tbody>
                    </table>`;

  return template;
};

export const generateReportFromRawData = ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult,
}) => {
  const depTable = generateTableFromDepResult(
    dependenciesResult,
    "Dependencies"
  );
  const devTable = generateTableFromDepResult(
    devDependenciesResult,
    "Dev Dependencies"
  );
  const peerTable = generateTableFromDepResult(
    peerDependenciesResult,
    "Peer Dependencies"
  );
  
  return `
        <html>
        <title> Dependency Check -- Report </title>
        <body>
        <h1> Results Below: </h1>
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
    const p = path.join(__basedir, 'dependency-status-report.html');
    await fs.writeFile(p, html)
    console.log(`Wrote report to ${p}`)
    }catch(e) {
        console.error(e)
    }
}