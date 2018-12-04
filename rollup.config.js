import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss';
import { eslint } from 'rollup-plugin-eslint';

export default [
  {
    input: 'src/styles/chromecast.scss',
    external: [],
    output: {
      name: 'overlays',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      scss({
        // Filename to write all styles
        output: 'dist/chromecast-overlay.css',
        exclude: 'node_modules/**'
      })
    ],
  },

  // browser-friendly UMD build
  {
    input: 'src/js/main.js',
    output: {
      name: 'overlays',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      resolve(),
      commonjs(),
      eslint({
        exclude: [
          'src/styles/**'
        ]
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/js/main.js',
    external: [],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  }
];
