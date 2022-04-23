import axios from "axios";
import semverGte from "semver/functions/gte.js";
import diff from "semver/functions/diff.js";

const NPM_REGISTRY_URL = "https://registry.npmjs.org";
const NPM_PACKAGE_URL = "https://www.npmjs.com/package";
const whitelistedDependencies = process.env.DEP_CHECK_WHITELIST || [];

const filterDependencies = (whiteList, dep) => {
  return dep.filter((d) => {
    return !whiteList.includes(d.package);
  });
};

export const checkDependencies = async ({
  peerDependencies = [],
  devDependencies = [],
  dependencies = [],
}) => {

  const failedLookupResult = [];
  const whiteList =
    whitelistedDependencies.length > 0
      ? whitelistedDependencies.split(",")
      : [];

  // successfulLookups, failedLookups;

  const {
    successfulLookups: peerDependenciesResult,
    failedLookups: failedPeerDependencies,
  } = await processDependencies(peerDependencies, whiteList);

  const {
    successfulLookups: devDependenciesResult,
    failedLookups: failedDevDependencies,
  } = await processDependencies(devDependencies, whiteList);

  const {
    successfulLookups: dependenciesResult,
    failedLookups: failedDependencies,
  } = await processDependencies(dependencies, whiteList);

  failedLookupResult.push(
    ...failedDependencies,
    ...failedDevDependencies,
    ...failedPeerDependencies
  );

  return {
    peerDependenciesResult,
    devDependenciesResult,
    dependenciesResult,
    failedLookupResult,
  };
};

const processDependencies = async (dep, whiteList) => {
  try {
    const failedLookups = [];
    const filteredDeps = filterDependencies(whiteList, dep);
    const processedData = await Promise.all(
      filteredDeps.map(async (current) => {
        const data = await checkDependencyInNPMRegistry({
          package: current.package,
        });
        const report = await generateReport(data, current);
        return report;
      })
    );
    const successfulLookups = processedData.filter((f) => {
      if (f.package.error) {
        failedLookups.push(f);
        return false;
      } else {
        return true;
      }
    });
    return { successfulLookups, failedLookups };
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

const checkDependencyInNPMRegistry = async ({ package: jsPackage }) => {
      const url = `${NPM_REGISTRY_URL}/${jsPackage}`;
  try {
    const { data } = await axios.get(url);
    const { time } = data;
    const tags = data["dist-tags"];
    return { versionTimeline: time, tags };
  } catch (e) {
    console.error(
      `There was an issue searching the registry for ${jsPackage}, skipping...`
    );
    return {
      versionTimeline: {},
      tags: {},
      error: true,
      name: jsPackage,
      url,
      stackTrace: e,
    };
  }
};

const generateVersionObject = ({
  name,
  versionTimeline,
  latest,
  definedVersion,
  error = false,
  currentPackage,
  stackTrace,
}) => {
  if (error)
    return {
      package: {
        error,
        name: currentPackage.package,
        version: currentPackage.version,
        stackTrace: stackTrace,
      },
    };

  return {
    package: {
      name,
      registry_url: `${NPM_REGISTRY_URL}/${name}`,
      npm_url: `${NPM_PACKAGE_URL}/${name}`,
      latest: {
        version: latest || definedVersion,
        releaseDate: versionTimeline[latest] || versionTimeline[definedVersion],
      },
      current: {
        version: definedVersion,
        releaseDate: versionTimeline[definedVersion],
      },
      upgradeType: diff(definedVersion, latest || definedVersion) || "N/A",
      error,
    },
  };
};

const generateReport = async (
  { versionTimeline, tags, error = false, stackTrace },
  currentPackage
) => {
  return new Promise((resolve, reject) => {
    try {
      if (error) {
        return resolve(
          generateVersionObject({
            error,
            currentPackage,
            stackTrace,
          })
        );
      }

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

      if (!semverGte(definedVersion, latest)) {
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
    }
  });
};
