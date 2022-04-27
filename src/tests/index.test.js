import { getReportType } from "../../bin/index.js";
import { reportTypes } from "../enums";
import { readPackageJson } from "../../src/readPackage.js";

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
  expect(dependencies).toHaveLength(6)
  expect(repoInfo.name).toBe("@prodigytech/js-dependency-check");
});
