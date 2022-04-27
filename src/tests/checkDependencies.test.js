import { checkDependencies, getDefinedVersion } from "../checkDependencies.js";

const dependenciesMock = {
  peerDependencies: [],
  devDependencies: [],
  dependencies: [],
};

test("check dependencies and the result should be empty", async () => {
  expect(await checkDependencies(dependenciesMock)).toStrictEqual({
    dependenciesResult: [],
    devDependenciesResult: [],
    failedLookupResult: [],
    peerDependenciesResult: [],
  });
});

test("Unknown dev dependency should fail lookup", async () => {

  const fakePackageName = "some_random_js_package-100";
  const mockedDevDependency = [
    { package: fakePackageName, version: "^2.0.0" },
  ];

  const data = await checkDependencies({
    ...dependenciesMock,
    devDependencies: mockedDevDependency,
  });

  const { failedLookupResult } = data;
 expect(failedLookupResult[0].package.error).toBe(true)
 expect(failedLookupResult).toHaveLength(1);
 expect(failedLookupResult[0].package.name).toBe(fakePackageName);
});

test("known dev dependency should have successful lookup", async () => {
  const packageName = "@semantic-release/git";
  const mockedDevDependency = [{ package: packageName, version: "^10.0.1" }];

  const data = await checkDependencies({
    ...dependenciesMock,
    devDependencies: mockedDevDependency,
  });

  const { failedLookupResult, devDependenciesResult } = data;

  expect(failedLookupResult).toHaveLength(0);
  expect(devDependenciesResult[0].package.name).toBe(packageName);
  expect(devDependenciesResult[0].package.error).toBe(false);
   expect(devDependenciesResult[0].package.current.version).toBe("10.0.1");
});

test("method should return a numeric value when passed a version with the leading character that is not a number", () => {
  const mock = {version: "^2.34.0"}
  const version = getDefinedVersion(mock)
  expect(version).toBe("2.34.0")
})