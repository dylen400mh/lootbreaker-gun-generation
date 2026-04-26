import { describe, expect, it } from 'vitest';
import { parseDamage } from './damage';

describe('parseDamage', () => {
  it('parses single term', () => {
    expect(parseDamage('1d4')).toEqual([{ count: 1, sides: 4 }]);
    expect(parseDamage('2d6')).toEqual([{ count: 2, sides: 6 }]);
  });

  it('parses sums', () => {
    expect(parseDamage('1d20 + 1d12')).toEqual([
      { count: 1, sides: 20 },
      { count: 1, sides: 12 },
    ]);
    expect(parseDamage('2d20 + 1d12')).toEqual([
      { count: 2, sides: 20 },
      { count: 1, sides: 12 },
    ]);
  });

  it('parses bonus dice notation like "+1d6"', () => {
    expect(parseDamage('+1d6')).toEqual([{ count: 1, sides: 6 }]);
    expect(parseDamage('+2d6')).toEqual([{ count: 2, sides: 6 }]);
  });

  it('ignores non-standard die sizes', () => {
    expect(parseDamage('1d3')).toEqual([]);
    expect(parseDamage('2d100')).toEqual([]);
  });

  it('returns empty array for empty/garbage input', () => {
    expect(parseDamage('')).toEqual([]);
    expect(parseDamage('lol')).toEqual([]);
  });
});
