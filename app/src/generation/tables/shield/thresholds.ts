import type { Tier } from '../../types';

// Source: spec Step 6 (base Impact Thresholds, before the optional modifier).
// Determined by player tier alone — rarity does not affect base thresholds.
// Tier 1: Minor 8,  Major 13, Grave 17
// Tier 2: Minor 10, Major 15, Grave 19
// Tier 3: Minor 12, Major 17, Grave 21
export const BASE_THRESHOLDS_BY_TIER: Record<
  Tier,
  { minor: number; major: number; grave: number }
> = {
  1: { minor: 8, major: 13, grave: 17 },
  2: { minor: 10, major: 15, grave: 19 },
  3: { minor: 12, major: 17, grave: 21 },
};
