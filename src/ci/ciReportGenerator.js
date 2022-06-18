import Table from "cli-table";

export const prettyCiReport = (rawData) => {
  const { devDependencies, peerDependencies, dependencies, failedLookups } =
    rawData.packages;

  const devTable = generateTableFromData(devDependencies, "Dev Dependencies");
  // const peerTable = generateTableFromData(peerDependencies);
  // const depTable = generateTableFromData(dependencies);
  // const failedTable = generateTableFromData(failedLookups);

  return ""; //JSON.stringify(rawData, null, 2);
};

const generateTableFromData = (dep, name) => {
  const table = new Table({
    head: [name, "Resolved Version", "Latest Version", 'Upgrade Type'],
    colWidths: [50, 50, 50, 50],
    colors: true,
  });

  dep.forEach(({ package:depPackage }) => {
    const {name, current, latest, upgradeType} = depPackage
    table.push([name, current.version, latest.version, upgradeType]);
  });



  console.log(table.toString());
  //console.log(dep)
};
