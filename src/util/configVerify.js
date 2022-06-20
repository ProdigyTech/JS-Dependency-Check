import { reportTypes } from "../enums.js";

export const verifyConfig = (config, reportType, reportTypeCliArg) => {
  if (!config) {
    console.log(
      `Couldn't find config options in your package.json, using default options`
    );
    return;
  } else {
    if (config.reportType && reportType && reportTypeCliArg) {
      console.log(
        "Looks like you've supplied a reportType config option and a reportType CLI arg. Ignoring the config option from Package.json"
      );
      console.log("Report Type: ", reportType);
    }

    if (config.failOn && reportType !== reportTypes.CI) {
      console.log(
        "Looks like you've added a failOn config option. This only works when the report type is CI. Ignoring..."
      );
    }
    if (config.ignorePackages) {
        console.log(
        `Ignoring the following packages... ${config.ignorePackages.join(" ")}`
        );
    }
  }
};
