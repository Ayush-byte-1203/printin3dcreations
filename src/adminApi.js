import { API_BASE } from './data/catalog';
let csrf = null;
let initialization = null;
export function purgeLegacyTokens() {
    try { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_username'); } catch { /* Browser storage may be unavailable. */ }
}
export async function adminSession() {
    purgeLegacyTokens();
    if (!initialization) initialization = fetch('/api/admin/session', { credentials: 'same-origin', cache: 'no-store' })
        .then(async response => { if (!response.ok) throw new Error('Session unavailable'); const data = await response.json(); csrf = data.csrf; return data; })
        .finally(() => { initialization = null; });
    return initialization;
}
export async function adminLogin(credentials) {
    await adminSession();
    const response = await fetch('/api/admin/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(credentials) });
    const data = await response.json(); csrf = null;
    return { response, data };
}
export async function adminLogout() {
    try {
        if (!csrf) await adminSession();
        await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': csrf } });
    } finally { csrf = null; purgeLegacyTokens(); }
}
export async function adminFetch(url, options = {}) {
    purgeLegacyTokens();
    const target = new URL(url, API_BASE + '/');
    if (target.origin !== new URL(API_BASE).origin || !target.pathname.startsWith('/api/')) throw new Error('Invalid admin endpoint');
    const headers = new Headers(options.headers);
    headers.delete('Authorization');
    if (!['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) {
        if (!csrf) await adminSession();
        headers.set('X-CSRF-Token', csrf);
    }
    const response = await fetch('/api/admin/' + target.pathname.slice(5) + target.search, { ...options, headers, credentials: 'same-origin', cache: 'no-store' });
    if (response.status === 401) {
        csrf = null; window.location.replace('/696969');
        throw new Error('Your admin session has expired. Please sign in again.');
    }
    return response;
}
