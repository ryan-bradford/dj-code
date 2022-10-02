import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const config = {
  input: 'src/com/ryan-bradford/launchpad-mkii/index.ts',
  output: {
    format: 'cjs',
    file: "build/launchpad-mkii.js"
  },
  plugins: [
    nodeResolve({browser: true, preferBuiltins: false}),
    typescript(),
    commonjs()
  ]
};

export default config;