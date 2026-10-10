import { build } from 'esbuild';
await build({
    entryPoints: ['src/serverRender.js'], outfile: 'server/render.cjs', bundle: true,
    platform: 'node', format: 'cjs', target: 'node22', minify: true,
    loader: { '.js': 'jsx', '.css': 'empty' },
    define: { 'process.env.NODE_ENV': '"production"' }
});
