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
  const html = await (await fetch(baseUrl)).text();
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(html, /data-current-location-label/);
  assert.match(script, /currentLocationLabel\.textContent/);
});

test('shows an explicit location toggle', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-location-toggle/);
  assert.match(markup, /\u958b\u555f\u5b9a\u4f4d/);
  assert.match(styles, /\.location-toggle/);
  assert.match(script, /locationToggle\?\.addEventListener\('change'/);
});

test('removes location search controls while keeping the location toggle', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.doesNotMatch(markup, /data-vehicle-search/);
  assert.doesNotMatch(markup, /data-vehicle-search-form/);
  assert.match(markup, /data-location-toggle/);
  assert.doesNotMatch(script, /searchInput/);
  assert.doesNotMatch(script, /submitLocationSearch/);
  assert.match(script, /function nearbyVehicleFeatures\(\)/);
});
test('lets members choose pickup time and rental hours with live price updates', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-rental-start-time/);
  assert.match(markup, /data-rental-hours/);
  assert.doesNotMatch(markup, /data-rental-hours[^>]*max=/);
  assert.doesNotMatch(markup, /data-rental-end-time/);
  assert.match(markup, /data-order-detail-start-time/);
  assert.match(markup, /data-order-detail-end-time/);
  assert.match(markup, /data-order-estimated-price/);
  assert.match(script, /const rentalHoursInput/);
  assert.match(script, /function estimatedRentalPrice/);
  assert.match(script, /const fullDays = Math\.floor/);
  assert.match(script, /Math\.min\(.*980/);
  assert.match(script, /rentalHoursInput\?\.addEventListener\('input'/);
  const priceFunction = script.match(/function estimatedRentalPrice\(totalMinutes\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(priceFunction);
  const calculatePrice = new Function(priceFunction + '; return estimatedRentalPrice;')();
  assert.equal(calculatePrice(120), 384);
  assert.equal(calculatePrice(24 * 60), 980);
  assert.equal(calculatePrice(24 * 60 + 30), 1076);
});
test('removes the order-note card from order confirmation', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(markup, /order-note-card/);
});
test('stores a member rental before returning to the nearby view', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-rental-start/);
  assert.match(script, /function submitMemberRental/);
  assert.ok(script.includes("memberApiUrl('/api/v1/member-auth/rentals')"));
  assert.ok(script.includes("setActiveView('nearby')"));
});
test('removes the pickup-location map from order confirmation', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const confirmation = markup.match(/data-view-panel="order-confirm"[\s\S]*?<\/section>/)?.[0];

  assert.ok(confirmation);
  assert.doesNotMatch(confirmation, /order-mini-map/);
});
test('removes the pickup-location map from order details', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const details = markup.match(/data-view-panel="order-detail"[\s\S]*?<\/section>/)?.[0];

  assert.ok(details);
  assert.doesNotMatch(details, /order-mini-map/);
});
test('moves the inspection-mode selection frame to the selected option', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-inspection-mode="open"/);
  assert.match(markup, /data-inspection-mode="tight"/);
  assert.match(script, /function setInspectionMode\(mode\)/);
  assert.match(script, /button\.classList\.toggle\('is-selected', isSelected\)/);
  assert.match(script, /button\.setAttribute\('aria-pressed', String\(isSelected\)\)/);
  assert.match(script, /inspectionModeButtons\.forEach\(\(button\) => button\.addEventListener\('click'/);
});

test('adds a pickup entry in the function menu that opens the order details', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-menu-action data-pickup-menu data-view="order-detail"/);
  assert.match(markup, /取車/);
  assert.match(script, /isTakeCarFlow && button\.hasAttribute\('data-pickup-menu'\)/);
});

test('loads database rental records with the three pickup statuses', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /function loadMemberRentalHistory\(\)/);
  assert.ok(script.includes("memberApiUrl('/api/v1/member-auth/rentals')"));
  assert.match(script, /pending_pickup: '\u5c1a\u672a\u53d6\u8eca'/);
  assert.match(script, /active: '\u79df\u501f\u4e2d'/);
  assert.match(script, /completed: '\u5df2\u9084\u8eca'/);
  assert.ok(script.includes("updateMemberRentalStatus('active')"));
  assert.ok(script.includes("updateMemberRentalStatus('completed')"));
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
  assert.ok(script.includes('walkMinutes'));
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

