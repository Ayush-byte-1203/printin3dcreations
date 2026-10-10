import { adminFetch } from './adminApi';
afterEach(() => { localStorage.clear(); jest.restoreAllMocks(); });
test('admin requests include the real token and preserve JSON headers', async () => {
  localStorage.setItem('admin_token', 'real-token');
  global.fetch = jest.fn().mockResolvedValue({ status: 200 });
  await adminFetch('/api/products/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const options = global.fetch.mock.calls[0][1];
  expect(options.headers.get('Authorization')).toBe('Token real-token');
  expect(options.headers.get('Content-Type')).toBe('application/json');
});
test('uploads allow the browser to set the multipart boundary', async () => {
  global.fetch = jest.fn().mockResolvedValue({ status: 201 });
  await adminFetch('/api/upload/', { method: 'POST', body: new FormData() });
  expect(global.fetch.mock.calls[0][1].headers.has('Content-Type')).toBe(false);
});
