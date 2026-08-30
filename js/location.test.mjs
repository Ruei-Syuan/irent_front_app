import test from 'node:test';
import assert from 'node:assert/strict';
import { getFallbackLocation } from './location.mjs';

test('uses Tainan Railway Station when GPS location is unavailable', () => {
  assert.deepEqual(getFallbackLocation(), {
    label: '台南市火車站',
    coordinates: [120.21228, 22.99712],
  });
});
