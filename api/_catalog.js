const { API_BASE, normalizeCatalog } = require('../server/render.cjs');
let cached, expires = 0, pending;

module.exports = async function getCatalog() {
    if (cached && Date.now() < expires) return cached;
    if (pending) return pending;
    pending = (async () => {
        const [topicsRes, productsRes, settingsRes] = await Promise.all([
            fetch(`${API_BASE}/topics/`, { signal: AbortSignal.timeout(15000), redirect: 'error' }),
            fetch(`${API_BASE}/products/`, { signal: AbortSignal.timeout(15000), redirect: 'error' }),
            fetch(`${API_BASE}/settings/`, { signal: AbortSignal.timeout(8000), redirect: 'error' }).catch(() => null)
        ]);
        if (!topicsRes.ok || !productsRes.ok) throw new Error('Catalog API unavailable');
        const [topics, products] = await Promise.all([topicsRes.json(), productsRes.json()]);
        let siteSettings = null;
        if (settingsRes && settingsRes.ok) {
            try { siteSettings = await settingsRes.json(); } catch { /* ignore */ }
        }
        cached = { ...normalizeCatalog(topics, products), siteSettings };
        expires = Date.now() + 60000;
        return cached;
    })();
    try { return await pending; } finally { pending = null; }
};
