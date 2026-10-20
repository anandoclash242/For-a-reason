import test from 'node:test';
import assert from 'node:assert/strict';
import { PRNG, hashString } from './prng.ts';

test('PRNG produces deterministic sequence with identical seed', () => {
  const rng1 = new PRNG(12345);
  const rng2 = new PRNG(12345);

  const seq1 = [rng1.next(), rng1.next(), rng1.next(), rng1.range(10, 20)];
  const seq2 = [rng2.next(), rng2.next(), rng2.next(), rng2.range(10, 20)];

  assert.deepEqual(seq1, seq2);
});

test('PRNG produces different sequences with different seeds', () => {
  const rng1 = new PRNG(100);
  const rng2 = new PRNG(200);

  assert.notEqual(rng1.next(), rng2.next());
});

test('PRNG range and int return values within requested bounds', () => {
  const rng = new PRNG(999);
  for (let i = 0; i < 50; i++) {
    const val = rng.range(5, 15);
    assert.ok(val >= 5 && val <= 15, `range value ${val} out of bounds`);
    const intVal = rng.int(2, 8);
    assert.ok(intVal >= 2 && intVal <= 8, `int value ${intVal} out of bounds`);
    assert.equal(intVal, Math.floor(intVal));
  }
});

test('hashString returns stable positive hash', () => {
  const h1 = hashString('Rose');
  const h2 = hashString('Rose');
  const h3 = hashString('Sakura');

  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
  assert.ok(h1 > 0);
});
