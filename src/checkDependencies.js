import axios from "axios";

const NPM_REGISTRY_URL = "https://registry.npmjs.org";

export const checkDependencies = async ({
  peerDependencies = [],
  devDependencies = [],
  dependencies = [],
}) => {
  const peerDependenciesResult = await processDependencies(peerDependencies);
  const devDependenciesResult = await processDependencies(devDependencies);
  const dependenciesResult = await processDependencies(dependencies);

  return {
    peerDependenciesResult,
    devDependenciesResult,
    dependenciesResult
  }
};

const processDependencies = async (dep) => {
  try {
    const processedData = await Promise.all(
      dep.map(async (current) => {
        const data = await checkDependencyInNPMRegistry({
          package: current.package,
        });
        const report = await generateReport(data, current);
        return report;
      })
    );

    return processedData;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

const checkDependencyInNPMRegistry = async ({ package: jsPackage }) => {
  const { data } = await axios.get(`${NPM_REGISTRY_URL}/${jsPackage}`);
  const { time } = data;
  const tags = data["dist-tags"];
  return { versionTimeline: time, tags };
};

const generateVersionObject = ({
  name,
  versionTimeline,
  latest,
  definedVersion,
}) => {
  return {
    package: {
      name,
      latest: {
        version: latest || definedVersion,
        releaseDate: versionTimeline[latest] || versionTimeline[definedVersion],
      },
      current: {
        version: definedVersion,
        releaseDate: versionTimeline[definedVersion],
      },
    },
  };
};

const generateReport = async ({ versionTimeline, tags }, currentPackage) => {
  return new Promise((resolve, reject) => {
    try {
      const getDefinedVersion = () => {
        if (Number.isNaN(Number.parseFloat(currentPackage.version))) {
          const v = currentPackage.version.split("");
          const [throwAway, ...rest] = v;
          return rest.join("");
        } else {
          return currentPackage.version;
        }
      };

      const definedVersion = getDefinedVersion();

      const { latest } = tags;
      let versionInfo = {};
      if (definedVersion !== latest) {
        versionInfo = generateVersionObject({
          name: currentPackage.package,
          versionTimeline,
          latest,
          definedVersion,
        });
      } else {
        versionInfo = generateVersionObject({
          name: currentPackage.package,
          versionTimeline,
          definedVersion,
        });
      }
      resolve(versionInfo);
    } catch (e) {
      console.warn(e);
      reject(e);
      process.exit(1);
    }
  });
};
