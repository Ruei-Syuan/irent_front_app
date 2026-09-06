import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('waits for the location toggle before requesting the current location', async () => {
  const script = await readFile(new URL('./nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /data-location-toggle/);
  assert.doesNotMatch(script, /fetchStationMapData\(\);\s*locateUser\(\);/);
});
