import type { Rarity } from '../../types';

// Source: spec Step 4. Regeneration Score = base + MND (player stat).
// Stored as the base only; the card renders the formula literally as
// "<base> + MND". Does not change across tiers.
// Common 1, Uncommon 2, Rare 3, Epic 4, Legendary 5.
export const REGEN_BASE_BY_RARITY: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
};
