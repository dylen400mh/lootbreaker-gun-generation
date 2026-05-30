// Source: spec Step 4 (Support) — Determine Base Healing. Per delivery type
// × tier. Each entry carries healing dice, numeric range, vitality cost, and
// (for AOE deliveries) an area string.
import type { SpellDeliveryType, SupportSpellHealing, Tier } from '../../types';

type HealingByTier = Record<Tier, SupportSpellHealing>;

// Support spells only roll a 4-entry delivery subset (Missile, Beam,
// Multi-Target Missile, Cube). The other deliveries can't be rolled for
// Support, so they're omitted here.
export const SUPPORT_BASE_HEALING: Partial<Record<SpellDeliveryType, HealingByTier>> = {
  Missile: {
    1: { healing: '2d6', range: 6, vitalityCost: 1 },
    2: { healing: '4d6', range: 8, vitalityCost: 1 },
    3: { healing: '4d8', range: 10, vitalityCost: 1 },
  },
  Beam: {
    1: { healing: '2d4', range: 6, vitalityCost: 1 },
    2: { healing: '4d4', range: 8, vitalityCost: 1 },
    3: { healing: '4d6', range: 10, vitalityCost: 1 },
  },
  'Multi-Target Missile': {
    1: { healing: '2d4', range: 4, vitalityCost: 2 },
    2: { healing: '2d6', range: 6, vitalityCost: 2 },
    3: { healing: '2d8', range: 8, vitalityCost: 2 },
  },
  Cube: {
    1: { healing: '1d6', range: 6, vitalityCost: 2, area: '2x2x2' },
    2: { healing: '2d6', range: 8, vitalityCost: 2, area: '3x3x3' },
    3: { healing: '2d8', range: 10, vitalityCost: 2, area: '4x4x4' },
  },
};
