import path from "path";
import appRoot from "app-root-path";
import { readFile, transformDependencyObject } from "../util/sharedUtils";
import { mockPackageJsonObject } from "./utils";

const DIR_BASE = path.resolve(appRoot.path);

test("Should read file and return data", async () => {
  const pathToRead = path.resolve(DIR_BASE, "package.json");
  const data = await readFile({ path: pathToRead });
  expect(data).toBeDefined();
});

test("Should throw an error reading a non existent file", async () => {
  const pathToRead = path.resolve(DIR_BASE, "fakePackage.json");
  try {
    await readFile({ path: pathToRead });
  } catch (e) {
    expect(e.code).toBe("ENOENT");
  }
});

test("should transform the package.json", async () => {
  const pathToRead = path.resolve(DIR_BASE, "package.json");
  const data = JSON.parse(await readFile({ path: pathToRead }));

  const { dependencies } = data;
  const transformDependency = transformDependencyObject(dependencies);
  expect(transformDependency).toEqual(mockPackageJsonObject.dependencies);
});
