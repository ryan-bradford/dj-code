import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';

const config = {
  input: 'launchpad-mkii/index.js',
  output: {
    format: 'esm',
    file: "build/launchpad-mkii.js"
  },
  plugins: [
    babel({ babelHelpers: 'bundled' }),
  ]
};

export default config;