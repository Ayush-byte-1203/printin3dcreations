const getCatalog = require('./_catalog');

module.exports = async function catalog(req, res) {
    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
        res.statusCode = 405; res.setHeader('Allow', 'GET, HEAD'); return res.end('Method not allowed');
    }

    try {
        const data = await getCatalog();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
        res.setHeader('X-Robots-Tag', 'noindex');
        res.end(JSON.stringify(data));
    } catch {
        res.statusCode = 503; res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Retry-After', '60'); res.end('Catalog temporarily unavailable.');
    }
};
