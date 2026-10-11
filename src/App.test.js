import { test, expect, vi, afterEach } from 'vitest';
import { adminFetch, adminSession } from './adminApi';
const local = new Map([['admin_token', 'legacy-token']]);
vi.stubGlobal('localStorage', { removeItem: k => local.delete(k) });
vi.stubGlobal('window', { location: { replace: vi.fn() } });
afterEach(() => { vi.restoreAllMocks(); });
test('session initialization removes legacy tokens without exposing a replacement', async () => {
  local.set('admin_token', 'legacy-token');
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ authenticated: true, csrf: 'a'.repeat(64) }) });
  await adminSession();
  expect(local.has('admin_token')).toBe(false);
});
test('admin writes use same-origin credentials and CSRF rather than browser-readable tokens', async () => {
  global.fetch = vi.fn().mockResolvedValue({ status: 200 });
  await adminFetch('https://ayush1273.pythonanywhere.com/api/products/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe('/api/admin/products/');
  expect(options.headers.has('Authorization')).toBe(false);
  expect(options.headers.get('X-CSRF-Token')).toHaveLength(64);
  expect(options.credentials).toBe('same-origin');
});
test('uploads allow the browser to set the multipart boundary', async () => {
  global.fetch = vi.fn().mockResolvedValue({ status: 201 });
  await adminFetch('https://ayush1273.pythonanywhere.com/api/upload/', { method: 'POST', body: new FormData() });
  expect(global.fetch.mock.calls[0][1].headers.has('Content-Type')).toBe(false);
});
test('admin requests cannot send credentials to an arbitrary origin', async () => {
  await expect(adminFetch('https://attacker.invalid/api/products/')).rejects.toThrow('Invalid admin endpoint');
});
