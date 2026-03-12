const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  bundle: true,
  sourcemap: true,
}).catch(() => process.exit(1));
