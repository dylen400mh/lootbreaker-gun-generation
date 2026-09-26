import type { Rarity } from '../../types';

// Source: spec v0.12 "Determine Regeneration". Regeneration Score = base + INT
// (player stat). Stored as the base only; the card renders the formula
// literally as "<base> + INT". Does not change across tiers.
// Common 1, Uncommon 2, Rare 3, Epic 4, Legendary 5.
export const REGEN_BASE_BY_RARITY: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
};
