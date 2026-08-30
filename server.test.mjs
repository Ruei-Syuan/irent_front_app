import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { startServer } from './server.mjs';

let server;
let baseUrl;

test.before(async () => {
  server = await startServer({ host: '127.0.0.1', port: 0 });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
}));

test('serves index.html from the current folder root', async () => {
  const response = await fetch(`${baseUrl}/`);

  assert.equal(response.status, 200);
  assert.match(await response.text(), /<!doctype html>/i);
});

test('keeps the existing /front_app/ URL working', async () => {
  const response = await fetch(`${baseUrl}/front_app/`);

  assert.equal(response.status, 200);
  assert.match(await response.text(), /<title>/i);
});

test('returns 404 for files that do not exist', async () => {
  const response = await fetch(`${baseUrl}/missing-file.html`);

  assert.equal(response.status, 404);
});

test('serves the in-app feedback surface', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();

  assert.match(html, /data-app-toast/);
});

test('renders nearby vehicles after the initial layout and refreshes their API data', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /requestAnimationFrame\(\(\) => renderVehicleList\(\)\);/);
  assert.match(script, /refreshVehiclesButton\.addEventListener\('click', async \(\) => \{[\s\S]*?await fetchVehicleMapSummary\(\);/);
});

test('does not stop homepage initialization when the removed cabin-next button is absent', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /scanCabinNext\?\.addEventListener\(/);
});

test('shows the detected location below nearby recommendations', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(html, /data-current-location-label[^>]*>目前位置：台南火車站</);
  assert.match(script, /currentLocationLabel\.textContent = `目前位置：已定位（\$\{latitude\.toFixed\(5\)\}, \$\{longitude\.toFixed\(5\)\}）`/);
});

test('adds a top-right member account control wired to the member auth API', async () => {
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');

  assert.match(html, /data-member-menu/);
  assert.match(html, /data-member-name/);
  assert.match(html, /data-member-status/);
  assert.match(html, /data-member-login/);
  assert.match(html, /data-member-logout/);
  assert.match(script, /const MEMBER_API_BASE_URL =/);
  assert.ok(script.includes('window.location.hostname'));
  assert.ok(script.includes('/api/v1/member-auth/me'));
  assert.ok(script.includes('/api/v1/member-auth/login'));
  assert.ok(script.includes('/api/v1/member-auth/logout'));
  assert.match(styles, /\.member-menu/);
});
test('provides a toggle that can reveal the login password', async () => {
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(html, /data-login-password-toggle/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(script, /loginPasswordToggle\?\.addEventListener\('click'/);
  assert.match(script, /loginPasswordInput\.type = isPasswordVisible \? 'text' : 'password'/);
});
