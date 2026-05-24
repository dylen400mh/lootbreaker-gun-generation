import type { Rarity, Tier } from '../../types';

// Source: spec Step 3. Capacity by player tier and shield rarity.
// Tier 1: Common 10, Uncommon 15, Rare 20, Epic 25, Legendary 30
// Tier 2: Common 20, Uncommon 25, Rare 30, Epic 35, Legendary 40
// Tier 3: Common 30, Uncommon 35, Rare 40, Epic 45, Legendary 50
export const CAPACITY_BY_TIER_RARITY: Record<Tier, Record<Rarity, number>> = {
  1: { Common: 10, Uncommon: 15, Rare: 20, Epic: 25, Legendary: 30 },
  2: { Common: 20, Uncommon: 25, Rare: 30, Epic: 35, Legendary: 40 },
  3: { Common: 30, Uncommon: 35, Rare: 40, Epic: 45, Legendary: 50 },
};
