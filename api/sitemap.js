const { staticPages, SITE_URL, categoryPath, productPath } = require('../server/render.cjs');
const getCatalog = require('./_catalog');
const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

module.exports = async function sitemap(req, res) {
    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
        res.statusCode = 405; res.setHeader('Allow', 'GET, HEAD'); return res.end('Method not allowed');
    }

    try {
        const catalog = await getCatalog();
        const paths = Object.keys(staticPages).filter(p => p !== '/search');
        for (const topic of catalog.topicsData) {
            paths.push(categoryPath(topic));
            for (const product of catalog.subProductsMap[topic.id] || []) paths.push(productPath(topic, product));
        }
        const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + [...new Set(paths)].map(p => `<url><loc>${escapeXml(SITE_URL + p)}</loc></url>`).join('') + '</urlset>';
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
        res.statusCode = 200; res.end(xml);
    } catch {
        res.statusCode = 503;
        res.setHeader('Cache-Control', 'no-store'); res.setHeader('Retry-After', '60');
        res.end('Catalog temporarily unavailable. Retry shortly.');
    }
};
