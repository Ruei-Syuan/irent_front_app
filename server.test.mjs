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

test('renders nearby vehicles after the initial layout without a manual refresh control', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /requestAnimationFrame\(\(\) => renderVehicleList\(\)\);/);
  assert.ok(!markup.includes('data-refresh-vehicles'));
  assert.ok(!script.includes('refreshVehiclesButton'));
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

test('loads public station API data into MapLibre station markers', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(script.includes("apiUrl('/api/v1/stations')"));
  assert.ok(script.includes("map.addSource('irent-stations'"));
  assert.ok(script.includes("map.on('click', 'station-circle'"));
  assert.ok(script.includes('fetchStationMapData();'));
});


test('uses the vehicle plate and station address in nearby vehicle rows', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /properties.stationAddress/);
  assert.ok(script.includes('<strong>${escapeHtml(properties.plateNumber)}</strong>'));
});


test('calculates nearby vehicle distance and walking time from the current location', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(script.includes('function distanceBetweenMeters('));
  assert.ok(script.includes('Math.ceil(distanceMeters / 80)'));
  assert.ok(script.includes('renderVehicleList();'));
  assert.doesNotMatch(script, /index * 2 + 2/);
});


test('shows kilometres above one calculated green walking-time label', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');

  assert.ok(script.includes('class="row-walk-minutes"'));
  assert.ok(script.includes('約 ${escapeHtml(walkMinutes)} 分鐘'));
  assert.ok(script.includes('(distanceMeters / 1000).toFixed(1)'));
  assert.match(styles, /.row-walk-minutes/);
});


test('removes rental pricing and makes nearby distance prominent', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');

  assert.ok(!script.includes('$${escapeHtml(properties.rate)}'));
  assert.ok(styles.includes('.row-rate .row-distance { color: #112f58; font-size: 20px;'));
});


test('keeps only the three shortest-walk nearby vehicles and removes the AI card', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(!markup.includes('<div class="ai-recommendation">'));
  assert.ok(script.includes('function nearbyVehicleFeatures()'));
  assert.ok(script.includes('left.metrics.walkMinutes - right.metrics.walkMinutes'));
  assert.ok(script.includes('.slice(0, 3)'));
});


test('uses the nearby list vehicles as MapLibre markers', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /function nearbyVehicleMapData\(\)/);
  assert.match(script, /map\.addSource\('vehicles', \{ type: 'geojson', data: nearbyVehicleMapData\(\) \}\)/);
  assert.match(script, /map\.getSource\('vehicles'\)\.setData\(nearbyVehicleMapData\(\)\)/);
});


test('keeps the map visible and centers it on the selected red flag location', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /row\.addEventListener\('click', \(\) => \{\s*selectVehicle\(properties\.id, true\);\s*\}\);/);
  assert.match(script, /fill=\"#e31818\"/);
  assert.match(script, /'icon-anchor': 'bottom'/);
});


test('keeps the browser script parseable after changing vehicle markers', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.doesNotThrow(() => new Function(script.replace(/^import[^\n]*\n/, '')));
});


test('shows plate, status, and kilometres in the vehicle map card', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(!script.includes('健康 ${escapeHtml(properties.healthScore)} 分'));
  assert.ok(script.includes('vehicleStatusLabel(properties.status)'));
  assert.ok(script.includes('(distanceMeters / 1000).toFixed(1)'));
});


test('requires selecting a nearby vehicle before enabling the vehicle-status action', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');

  assert.match(markup, /data-quick-rent[^>]*disabled/);
  assert.ok(script.includes('let selectedVehicleId = null'));
  assert.ok(script.includes('quickRentButton.disabled = !hasSelection'));
  assert.ok(styles.includes('.nearby-row.is-selected { background: #e8f8f3;'));
});
