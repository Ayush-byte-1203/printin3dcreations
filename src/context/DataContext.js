import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE, normalizeCatalog } from '../data/catalog';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children, initialData = null }) => {
    const [catalog, setCatalog] = useState(initialData || { topicsData: [], subProductsMap: {} });
    const [loading, setLoading] = useState(!initialData);
    const [isBackendOnline, setIsBackendOnline] = useState(!!initialData);
    const refreshData = async () => {
        try {
            let data;
            if (process.env.NODE_ENV === 'development' || window.location.pathname.startsWith('/admin')) {
                const responses = await Promise.all(['topics', 'products'].map(endpoint =>
                    fetch(`${API_BASE}/${endpoint}/`, { signal: AbortSignal.timeout(15000) })));
                if (responses.some(r => !r.ok)) throw new Error('Catalog API unavailable');
                const [topics, products] = await Promise.all(responses.map(r => r.json()));
                data = normalizeCatalog(topics, products);
            } else {
                const response = await fetch('/api/catalog', { signal: AbortSignal.timeout(20000) });
                if (!response.ok) throw new Error('Catalog API unavailable');
                data = await response.json();
                if (!Array.isArray(data.topicsData) || !data.subProductsMap) throw new Error('Invalid catalog response');
            }
            setCatalog(data);
            setIsBackendOnline(true);
        } catch (err) {
            console.warn('Catalog refresh unavailable', err);
            // Keep the last successfully fetched live catalog during a transient outage.
            setIsBackendOnline(false);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { refreshData(); }, []);
    return <DataContext.Provider value={{ ...catalog, loading, isBackendOnline, refreshData }}>
        {!loading && !isBackendOnline && <div role="alert" style={{ padding: '12px', textAlign: 'center' }}>
            The product catalog could not be refreshed. Please confirm prices and availability on WhatsApp.
            <button onClick={refreshData}>Retry</button>
        </div>}
        {children}
    </DataContext.Provider>;
};
