import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import static_files from "rollup-plugin-static-files";

const config = {
  input: 'src/com/ryan-bradford/xone-k2/index.ts',
  output: {
    format: 'cjs',
    file: "build/xone-k2/xone-k2.js"
  },
  plugins: [
    nodeResolve({browser: true, preferBuiltins: false}),
    typescript(),
    commonjs()
  ]
};

export default config;