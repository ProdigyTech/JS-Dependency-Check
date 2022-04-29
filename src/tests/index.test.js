import { getReportType } from "../../bin/index.js";
import { reportTypes } from "../enums";
import { readPackageJson } from "../readPackage.js";
import { runScript } from "../../bin/index.js";
import { existsSync, unlink } from "fs";
import path from "path";
import { BASE_DIR } from "../util/sharedUtils";

test("report type should default to HTML", () => {
  expect(getReportType()).toBe(reportTypes.HTML);
});

test("should read projects package.json", async () => {
  const { repoInfo, peerDependencies, devDependencies, dependencies } =
    await readPackageJson();

  expect(repoInfo).toBeDefined();
  expect(peerDependencies).toBeDefined();
  expect(devDependencies).toBeDefined();
  expect(dependencies).toBeDefined();
  expect(dependencies).toHaveLength(11);
  expect(repoInfo.name).toBe("@prodigytech/js-dependency-check");
});

test("should successfully run script against project and generate html file", async () => {
  await runScript();

  const expectedFilePath = path.resolve(
    BASE_DIR,
    "dependency-status-report.html"
  );
  expect(existsSync(expectedFilePath)).toBe(true);
  unlink(expectedFilePath, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
});

test(
  "should successfully run script against project and generate json file",
  async () => {
    await runScript('json');

    const expectedFilePath = path.resolve(
      BASE_DIR,
      "dependency-status-report.json"
    );
    expect(existsSync(expectedFilePath)).toBe(true);
    unlink(expectedFilePath, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
  }
);