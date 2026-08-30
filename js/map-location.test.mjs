import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('requests the current location after MapLibre has loaded', async () => {
  const script = await readFile(new URL('./nearby-vehicles.js', import.meta.url), 'utf8');

  assert.match(script, /map\.on\('load', \(\) => \{[\s\S]*?locateUser\(\);/);
});
