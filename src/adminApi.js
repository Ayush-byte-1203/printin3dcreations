export async function adminFetch(url, options = {}) {
    const headers = new Headers(options.headers);
    const token = localStorage.getItem('admin_token');
    if (token) headers.set('Authorization', `Token ${token}`);
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        window.location.replace('/696969');
        throw new Error('Your admin session has expired. Please sign in again.');
    }
    return response;
}
