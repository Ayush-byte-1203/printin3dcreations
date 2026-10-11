const { API_BASE, normalizeCatalog } = require('../server/render.cjs');
let cached, expires = 0, pending;

module.exports = async function getCatalog() {
    if (cached && Date.now() < expires) return cached;
    if (pending) return pending;
    pending = (async () => {
        const responses = await Promise.all(['topics', 'products'].map(endpoint =>
            fetch(`${API_BASE}/${endpoint}/`, { signal: AbortSignal.timeout(15000), redirect: 'error' })));
        if (responses.some(r => !r.ok)) throw new Error('Catalog API unavailable');
        const [topics, products] = await Promise.all(responses.map(r => r.json()));
        cached = normalizeCatalog(topics, products);
        expires = Date.now() + 60000;
        return cached;
    })();
    try { return await pending; } finally { pending = null; }
};
