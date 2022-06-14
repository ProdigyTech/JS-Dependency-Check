import path from "path";
import appRoot from "app-root-path";
import { existsSync, unlink } from "fs";
import {
  generateJSONReportFromRawData,
  generateHTMLReportFromRawData,
  writeReport,
} from "../reportGenerator";
import { checkDependencies } from "../checkDependencies";

const mockPackageJsonObject = {
  repoInfo: { name: "@prodigytech/js-dependency-check", version: "4.0.0" },
  dependencies: [
    { package: "@babel/preset-env", version: "^7.16.11" },
    { package: "app-root-path", version: "^3.0.0" },
    { package: "axios", version: "^0.27.1" },
    { package: "babel-jest", version: "^28.0.1" },
    { package: "jest", version: "^28.0.1" },
    { package: "semver", version: "7.3.7" },
  ],
  peerDependencies: [],
  devDependencies: [
    { package: "@semantic-release/changelog", version: "^6.0.1" },
    { package: "@semantic-release/exec", version: "^6.0.3" },
    { package: "@semantic-release/git", version: "^10.0.1" },
    { package: "rollup-plugin-terser", version: "^7.0.2" },
    { package: "semantic-release", version: "^19.0.2" },
  ],
};
const DIR_BASE = path.resolve(appRoot.path);

test("it should generate a JSON report", async () => {
  const { repoInfo, peerDependencies, devDependencies, dependencies } =
    mockPackageJsonObject;

  const rawData = await checkDependencies({
    peerDependencies,
    dependencies,
    devDependencies,
  });

  const jsonReport = generateJSONReportFromRawData(
    { ...rawData, disableTime: true },
    repoInfo
  );

  expect(jsonReport).toBeDefined();
  expect(jsonReport).toMatchSnapshot();
});

test.skip("it should generate a HTML report", async () => {
  const { repoInfo, peerDependencies, devDependencies, dependencies } =
    mockPackageJsonObject;

  const rawData = await checkDependencies({
    peerDependencies,
    dependencies,
    devDependencies,
  });

  const htmlReport = generateHTMLReportFromRawData(
    { ...rawData, disableTime: true },
    repoInfo
  );

  expect(htmlReport).toBeDefined();
  expect(htmlReport).toMatchSnapshot();
});

test("Should write the HTML report to disk", async () => {
  const { repoInfo, peerDependencies, devDependencies, dependencies } =
    mockPackageJsonObject;

  const rawData = await checkDependencies({
    peerDependencies,
    dependencies,
    devDependencies,
  });

  const htmlReport = generateHTMLReportFromRawData(
    { ...rawData, disableTime: true },
    repoInfo
  );

  await writeReport(htmlReport, "html", DIR_BASE);

  const expectedFilePath = path.resolve(
    DIR_BASE,
    "dependency-status-report.html"
  );
  expect(existsSync(expectedFilePath)).toBe(true);

  unlink(expectedFilePath, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
});

test("Should write the JSON report to disk", async () => {
  const { repoInfo, peerDependencies, devDependencies, dependencies } =
    mockPackageJsonObject;

  const rawData = await checkDependencies({
    peerDependencies,
    dependencies,
    devDependencies,
  });

  const jsonReport = generateHTMLReportFromRawData(
    { ...rawData, disableTime: true },
    repoInfo
  );

  await writeReport(jsonReport, "json");

  const expectedFilePath = path.resolve(
    DIR_BASE,
    "dependency-status-report.json"
  );
  expect(existsSync(expectedFilePath)).toBe(true);

  unlink(expectedFilePath, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
});

test("Write file should throw an error if data is not defined", async () => {
  try {
    await writeReport(null, "json");
  } catch (e) {
    expect(e.code).toBe("ERR_INVALID_ARG_TYPE");
  }
});
