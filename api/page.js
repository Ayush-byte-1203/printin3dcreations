const fs = require('node:fs');
const path = require('node:path');
const { renderPage, getPageMeta, safeJson } = require('../server/render.cjs');
const getCatalog = require('./_catalog');
const template = fs.readFileSync(path.join(process.cwd(), 'build/index.html'), 'utf8');

module.exports = async function page(req, res) {
    const requested = typeof req.query?.path === 'string' ? req.query.path : '';
    const pathname = '/' + requested.replace(/^\/+|\/+$/g, '');
    const query = new URLSearchParams();
    if (typeof req.query?.q === 'string') query.set('q', req.query.q.slice(0, 200));
    const location = pathname + (query.size ? '?' + query : '');
    let catalog;
    try { catalog = await getCatalog(); }
    catch (error) {
        if (pathname === '/' || pathname.startsWith('/product/')) {
            res.setHeader('Retry-After', '60');
            res.setHeader('Cache-Control', 'no-store');
            res.statusCode = 503;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Catalog temporarily unavailable | Print-IN 3D</title><h1>Catalog temporarily unavailable</h1><p>Please try again shortly or <a href="https://wa.me/917043591952">contact Print-IN 3D on WhatsApp</a>.</p></html>');
        }
        catalog = { topicsData: [], subProductsMap: {} };
    }
    const meta = getPageMeta(pathname, catalog);
    if (meta.status === 200 && !meta.noindex && new URL(meta.canonical).pathname !== pathname) {
        res.statusCode = 308;
        res.setHeader('Location', new URL(meta.canonical).pathname);
        return res.end();
    }
    if (requested.endsWith('/') && pathname !== '/') {
        res.statusCode = 308; res.setHeader('Location', location); return res.end();
    }
    const admin = pathname.startsWith('/admin') || pathname === '/696969';
    const rendered = admin ? {
        markup: '', head: '<title>Print-IN 3D</title><meta name="robots" content="noindex, nofollow" data-rh="true">'
    } : renderPage(location, catalog);
    const bootstrap = `<script id="catalog-data" type="application/json">${safeJson(catalog)}</script>`;
    const html = template.replace(/<meta name="page-head"[^>]*>/, rendered.head)
        .replace('<div id="root"></div>', `<div id="root">${rendered.markup}</div>${bootstrap}`);
    res.statusCode = meta.status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', meta.noindex ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
    if (meta.noindex || process.env.VERCEL_ENV === 'preview') res.setHeader('X-Robots-Tag', 'noindex');
    return res.end(html);
};
