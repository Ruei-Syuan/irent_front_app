import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('nearby vehicle rows do not render the left vehicle icon column', async () => {
  const script = await readFile(new URL('./nearby-vehicles.js', import.meta.url), 'utf8');

  assert.doesNotMatch(script, /<span class="row-car \$\{vehicleTone/);
});
