import  { ciFailKeys, reportTypes } from "./bin/constants.js";

export default process.env == "CI"
  ? {
      failOn: ciFailKeys.NONE,
      ignorePackages: [
        "eslint",
        "prettier",
        "eslint-plugin-jsx-a11y",
        "eslint-plugin-prettier",
        "@babel/preset-env"
      ],
      reportType: reportTypes.CI,
    }
  : {
      failOn: ciFailKeys.NONE,
      ignorePackages: [
        "eslint",
        "prettier",
        "eslint-plugin-jsx-a11y",
        "eslint-plugin-prettier",
        "@babel/preset-env"
      ],
    };
