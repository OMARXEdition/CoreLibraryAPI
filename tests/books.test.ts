import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import type { Server } from 'node:http';
import { app } from '../src/app.js';
import { bookService } from '../src/services/bookService.js';

let server: Server;
let baseUrl: string;
before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Unexpected server address');
  baseUrl = `http://127.0.0.1:${address.port}`;
});
after(() => server.close());

async function request(method: string, path: string, body?: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  return { status: response.status, headers: response.headers, text, body: text ? JSON.parse(text) : undefined };
}

beforeEach(() => bookService.clear());

const sample = { title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction', available: true };

test('creates a book and lists it', async () => {
  const created = await request('POST', '/books', sample);
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { id: 1, ...sample });
  assert.equal(created.headers.get('location'), '/books/1');
  const listed = await request('GET', '/books');
  assert.equal(listed.status, 200);
  assert.deepEqual(listed.body, [created.body]);
});

test('gets an existing book by id', async () => {
  await request('POST', '/books', sample);
  const response = await request('GET', '/books/1');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { id: 1, ...sample });
});

test('patches supplied fields without changing the others', async () => {
  await request('POST', '/books', sample);
  const response = await request('PATCH', '/books/1', { available: false });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { id: 1, ...sample, available: false });
});

test('deletes a book', async () => {
  await request('POST', '/books', sample);
  const deleted = await request('DELETE', '/books/1');
  assert.equal(deleted.status, 204);
  assert.equal(deleted.text, '');
  assert.deepEqual((await request('GET', '/books')).body, []);
});

test('returns 404 for unknown books and routes', async () => {
  for (const method of ['GET', 'PATCH', 'DELETE'] as const) {
    const response = await request(method, '/books/999', method === 'PATCH' ? { title: 'New' } : undefined);
    assert.equal(response.status, 404);
    assert.equal(response.body.error, 'Book not found');
  }
  assert.equal((await request('GET', '/missing')).status, 404);
});

test('rejects invalid POST and PATCH bodies', async () => {
  const invalid: Array<[string, string, unknown]> = [
    ['POST', '/books', { ...sample, title: '' }],
    ['POST', '/books', { ...sample, available: 'yes' }],
    ['POST', '/books', { ...sample, id: 4 }],
    ['PATCH', '/books/1', {}],
    ['PATCH', '/books/1', { genre: ' ' }],
    ['PATCH', '/books/1', { id: 2 }]
  ];
  for (const [method, path, body] of invalid) {
    const response = await request(method, path, body);
    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Validation failed');
    assert.ok(Array.isArray(response.body.details));
  }
});

test('rejects malformed JSON with a JSON error', async () => {
  const raw = await fetch(`${baseUrl}/books`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  const response = { status: raw.status, body: await raw.json() };
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Invalid JSON');
});
