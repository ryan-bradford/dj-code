import { babel } from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';

const config = {
  input: 'src/com/ryan-bradford/launchpad-mkii/index.ts',
  output: {
    format: 'cjs',
    file: "build/launchpad-mkii.js"
  },
  plugins: [
    babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    typescript()
  ]
};

export default config;