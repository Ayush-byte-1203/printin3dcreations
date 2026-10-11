export const API_BASE = process.env.REACT_APP_API_BASE ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:8000/api'
        : 'https://ayush1273.pythonanywhere.com/api');
export const SITE_URL = 'https://www.printin3d.in';

export const slugify = (text = '') => String(text).toLowerCase().trim()
    .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const categoryPath = topic => `/product/${topic.id}`;
export const productPath = (topic, product) => `${categoryPath(topic)}/${product.id}`;

// Both the server and browser use the same live Django catalog shape.
export function normalizeCatalog(topics, products) {
    if (!Array.isArray(topics) || !Array.isArray(products)) throw new Error('Invalid catalog response');
    const topicsData = [...topics].sort((a, b) => a.id - b.id).map(t => ({ ...t, fullDesc: t.details || t.desc }));
    const subProductsMap = Object.fromEntries(topicsData.map(t => [t.id, []]));
    products.forEach(p => {
        if (!subProductsMap[p.topic]) return;
        subProductsMap[p.topic].push({
            id: p.product_id, dbId: p.id, topicId: p.topic, name: p.name,
            price: Number(p.price), images: p.images || [], desc: p.desc || '',
            fullDetails: p.full_details || '', specs: p.specs || {}, features: p.features || [],
            customizable: !!p.customizable, customizationLabel: p.customization_label || '',
            customizationPlaceholder: p.customization_placeholder || '', customLettersLimit: p.custom_letters_limit || 50,
            hasColors: !!p.has_colors, colorOptions: p.color_options || []
        });
    });
    return { topicsData, subProductsMap };
}

export function findCatalogPage(pathname, catalog) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] !== 'product' || segments.length < 2 || segments.length > 3) return {};
    const topic = catalog.topicsData.find(t => String(t.id) === segments[1] || slugify(t.title) === segments[1]);
    const product = topic && segments[2] ? (catalog.subProductsMap[topic.id] || []).find(p =>
        String(p.id) === segments[2] || slugify(p.name) === segments[2]) : undefined;
    return { topic, product, isProduct: segments.length === 3 };
}
