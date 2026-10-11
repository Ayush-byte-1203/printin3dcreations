const { randomBytes, timingSafeEqual, createHash } = require('node:crypto');
const BACKEND = 'https://ayush1273.pythonanywhere.com/api/';
const SESSION = '__Host-printin3d_admin';
const CSRF = '__Host-printin3d_csrf';
const windows = new Map();
const MAX_BODY = 3 * 1024 * 1024 + 16384;

function cookies(req) {
    return Object.fromEntries(String(req.headers.cookie || '').split(';').map(s => s.trim().split('=')).filter(p => p.length === 2));
}
function cookie(name, value, age) { return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`; }
function respond(res, status, data) { res.statusCode = status; return res.end(JSON.stringify(data)); }
function allowedOrigin(origin) {
    if (origin === 'https://www.printin3d.in') return true;
    if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) return true;
    return process.env.NODE_ENV !== 'production' && ['http://localhost:3000', 'http://localhost:5173'].includes(origin);
}
function sameSecret(a, b) {
    return typeof a === 'string' && /^[a-f0-9]{64}$/.test(a) && typeof b === 'string' && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
function limited(key, max = 5) {
    const now = Date.now();
    for (const [k, v] of windows) if (v.until < now) windows.delete(k);
    const entry = windows.get(key) || { count: 0, until: now + 60000 };
    entry.count++; windows.set(key, entry);
    return entry.count > max;
}
async function body(req) {
    if (Number(req.headers['content-length']) > MAX_BODY) throw new Error('size');
    if (Buffer.isBuffer(req.body)) { if (req.body.length > MAX_BODY) throw new Error('size'); return req.body; }
    if (typeof req.body === 'string') { const b = Buffer.from(req.body); if (b.length > MAX_BODY) throw new Error('size'); return b; }
    if (req.body && typeof req.body === 'object') { const b = Buffer.from(JSON.stringify(req.body)); if (b.length > MAX_BODY) throw new Error('size'); return b; }
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY) throw new Error('size'); chunks.push(chunk); }
    return Buffer.concat(chunks);
}
async function imageBody(bytes, contentType) {
    const form = await new Request('https://upload.invalid/', { method: 'POST', headers: { 'Content-Type': contentType }, body: bytes }).formData();
    const files = form.getAll('image');
    if (files.length !== 1 || !(files[0] instanceof Blob)) throw new Error('image');
    const file = files[0]; const b = Buffer.from(await file.arrayBuffer());
    const jpeg = b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const png = b.length > 24 && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const webp = b.length > 16 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
    const expected = jpeg ? ['image/jpeg', /\.jpe?g$/i, 'jpg'] : png ? ['image/png', /\.png$/i, 'png'] : webp ? ['image/webp', /\.webp$/i, 'webp'] : null;
    if (!expected || file.type !== expected[0] || !expected[1].test(file.name || '') || b.length === 0 || b.length > 3 * 1024 * 1024) throw new Error('image');
    if (png && (b.readUInt32BE(16) > 8192 || b.readUInt32BE(20) > 8192)) throw new Error('image');
    // Rebuild the multipart body: never relay arbitrary fields or supplied paths.
    const clean = new FormData(); clean.append('image', new Blob([b], { type: expected[0] }), `${randomBytes(12).toString('hex')}.${expected[2]}`);
    return clean;
}

module.exports = async function admin(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    const endpoint = typeof req.query?.endpoint === 'string' ? req.query.endpoint : '';
    const method = String(req.method || 'GET').toUpperCase();
    const session = cookies(req);
    const token = session[SESSION];
    const authenticated = typeof token === 'string' && /^[a-f0-9]{40}$/.test(token);
    const safe = method === 'GET';
    const resource = /^(topics|products)\/(?:[1-9]\d*\/)?$/.test(endpoint);
    if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) { res.setHeader('Allow', 'GET, POST, PATCH, PUT, DELETE'); return respond(res, 405, { error: 'Method not allowed' }); }
    if (!resource && !['login', 'logout', 'session', 'upload/'].includes(endpoint)) return respond(res, 404, { error: 'Unknown endpoint' });
    if (!safe) {
        if (!allowedOrigin(req.headers.origin) || req.headers['sec-fetch-site'] === 'cross-site' || !sameSecret(req.headers['x-csrf-token'], session[CSRF])) return respond(res, 403, { error: 'CSRF validation failed' });
    }
    if (endpoint === 'session') {
        if (!safe) return respond(res, 405, { error: 'Method not allowed' });
        // Refuse a cross-origin browser request even on session initialization.
        if (req.headers.origin && !allowedOrigin(req.headers.origin)) return respond(res, 403, { error: 'Origin not allowed' });
        const csrf = /^[a-f0-9]{64}$/.test(session[CSRF] || '') ? session[CSRF] : randomBytes(32).toString('hex');
        res.setHeader('Set-Cookie', cookie(CSRF, csrf, 3600));
        return respond(res, 200, { authenticated, csrf });
    }
    if (endpoint === 'login' && method !== 'POST') return respond(res, 405, { error: 'Method not allowed' });
    if (endpoint !== 'login' && !authenticated) return respond(res, 401, { error: 'Sign in required' });
    if (endpoint === 'logout') {
        if (method !== 'POST') return respond(res, 405, { error: 'Method not allowed' });
        res.setHeader('Set-Cookie', [cookie(SESSION, '', 0), cookie(CSRF, '', 0)]);
        // New backends revoke the underlying token; older backends still clear the browser session.
        try { await fetch(BACKEND + 'logout/', { method: 'POST', headers: { Authorization: `Token ${token}` }, redirect: 'error', signal: AbortSignal.timeout(5000) }); } catch { /* Do not log credentials. */ }
        return respond(res, 200, { success: true });
    }
    try {
        let payload, contentType = String(req.headers['content-type'] || '');
        if (!safe) payload = await body(req);
        if (endpoint === 'login') {
            let login;
            try { login = JSON.parse(payload.toString()); } catch { return respond(res, 400, { error: 'Invalid request' }); }
            if (typeof login.username !== 'string' || !login.username.trim() || login.username.length > 150 || typeof login.password !== 'string' || !login.password || login.password.length > 1024) return respond(res, 400, { error: 'Invalid credentials' });
            if (login.otp_code && !/^\d{6}$/.test(String(login.otp_code))) return respond(res, 400, { error: 'Invalid verification code' });
            const ip = req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
            const account = createHash('sha256').update(login.username.trim().toLowerCase()).digest('hex');
            // Per-instance defense. Backend shared-cache throttles are required for distributed enforcement.
            if (limited(`ip:${ip}`) || limited(`user:${account}`)) { res.setHeader('Retry-After', '60'); return respond(res, 429, { error: 'Too many attempts. Try again in a minute.' }); }
            payload = JSON.stringify({ username: login.username, password: login.password, ...(login.otp_code ? { otp_code: login.otp_code } : {}) }); contentType = 'application/json';
        } else if (endpoint === 'upload/') {
            if (method !== 'POST' || !contentType.startsWith('multipart/form-data;')) return respond(res, 400, { error: 'Upload a JPEG, PNG or WebP image.' });
            try { payload = await imageBody(payload, contentType); } catch { return respond(res, 400, { error: 'Use a valid JPEG, PNG or WebP image up to 3 MB.' }); }
            contentType = '';
        } else if (!safe && method !== 'DELETE' && !contentType.startsWith('application/json')) return respond(res, 415, { error: 'JSON required' });
        let target = BACKEND + (endpoint === 'login' ? 'login/' : endpoint);
        if (endpoint === 'products/' && typeof req.query.topic === 'string') {
            if (!/^[1-9]\d*$/.test(req.query.topic)) return respond(res, 400, { error: 'Invalid category' });
            target += '?topic=' + req.query.topic;
        }
        const headers = { Accept: 'application/json', ...contentType && { 'Content-Type': contentType } };
        if (endpoint !== 'login') headers.Authorization = `Token ${token}`;
        const upstream = await fetch(target, { method, headers, ...(safe ? {} : { body: payload }), redirect: 'error', signal: AbortSignal.timeout(15000) });
        if (endpoint === 'login') {
            let data; try { data = await upstream.json(); } catch { return respond(res, 502, { error: 'Sign in temporarily unavailable' }); }
            if (upstream.ok && data.success && /^[a-f0-9]{40}$/.test(data.token || '')) {
                res.setHeader('Set-Cookie', [cookie(SESSION, data.token, 3600), cookie(CSRF, randomBytes(32).toString('hex'), 3600)]);
                return respond(res, 200, { success: true, username: String(data.username || '').slice(0, 150) });
            }
            return respond(res, upstream.status >= 500 ? 502 : 401, { error: 'Invalid administrator credentials or verification code', ...(data.code === 'mfa_required' ? { code: 'mfa_required' } : {}) });
        }
        if (upstream.status === 401 || upstream.status === 403) res.setHeader('Set-Cookie', cookie(SESSION, '', 0));
        if (upstream.status >= 500) return respond(res, 502, { error: 'Backend temporarily unavailable' });
        res.statusCode = upstream.status;
        if (upstream.status === 204) return res.end();
        if (!String(upstream.headers.get('content-type') || '').includes('application/json')) return respond(res, 502, { error: 'Unexpected backend response' });
        return res.end(await upstream.text());
    } catch (error) {
        return respond(res, error.message === 'size' ? 413 : 502, { error: error.message === 'size' ? 'Request too large' : 'Service temporarily unavailable' });
    }
};
module.exports._test = { sameSecret, imageBody, limited, cookies };
