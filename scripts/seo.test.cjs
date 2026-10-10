const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCatalog, renderPage, getPageMeta, safeJson } = require('../server/render.cjs');

const topics = [{ id: 2, title: 'Keychains', desc: 'Personalized keychains.', details: 'Choose a custom letter.' }];
const products = [
    { id: 10, product_id: '2-1', topic: 2, name: 'Custom Letter', price: '149.00', images: ['/images/letter.png'], desc: 'A personal gift.', full_details: 'PLA letter made to order.', specs: { material: 'PLA' } },
    { id: 11, product_id: '2-2', topic: 2, name: 'Custom Quote', price: 0, images: [], desc: 'Discuss a custom design.' }
];
const catalog = normalizeCatalog(topics, products);

function response() {
    return { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(body = '') { this.body = body; } };
}

test('Public pages render their content, one H1 and unique metadata without browser globals', () => {
    const titles = new Set();
    for (const path of ['/', '/about', '/contact', '/faq', '/terms', '/return-policy', '/product/2', '/product/2/2-1']) {
        const { markup, head } = renderPage(path, catalog);
        assert.equal((markup.match(/<h1\b/g) || []).length, 1, path);
        assert.equal((head.match(/<title>/g) || []).length, 1, path);
        assert.equal((head.match(/rel="canonical"/g) || []).length, 1, path);
        assert.ok(!head.includes('page-head'));
        titles.add(head.match(/<title>(.*?)<\/title>/)[1]);
    }
    assert.equal(titles.size, 8);
    const home = renderPage('/', catalog).markup;
    assert.ok(home.includes('href="/product/2"'));
    const category = renderPage('/product/2', catalog).markup;
    assert.ok(category.includes('href="/product/2/2-1"'));
    const product = renderPage('/product/2/2-1', catalog).markup;
    assert.ok(product.includes('Custom Letter') && product.includes('149'));
});

test('Product schema matches live prices and never publishes a free quote or invented rating', () => {
    const meta = getPageMeta('/product/2/2-1', catalog);
    const product = meta.graph.find(s => s['@type'] === 'Product');
    assert.equal(product.offers.price, 149);
    assert.equal(product.offers.priceCurrency, 'INR');
    assert.equal(product.image[0], 'https://www.printin3d.in/images/letter.png');
    assert.ok(!product.aggregateRating && !product.review && !product.offers.availability);
    assert.equal(getPageMeta('/product/2/2-2', catalog).graph.find(s => s['@type'] === 'Product').offers, undefined);
    assert.equal(getPageMeta('/product/keychains/custom-letter', catalog).canonical, meta.canonical);
});

test('Search and missing pages are excluded from indexing; FAQ schema matches rendered answers', () => {
    assert.equal(getPageMeta('/search', catalog).noindex, true);
    for (const p of ['/missing', '/product/999', '/product/2/missing', '/product/2/2-1/extra']) {
        const meta = getPageMeta(p, catalog); assert.equal(meta.status, 404); assert.equal(meta.noindex, true); assert.equal(meta.canonical, null);
    }
    const { markup } = renderPage('/faq', catalog);
    for (const item of getPageMeta('/faq', catalog).graph.find(s => s['@type'] === 'FAQPage').mainEntity) assert.ok(markup.includes(item.name));
    assert.ok(!markup.includes('within 12 hours'));
    assert.ok(!safeJson({ name: '</script><script>alert(1)</script>&' }).includes('<'));
});

test('Request handlers serve current catalog HTML, canonical redirects and a live sitemap', async () => {
    const savedFetch = global.fetch;
    global.fetch = async url => ({ ok: true, json: async () => String(url).includes('/topics/') ? topics : products });
    try {
        const page = require('../api/page');
        let res = response(); await page({ query: { path: 'product/2/2-1' } }, res);
        assert.equal(res.statusCode, 200); assert.ok(res.body.includes('<title>Custom Letter | Print-IN 3D</title>'));
        assert.ok(res.body.includes('id="catalog-data"')); assert.ok(!res.body.includes('page-head'));
        assert.equal((res.body.match(/<title>/g) || []).length, 1);
        res = response(); await page({ query: { path: 'product/keychains/custom-letter' } }, res);
        assert.equal(res.statusCode, 308); assert.equal(res.headers.location, '/product/2/2-1');
        res = response(); await page({ query: { path: 'missing' } }, res);
        assert.equal(res.statusCode, 404); assert.equal(res.headers['x-robots-tag'], 'noindex');
        res = response(); await page({ query: { path: 'search', q: '</script><script>bad</script>' } }, res);
        assert.equal(res.headers['x-robots-tag'], 'noindex'); assert.ok(!res.body.includes('<script>bad</script>'));
        res = response(); await require('../api/sitemap')({}, res);
        assert.equal(res.statusCode, 200); assert.ok(res.body.includes('/product/2/2-1</loc>'));
        assert.ok(!res.body.includes('/search') && !res.body.includes('/admin') && !res.body.includes('<lastmod>'));
        res = response(); await require('../api/catalog')({}, res);
        assert.equal(JSON.parse(res.body).subProductsMap[2][0].price, 149);
    } finally { global.fetch = savedFetch; }
});

test('An upstream outage returns retryable 503 rather than falsely removing products from the index', async () => {
    const savedFetch = global.fetch;
    delete require.cache[require.resolve('../api/_catalog')]; delete require.cache[require.resolve('../api/page')];
    global.fetch = async () => { throw new Error('Upstream unavailable'); };
    try {
        const page = require('../api/page');
        const res = response(); await page({ query: { path: 'product/2/2-1' } }, res);
        assert.equal(res.statusCode, 503); assert.equal(res.headers['retry-after'], '60'); assert.equal(res.headers['cache-control'], 'no-store');
        const about = response(); await page({ query: { path: 'about' } }, about); assert.equal(about.statusCode, 200);
    } finally { global.fetch = savedFetch; }
});

test('Homepage rendering takes precedence over the static React index while assets retain filesystem routing', () => {
    const config = require('../vercel.json');
    const filesystem = config.routes.findIndex(r => r.handle === 'filesystem');
    const home = config.routes.findIndex(r => r.src && !r.has && new RegExp(r.src).test('/'));
    assert.ok(home < filesystem);
    assert.equal(config.routes[home].dest, '/api/page?path=');
    assert.ok(!config.routes.slice(0, filesystem).some(r => r.src && !r.has && new RegExp(r.src).test('/static/js/main.js')));
    assert.equal(config.routes.at(-1).dest, '/api/page?path=$1');
});
