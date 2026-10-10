import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppContent } from './App';
import { DataProvider } from './context/DataContext';
import { CartProvider } from './context/CartContext';
import { getPageMeta, safeJson, staticPages } from './components/Seo';
export { getPageMeta, safeJson, staticPages };
export { normalizeCatalog, findCatalogPage, categoryPath, productPath, SITE_URL, API_BASE } from './data/catalog';

export function renderPage(location, catalog) {
    const document = renderToString(<html lang="en"><head /><body><div id="root"><HelmetProvider>
        <MemoryRouter initialEntries={[location]}><DataProvider initialData={catalog}>
            <CartProvider><AppContent isCheckoutOpen={false} setIsCheckoutOpen={() => {}} /></CartProvider>
        </DataProvider></MemoryRouter>
    </HelmetProvider></div></body></html>);
    // React 19 moves document metadata into <head> during rendering.
    const head = document.match(/<head>([\s\S]*?)<\/head>/)?.[1] || '';
    const markup = document.match(/<div id="root">([\s\S]*)<\/div><\/body><\/html>$/)?.[1];
    if (markup === undefined) throw new Error('Server render did not produce a root');
    return { markup, head };
}
