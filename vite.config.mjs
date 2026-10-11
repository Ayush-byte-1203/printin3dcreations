import { defineConfig } from 'vite';
import { transform } from 'esbuild';
export default defineConfig({
    plugins: [{ name: 'existing-jsx-components', enforce: 'pre', async transform(code, id) {
        if (/\/src\/.*\.js$/.test(id)) return transform(code, { loader: 'jsx', jsx: 'automatic', sourcemap: false });
    } }],
    build: { outDir: 'build', sourcemap: false, target: 'es2020' },
    test: { include: ['src/**/*.test.js'], environment: 'node' },
    server: { proxy: { '/api': 'http://localhost:3001' } }
});
