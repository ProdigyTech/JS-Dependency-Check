const reportTypes = {
  JSON: "JSON",
  HTML: "HTML",
  CI: "CI",
};
const ciFailKeys = {
  MAJOR: "MAJOR",
  MINOR: "MINOR",
  PREMAJOR: "PREMAJOR",
  PREMINOR: "PREMINOR",
  PREPATCH: "PREPATCH",
  PRERELEASE: "PRERELEASE",
  PATCH: "PATCH",
  DEFAULT: "MINOR",
  NONE: "NONE"
};

export { ciFailKeys, reportTypes };
