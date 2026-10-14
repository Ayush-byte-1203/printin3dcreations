import { defineConfig } from 'vite';
import { transform } from 'esbuild';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const adminProxy = require('./lib/adminProxy.cjs');

if (!process.env.BACKEND_API) {
    process.env.BACKEND_API = 'http://127.0.0.1:8000/api/';
}

export default defineConfig({
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    plugins: [
        {
            name: 'existing-jsx-components',
            enforce: 'pre',
            async transform(code, id) {
                if (/\/src\/.*\.js$/.test(id)) return transform(code, { loader: 'jsx', jsx: 'automatic', sourcemap: false });
            }
        },
        {
            name: 'admin-proxy-dev',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    if (req.url && req.url.startsWith('/api/admin')) {
                        const parsed = new URL(req.url, 'http://localhost:3000');
                        const endpoint = parsed.pathname.replace(/^\/api\/admin\/?/, '');
                        req.query = { endpoint };
                        for (const [k, v] of parsed.searchParams.entries()) {
                            req.query[k] = v;
                        }
                        try {
                            delete require.cache[require.resolve('./lib/adminProxy.cjs')];
                            const devProxy = require('./lib/adminProxy.cjs');
                            await devProxy(req, res);
                        } catch (err) {
                            console.error('adminProxy dev error:', err);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: err.message }));
                        }
                        return;
                    }
                    next();
                });
            }
        }
    ],
    build: { outDir: 'build', sourcemap: false, target: 'es2020' },
    define: { 'process.env': {} },
    test: { include: ['src/**/*.test.js'], environment: 'node' }
});