test('renders vehicle-status details from the selected vehicle plate', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-vehicle-detail-name/);
  assert.match(markup, /data-vehicle-detail-plate/);
  assert.ok(script.includes('function vehicleDetailForPlate(plateNumber)'));
  assert.ok(script.includes('vehicleDetailForPlate(properties.plateNumber)'));
  assert.ok(script.includes("setActiveView('vehicle')"));
});
test('removes the vehicle detail more-information section', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');

  assert.ok(!markup.includes('class="more-info-bar"'));
});
test('removes the vehicle detail current-location card', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(!markup.includes('class="current-location-card"'));
  assert.ok(!script.includes("document.querySelector('.current-location-card"));
});
test('prefers the vehicle type for the vehicle detail title', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(script.includes('function vehicleTypeName(properties, index)'));
  assert.ok(script.includes('properties.vehicleTypeName'));
  assert.ok(script.includes('vehicleTypeName(properties, index)'));
});

test('removes the vehicle detail cartoon car illustration', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');

  assert.ok(!markup.includes('class="vehicle-hero-car"'));
});

test('compacts the vehicle detail area after removing the car illustration', async () => {
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');

  assert.match(styles, /\.vehicle-detail-hero\s*\{[^}]*height: 56px;/);
});
test('shows up to five latest vehicle maintenance records', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-maintenance-history-list/);
  assert.ok(script.includes('function loadMaintenanceHistory(vehicleId)'));
  assert.ok(script.includes('.slice(0, 5)'));
  assert.ok(script.includes('loadMaintenanceHistory(properties.id)'));
});

test('uses operational maintenance records instead of legacy vehicle services', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(script.includes('maintenanceHistoryMarkup(payload?.maintenanceRecords)'));
});
test('loads exterior and cabin conditions from the selected vehicle API', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(!script.includes('const vehicleStatusByPlate'));
  assert.ok(script.includes('function loadVehicleCondition(vehicleId, properties)'));
  assert.ok(script.includes('/api/v1/vehicles/${encodeURIComponent(vehicleId)}'));
  assert.ok(script.includes('payload?.item'));
  assert.ok(script.includes('loadVehicleCondition(properties.id, properties)'));
});
test('loads per-plate condition photos with default image fallbacks', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(markup, /data-vehicle-condition-photo="exterior"/);
  assert.match(markup, /data-vehicle-condition-photo="cabin"/);
  assert.ok(script.includes('function loadVehicleConditionPhoto(type, plateNumber)'));
  assert.ok(script.includes("assets/vehicle-exterior-condition/default.png"));
  assert.ok(script.includes("assets/vehicle-cabin-condition/default.png"));
  assert.ok(script.includes("loadVehicleConditionPhoto('exterior', properties.plateNumber)"));
  assert.ok(script.includes("loadVehicleConditionPhoto('cabin', properties.plateNumber)"));
});
test('uses website asset URLs for Nissan Kicks condition photos', async () => {
  const script = await readFile(new URL('./js/nearby-vehicles.js', import.meta.url), 'utf8');

  assert.ok(script.includes("'/assets/vehicle-exterior-condition/RVC-4360_20260904_005519_front.png'"));
  assert.ok(script.includes("'/assets/vehicle-cabin-condition/RVC-4360_20260904_005519_front-cabin.png'"));
  assert.ok(script.includes("'/assets/vehicle-exterior-condition/default.png'"));
  assert.ok(script.includes("'/assets/vehicle-cabin-condition/default.png'"));
});
test('serves Nissan Kicks condition images through the website assets path', async () => {
  const response = await fetch(`${baseUrl}/assets/vehicle-exterior-condition/RVC-4360_20260904_005519_front.png`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/png');
});
test('places the vehicle favorite control beside the health score', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');

  assert.match(markup, /<div class="vehicle-detail-score">[\s\S]*?<button class="favorite-button"/);
  assert.ok(!markup.includes('<div class="vehicle-detail-hero">\n          <button class="favorite-button"'));
  assert.match(styles, /\.vehicle-detail-score\s*\{[^}]*position: relative;/);
  assert.match(styles, /\.vehicle-detail-score \.favorite-button\s*\{[^}]*position: absolute;[^}]*right: 0;/);
});

test('uses cute green icons for vehicle detail status cards', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const styles = await readFile(new URL('./css/nearby-vehicles.css', import.meta.url), 'utf8');

  for (const iconName of ['maintenance', 'price', 'exterior', 'cabin']) {
    assert.match(markup, new RegExp(`class="card-icon card-icon--${iconName}"`));
  }
  assert.match(styles, /\.card-icon\s*\{[^}]*background: #00a49b;/);
  assert.match(styles, /\.card-icon svg\s*\{[^}]*stroke: #fff;/);
});
test('removes the maintenance history full-records action', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');

  assert.ok(!markup.includes('maintenance-history-all'));
});
test('uses a seat silhouette for the cabin-condition icon', async () => {
  const markup = await readFile(new URL('./index.html', import.meta.url), 'utf8');

  assert.match(markup, /card-icon--cabin[^>]*><svg[^>]*><path d="M7 4v9m0-9h3a4 4 0 0 1 4 4v5H7m7 0h3a2 2 0 0 1 2 2v2H5m2 0v3m10-3v3"/);
});
