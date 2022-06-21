import Table from "cli-table";
import { dependencyTypes, FAIL } from "../enums.js";

export const prettyFailedSummary = (rawData) => {
  return new Promise((resolve, reject) => {
    try {
      const table = new Table({
        head: [
          "Packages Requiring Attention",
          "Project Version",
          "Latest Version",
          "Upgrade Type",
        ],
        colWidths: [55, 25, 25, 25],
        colors: true,
      });

      rawData.forEach(({ package: depPackage }) => {
        const { name, current, latest, upgradeType } = depPackage;
        table.push([
          name,
          current.version,
          latest.version,
          upgradeType.toUpperCase(),
        ]);
      });

      console.log(table.toString());
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

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
      colWidths: name === FAIL ? [25, 25, 25] : [25, 25, 25, 25],
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
