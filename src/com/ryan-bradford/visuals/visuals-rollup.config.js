import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";
import static_files from "rollup-plugin-static-files";


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
    commonjs({transformMixedEsModules:true}),
    static_files({
        include: ['src/com/ryan-bradford/visuals/assets', 'node_modules/p5/lib']
    })
  ]
};

export default config;