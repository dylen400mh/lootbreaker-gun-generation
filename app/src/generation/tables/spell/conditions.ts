// Source: spec Step 7 / 7a / 7b (Offensive) — Conditions and Keywords.
// 7  : per-tier × rarity matrix of PER-SLOT % chance (slots 1/2/3).
// 7a : 2d8 keyword table with per-condition MP cost (re-roll duplicates).
// 7b : per-tier × rarity matrix of per-slot duration.
import type { Rarity, Tier } from '../../types';

// 2d8 sum (2..16) → condition. Indexed by sum − 2.
export const CONDITION_BY_2D8: ReadonlyArray<{ name: string; mpCost: number }> = [
  { name: 'Affliction (Matching Damage Type)', mpCost: 1 }, // 2
  { name: 'Blind', mpCost: 2 },                              // 3
  { name: 'Broken', mpCost: 2 },                             // 4
  { name: 'Charmed', mpCost: 2 },                            // 5
  { name: 'Cursed', mpCost: 1 },                             // 6
  { name: 'Exploited', mpCost: 1 },                          // 7
  { name: 'Hexed', mpCost: 1 },                              // 8
  { name: 'Pull', mpCost: 1 },                               // 9
  { name: 'Push', mpCost: 1 },                               // 10
  { name: 'Slow', mpCost: 1 },                               // 11
  { name: 'Spooked', mpCost: 2 },                            // 12
  { name: 'Stunned', mpCost: 3 },                            // 13
  { name: 'Taunted', mpCost: 1 },                            // 14
  { name: 'Vulnerable', mpCost: 1 },                         // 15
  { name: 'Weakened', mpCost: 1 },                           // 16
];

// % chance of getting condition slot N (1..3). Each slot rolled independently
// against its own threshold. Per-slot percentages stack additively up to 3.
type SlotChances = readonly [number, number, number];

export const CONDITION_SLOT_CHANCE: Record<Tier, Record<Rarity, SlotChances>> = {
  1: {
    Common:    [0,  0,  0],
    Uncommon:  [0,  0,  0],
    Rare:      [20, 0,  0],
    Epic:      [40, 0,  0],
    Legendary: [60, 20, 0],
  },
  2: {
    Common:    [0,  0,  0],
    Uncommon:  [20, 0,  0],
    Rare:      [40, 20, 0],
    Epic:      [60, 40, 0],
    Legendary: [80, 60, 20],
  },
  3: {
    Common:    [20, 0,  0],
    Uncommon:  [40, 20, 0],
    Rare:      [60, 40, 20],
    Epic:      [80, 60, 40],
    Legendary: [100, 80, 60],
  },
};

// Per-tier × rarity duration for each of the 3 condition slots. Transcribed
// verbatim from the spec; tier 1 + tier 2 rows are uniform across rarities.
export const CONDITION_DURATION: Record<Tier, Record<Rarity, SlotChances>> = {
  1: {
    Common:    [1, 1, 1],
    Uncommon:  [1, 1, 1],
    Rare:      [1, 1, 1],
    Epic:      [1, 1, 1],
    Legendary: [1, 1, 1],
  },
  2: {
    Common:    [2, 1, 1],
    Uncommon:  [2, 1, 1],
    Rare:      [2, 1, 1],
    Epic:      [2, 1, 1],
    Legendary: [2, 1, 1],
  },
  3: {
    Common:    [3, 2, 1],
    Uncommon:  [3, 2, 1],
    Rare:      [3, 2, 1],
    Epic:      [3, 2, 1],
    Legendary: [3, 2, 1],
  },
};
