import type { Rarity, Tier } from '../types';

// Source: spec Step 5. Percent chance of getting a module, by tier and rarity.
export const MODULE_CHANCE: Record<Rarity, Record<Tier, number>> = {
  Common: { 1: 0, 2: 0, 3: 0 },
  Uncommon: { 1: 15, 2: 30, 3: 60 },
  Rare: { 1: 30, 2: 50, 3: 70 },
  Epic: { 1: 40, 2: 60, 3: 80 },
  Legendary: { 1: 50, 2: 75, 3: 100 },
};
