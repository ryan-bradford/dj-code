import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from "@rollup/plugin-babel";


const config = {
  input: 'src/com/ryan-bradford/launchpad-mkii/index.ts',
  output: {
    format: 'cjs',
    file: "build/mkii/launchpad-mkii.js"
  },
  plugins: [
    nodeResolve({browser: true, preferBuiltins: false}),
    typescript({
        target: 'es5'
    }),
    commonjs(),
    babel()
  ]
};

export default config;