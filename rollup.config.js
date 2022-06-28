// rollup.config.js
import { terser } from "rollup-plugin-terser";

export default {
  input: ["bin/index.js", "bin/constants.js"],
  plugins: [terser()],
  output: {
    banner: "#!/usr/bin/env node",
    minifyInternalExports: true,
    minifyExternalImports: true,
    inlineDynamicImports: false,
    dir: "dist/",
    format: "es",
  },
};
