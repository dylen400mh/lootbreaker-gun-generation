import { describe, expect, it } from 'vitest';
import { formatChestLoot, rollChest } from './chest';
import { CHEST_LOOT_TABLE } from './tables/chest/loot';
import { CHEST_SIZES, CHEST_SIZE_DICE } from './tables/chest/sizes';

describe('rollChest', () => {
  it('rolls the right number of d6s per size', () => {
    for (const size of CHEST_SIZES) {
      const chest = rollChest({ size, tier: 1, seed: 1 });
      expect(chest.rolls).toHaveLength(CHEST_SIZE_DICE[size]);
      for (const r of chest.rolls) {
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(6);
      }
    }
  });

  it('total equals the sum of the rolls', () => {
    const chest = rollChest({ size: 'Giga', tier: 2, seed: 12345 });
    expect(chest.total).toBe(chest.rolls.reduce((a, b) => a + b, 0));
  });

  it('is deterministic for a fixed seed', () => {
    const a = rollChest({ size: 'Medium', tier: 1, seed: 7 });
    const b = rollChest({ size: 'Medium', tier: 1, seed: 7 });
    expect(a).toEqual(b);
  });

  // The spec's worked example: Tier 1 row 1 = 20g, Tier 2 = 120g, Tier 3 = 220g.
  it('scales gold by +100 per tier above 1', () => {
    // Construct rolls directly off the table rather than fishing for a seed
    // that hits a specific total — the only behavior under test is the
    // gold-scaling formula.
    for (const tier of [1, 2, 3] as const) {
      // Row 1: 20g base. Easy to verify the worked example.
      const row1Gold = CHEST_LOOT_TABLE[1].gold;
      const expected = row1Gold + (tier - 1) * 100;
      // Seed that produces total=1 on Small. The mulberry32 stream's first
      // d6 is the seed-dependent part — we cycle small seeds until we find
      // one that rolls a 1 to avoid coupling the test to a magic number.
      let seed = 0;
      let chest = rollChest({ size: 'Small', tier, seed });
      while (chest.total !== 1 && seed < 10_000) {
        seed += 1;
        chest = rollChest({ size: 'Small', tier, seed });
      }
      expect(chest.total).toBe(1);
      expect(chest.gold).toBe(expected);
    }
  });

  it('does not scale gold on rows that have no gold', () => {
    // Row 2 ("Common Potion") and row 3 ("Common Trinket") are gold-less.
    // The spec's "+100 per Tier" applies only to existing gold amounts.
    for (const target of [2, 3]) {
      let seed = 0;
      let chest = rollChest({ size: 'Small', tier: 3, seed });
      while (chest.total !== target && seed < 10_000) {
        seed += 1;
        chest = rollChest({ size: 'Small', tier: 3, seed });
      }
      expect(chest.total).toBe(target);
      expect(chest.gold).toBe(0);
    }
  });

  it('returns the verbatim spec items for the rolled total', () => {
    const chest = rollChest({ size: 'Giga', tier: 1, seed: 1 });
    expect(chest.items).toBe(CHEST_LOOT_TABLE[chest.total].items);
  });
});

describe('formatChestLoot', () => {
  it('joins gold and items with " + "', () => {
    expect(
      formatChestLoot({
        size: 'Small',
        tier: 2,
        rolls: [4],
        total: 4,
        gold: 130,
        items: 'Common Health Potion',
      }),
    ).toBe('130g + Common Health Potion');
  });

  it('skips gold when zero', () => {
    expect(
      formatChestLoot({
        size: 'Small',
        tier: 1,
        rolls: [2],
        total: 2,
        gold: 0,
        items: 'Common Potion',
      }),
    ).toBe('Common Potion');
  });

  it('skips items when empty', () => {
    expect(
      formatChestLoot({
        size: 'Small',
        tier: 1,
        rolls: [1],
        total: 1,
        gold: 20,
        items: '',
      }),
    ).toBe('20g');
  });
});
