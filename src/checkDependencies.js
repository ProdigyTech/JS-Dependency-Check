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
};

const processDependencies = async (dep) => {
  dep.length &&
    dep.reduce(async (accumulatedData, current) => {
      const data = await checkDependencyInNPMRegistry({
        package: current.package,
      });
      const report = await generateReport(data, current);
      return data;
    }, []);
};

const checkDependencyInNPMRegistry = async ({ package: jsPackage }) => {
  const { data } = await axios.get(`${NPM_REGISTRY_URL}/${jsPackage}`);
  const { time } = data;
  const tags = data["dist-tags"];
  return { versionTimeline: time, tags };
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

      if (definedVersion !== latest) {
        // return {
        //     package: {...currentPackage}
        // }
      } else {
      }
    } catch (e) {
      reject(e);
    }
  });
};
