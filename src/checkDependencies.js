import axios from "axios";
import semverGte from "semver/functions/gte.js";
import diff from "semver/functions/diff.js";

const NPM_REGISTRY_URL = "https://registry.npmjs.org";
const NPM_PACKAGE_URL = "https://www.npmjs.com/package";

const filterDependencies = (whiteList, dep) =>
  dep.filter((d) => !whiteList.includes(d.package));

const performDependencyLookup = async (dep, whiteList) => {
  try {
    const filteredDeps = filterDependencies(whiteList, dep);
    const processedData = await Promise.all(
      filteredDeps.map(async (current) => {
        const data = await checkDependencyInNPMRegistry({
          package: current.package,
        });
        return await transformDependencyData(data, current);
      })
    );
  
    const { successfulLookups, failedLookups } = processedData.reduce(
      (acc, f) => {
        f.package.error
          ? acc.failedLookups.push(f)
          : acc.successfulLookups.push(f);

        return acc;
      },
      { successfulLookups: [], failedLookups: [] }
    );
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
      error: true,
      name: jsPackage,
      url,
      stackTrace: e,
    };
  }
};

export const checkDependencies = async ({
  peerDependencies = [],
  devDependencies = [],
  dependencies = [],
  config = {},
}) => {
  const failedLookupResult = [];
  const ignoreList = config.ignorePackages || [];

  const {
    successfulLookups: peerDependenciesResult,
    failedLookups: failedPeerDependencies,
  } = await performDependencyLookup(peerDependencies, ignoreList);

  const {
    successfulLookups: devDependenciesResult,
    failedLookups: failedDevDependencies,
  } = await performDependencyLookup(devDependencies, ignoreList);

  const {
    successfulLookups: dependenciesResult,
    failedLookups: failedDependencies,
  } = await performDependencyLookup(dependencies, ignoreList);

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
      upgradeType: `${
        diff(definedVersion, latest || definedVersion) || "N/A"
      }`.toUpperCase(),
      error,
    },
  };
};

export const getDefinedVersion = (currentPackage) => {
  /**
   * For versions defined like ^3.0.0 or ~3.0.0, remove the ^ or ~
   */
  if (Number.isNaN(Number.parseFloat(currentPackage.version))) {
    const v = currentPackage.version.split("");
    const [, ...rest] = v;
    return rest.join("");
  }
  return currentPackage.version;
};

const transformDependencyData = async (
  { versionTimeline, tags, error = false, stackTrace },
  currentPackage
) =>
  new Promise((resolve, reject) => {
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

      const definedVersion = getDefinedVersion(currentPackage);

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
