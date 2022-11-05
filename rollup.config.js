// rollup.config.js
import { terser } from "rollup-plugin-terser";

export default {
  input: ["bin/index.js"],
  plugins: [terser()],
  output: {
    banner: "#!/usr/bin/env node",
    minifyInternalExports: true,
    minifyExternalImports: true,
    inlineDynamicImports: true,
    file: "dist/index.js",
    format: "es"
  }
}
