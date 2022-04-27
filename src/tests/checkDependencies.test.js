import { checkDependencies } from "../checkDependencies.js";

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

 expect(failedLookupResult).toHaveLength(1);
 expect(failedLookupResult[0].package.name).toBe(fakePackageName);
 
});
