import test from 'node:test';
import assert from 'node:assert/strict';
import { BOTANICAL_PALETTES, getPalette } from './palettes.ts';

test('BOTANICAL_PALETTES has exactly 10 palettes', () => {
  assert.equal(BOTANICAL_PALETTES.length, 10);
});

test('All 10 requested palettes exist by required IDs', () => {
  const expectedIds = [
    'rose-garden',
    'sakura-dream',
    'midnight-bloom',
    'golden-meadow',
    'lavender-fields',
    'crimson-romance',
    'ocean-botanica',
    'vintage-botanical',
    'tropical-bloom',
    'monochrome-garden',
  ];

  for (const id of expectedIds) {
    const p = BOTANICAL_PALETTES.find((pal) => pal.id === id);
    assert.ok(p, `Missing expected palette ID: ${id}`);
    assert.ok(p.name.length > 0);
    assert.ok(p.stemColors.length > 0);
    assert.ok(p.rosePetalPalette.length >= 4);
    assert.ok(p.flowerColors.length >= 1);
  }
});

test('getPalette falls back to first palette on unknown ID', () => {
  const p = getPalette('non-existent-xyz');
  assert.equal(p.id, 'rose-garden');
});
