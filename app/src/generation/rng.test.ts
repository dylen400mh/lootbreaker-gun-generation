import { describe, expect, it } from 'vitest';
import { d, mulberry32, rollN } from './rng';

describe('mulberry32', () => {
  it('produces a stable sequence for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 4 }, mulberry32(1));
    const b = Array.from({ length: 4 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });
});

describe('d()', () => {
  it('always returns values in [1, sides]', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 1000; i += 1) {
      const v = d(rng, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it('covers the full range across many trials', () => {
    const rng = mulberry32(99);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i += 1) seen.add(d(rng, 8));
    expect(seen.size).toBe(8);
  });
});

describe('rollN()', () => {
  it('returns the requested number of dice', () => {
    const rng = mulberry32(7);
    expect(rollN(rng, 4, 6)).toHaveLength(4);
  });
});
