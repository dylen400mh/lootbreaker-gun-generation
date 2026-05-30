// Source: spec Step 8 (Offensive) and Step 7 (Support) — Determine MP Cost.
//   Offensive: 1 + (Guild Bonuses) + (Conditions/Keywords) + Rarity
//   Support  : 1 + Rarity
// The rarity adder differs between the two procedures and is stored here.
import type { Rarity } from '../../types';

export const OFFENSIVE_MP_RARITY_ADDER: Record<Rarity, number> = {
  Common:    0,
  Uncommon:  0,
  Rare:      1,
  Epic:      1,
  Legendary: 2,
};

export const SUPPORT_MP_RARITY_ADDER: Record<Rarity, number> = {
  Common:    1,
  Uncommon:  1,
  Rare:      2,
  Epic:      2,
  Legendary: 3,
};
