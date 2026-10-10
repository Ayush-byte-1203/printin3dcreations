import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { faqData } from './FAQ';
import { useData } from '../context/DataContext';
import { SITE_URL, findCatalogPage, categoryPath, productPath } from '../data/catalog';

export const staticPages = {
    '/': ['3D Printing Services India & Custom Gifts | Print-IN 3D', 'Order custom 3D prints, personalized keychains, home decor and models from Print-IN 3D. Discuss your design on WhatsApp. Delivery across India.'],
    '/about': ['About Our 3D Printing Studio | Print-IN 3D', 'Meet Print-IN 3D Creations: a studio for custom 3D printed gifts, decor and prototypes. Learn about our design and printing process.'],
    '/contact': ['Get a Custom 3D Printing Quote | Print-IN 3D', 'Discuss your custom 3D printing project with Print-IN 3D on WhatsApp. Share your idea, size, colour and quantity for a quote and delivery estimate.'],
    '/faq': ['3D Printing, Orders & Delivery FAQ | Print-IN 3D', 'Answers about Print-IN 3D materials, custom quotes, ordering, UPI payments and delivery across India. Get help before ordering your 3D print.'],
    '/terms': ['Terms & Conditions | Print-IN 3D', 'Read Print-IN 3D ordering, payment, customization and delivery terms before placing an order.'],
    '/return-policy': ['Return & Refund Policy | Print-IN 3D', 'Read Print-IN 3D policies for damaged prints, customization errors, refunds, replacements and cancellations.'],
    '/search': ['Search 3D Printed Products | Print-IN 3D', 'Find keychains, home decor, models and custom 3D printed products in the Print-IN 3D catalog.']
};

export const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const concise = value => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 160);
const absoluteImage = image => {
    try { const url = new URL(image || '/favicon.webp', SITE_URL); return /^https?:$/.test(url.protocol) ? url.href : `${SITE_URL}/favicon.webp`; }
    catch { return `${SITE_URL}/favicon.webp`; }
};

export function getPageMeta(pathname, catalog) {
    const path = pathname.replace(/\/+$/, '') || '/';
    const { topic, product, isProduct } = findCatalogPage(path, catalog);
    let title, description, canonical = `${SITE_URL}${path}`, image = `${SITE_URL}/favicon.webp`;
    let status = 200;
    const noindex = path === '/search' || path.startsWith('/admin') || path === '/696969';
    if (staticPages[path]) [title, description] = staticPages[path];
    else if (topic && (!isProduct || product)) {
        title = product ? `${product.name} | Print-IN 3D` : `3D Printed ${topic.title} | Print-IN 3D`;
        description = concise(product ? `${product.desc} Order from Print-IN 3D with delivery across India.` : `${topic.fullDesc || topic.desc} Browse the Print-IN 3D collection.`);
        canonical = SITE_URL + (product ? productPath(topic, product) : categoryPath(topic));
        image = absoluteImage(product?.images?.[0] || topic.image);
    } else if (noindex) [title, description] = ['Print-IN 3D', 'Print-IN 3D Creations'];
    else { title = 'Page Not Found | Print-IN 3D'; description = 'This page or product is no longer available. Explore the current Print-IN 3D collection.'; status = 404; canonical = null; }

    const organization = { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Print-IN 3D Creations', url: `${SITE_URL}/`, logo: `${SITE_URL}/favicon.webp`, email: 'printin3dcreations@gmail.com', sameAs: ['https://www.instagram.com/printin_3dcreations/'], contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+91-7043591952' } };
    const graph = status === 200 && !noindex ? [organization, {
        '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Print-IN 3D Creations', url: `${SITE_URL}/`, publisher: { '@id': organization['@id'] }
    }, { '@type': product ? 'ItemPage' : topic ? 'CollectionPage' : path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage' : 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, isPartOf: { '@id': `${SITE_URL}/#website` }, inLanguage: 'en-IN' }] : [];

    if (graph.length && (path === '/' || path === '/contact')) graph.push({
        '@type': 'Service', name: 'Custom 3D printing', serviceType: 'Custom FDM 3D printing', provider: { '@id': organization['@id'] }, areaServed: { '@type': 'Country', name: 'India' }, url: `${SITE_URL}/contact`, description: 'Custom 3D printed gifts, decor and prototypes. Discuss your design and quote through WhatsApp.'
    });
    if (graph.length && path !== '/') {
        const crumbs = [{ name: 'Home', url: `${SITE_URL}/` }];
        if (topic) crumbs.push({ name: topic.title, url: SITE_URL + categoryPath(topic) });
        if (product) crumbs.push({ name: product.name, url: canonical });
        if (!topic) crumbs.push({ name: title.split(' | ')[0], url: canonical });
        graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })) });
    }
    if (product && status === 200) {
        const images = [...new Set([...(product.images || []), ...(product.colorOptions || []).flatMap(c => c.images || [])])].map(absoluteImage);
        const schema = { '@type': 'Product', '@id': `${canonical}#product`, name: product.name, description: product.fullDetails || product.desc, sku: product.id, url: canonical, category: topic.title, brand: { '@type': 'Brand', name: 'Print-IN 3D' }, ...(images.length ? { image: images } : {}), ...(product.specs?.material ? { material: product.specs.material } : {}) };
        // Quote-only items are never represented as free products or fabricated offers.
        if (Number.isFinite(product.price) && product.price > 0) schema.offers = { '@type': 'Offer', priceCurrency: 'INR', price: product.price, url: canonical, seller: { '@id': organization['@id'] }, itemCondition: 'https://schema.org/NewCondition' };
        graph.push(schema);
    } else if (topic && status === 200) graph.push({ '@type': 'ItemList', itemListElement: (catalog.subProductsMap[topic.id] || []).map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: SITE_URL + productPath(topic, p) })) });
    if (graph.length && (path === '/' || path === '/faq')) graph.push({ '@type': 'FAQPage', '@id': `${canonical}#faq`, mainEntity: faqData.flatMap(s => s.items).map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) });
    return { title, description, canonical, image, status, noindex: noindex || status === 404, graph };
}

export default function Seo() {
    const location = useLocation();
    const catalog = useData();
    const meta = getPageMeta(location.pathname, catalog);
    return <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
        {meta.canonical && <link rel="canonical" href={meta.canonical} />}
        <meta property="og:title" content={meta.title} /><meta property="og:description" content={meta.description} />
        <meta property="og:type" content="website" /><meta property="og:site_name" content="Print-IN 3D Creations" />
        <meta property="og:url" content={meta.canonical || SITE_URL + location.pathname} /><meta property="og:image" content={meta.image} /><meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={meta.title} /><meta name="twitter:description" content={meta.description} /><meta name="twitter:image" content={meta.image} />
        {!!meta.graph.length && <script type="application/ld+json">{safeJson({ '@context': 'https://schema.org', '@graph': meta.graph })}</script>}
    </Helmet>;
}
