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

const generateStatusString = (latest, current) => {

    if (latest >= current) {
        return 'UP TO DATE'
    } else {
        return 'OUTDATED'
    }
}

const generateTableFromDepResult = (dep) => {

  const template = `<table id="result-table">
                    <thead>
                        <tr>
                        <td>Dependency Name</td>
                        <td>Current Version</td>
                        <td>Latest Version</td>
                        <td>Status</td>
                        </tr>
                    </thead>
                    <tbody>
                       ${dep.map(({package: depPackage}) => {
                        const {name, latest, current} = depPackage;

                        const status = generateStatusString(latest.version, current.version)

                        return `<tr>
                        <td>${name}</td>
                        <td> ${current.version} </td>
                        <td>${latest.version} </td>
                        <td>${status}</td>
                        </tr>
                        `
                       })}
                    </tbody>
                    </table>`;

  return template;
};

export const generateReportFromRawData = ({
  peerDependenciesResult,
  devDependenciesResult,
  dependenciesResult,
}) => {
  const a = generateTableFromDepResult(dependenciesResult);
  console.log(a);
};
