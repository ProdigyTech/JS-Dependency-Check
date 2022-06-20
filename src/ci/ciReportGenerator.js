import Table from "cli-table";
import { dependencyTypes, FAIL } from "../enums.js";

export const prettyCiReport = (rawData) => {
  return new Promise((resolve, reject) => {
    try {
      const { devDependencies, peerDependencies, dependencies, failedLookups } =
        rawData.packages;

      const devTable = generateTableFromData(
        devDependencies,
        dependencyTypes.DEV
      );

      const peerTable = generateTableFromData(
        peerDependencies,
        dependencyTypes.PEER
      );

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
      head:
        name === FAIL
          ? [name, "Project Version", "Error Info"]
          : [name, "Project Version", "Latest Version", "Upgrade Type"],
      colWidths: name === FAIL ? [50, 50, 50] : [50, 50, 50, 50],
      colors: true,
    });

    dep.forEach(({ package: depPackage }) => {
      const { name, current, latest, upgradeType, error } = depPackage;
      error
        ? table.push([name, depPackage.version, depPackage.stackTrace])
        : table.push([
            name,
            current.version,
            latest.version,
            upgradeType.toUpperCase(),
          ]);
    });

    return table;
  } else {
    return "";
  }
};
