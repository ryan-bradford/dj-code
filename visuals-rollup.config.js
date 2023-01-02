import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";


const config = {
  input: 'src/com/ryan-bradford/visuals/index.ts',
  output: {
    format: 'cjs',
    file: "build/visuals/visuals.js"
  },
  plugins: [
    excludeDependenciesFromBundle(),
    nodeResolve({jsnext: true}),
    typescript({
       target: "es6"
    }),
    commonjs({transformMixedEsModules:true})
  ]
};

export default config;