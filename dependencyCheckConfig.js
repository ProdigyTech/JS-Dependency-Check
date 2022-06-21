import { ciFailKeys, reportTypes } from "./dist/constants.js"

export default {
  failOn: ciFailKeys.MAJOR,
  ignorePackages: ["eslint", "prettier"],
  reportType: reportTypes.CI,
};
