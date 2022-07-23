// rollup.config.js
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "bin/index.js",
    output: {
      banner: "#!/usr/bin/env node",
      minifyInternalExports: true,
      inlineDynamicImports: false,
      dir: "dist/",
      format: "esm",
    },
    plugins: [terser()],
  },
  {
    input: "bin/constants.js",
    output: {
      minifyInternalExports: false,
      inlineDynamicImports: false,
      dir: "dist/",
      format: "esm",
    },
  },
];
