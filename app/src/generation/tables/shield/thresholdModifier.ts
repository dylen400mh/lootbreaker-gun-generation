import type { Rarity, ShieldThresholdModifier } from '../../types';

// Source: spec Step 6. Per-rarity percentile chance that a threshold modifier
// applies. Rolled as 1d100 ≤ chance. On success, roll 1d12 against the
// THRESHOLD_MODIFIER_TABLE below.
export const MOD_CHANCE_BY_RARITY: Record<Rarity, number> = {
  Common: 20,
  Uncommon: 40,
  Rare: 60,
  Epic: 80,
  Legendary: 100,
};

// Source: spec Step 6. 1d12 → named modifier with (minor, major, grave)
// deltas applied on top of the base thresholds.
export const THRESHOLD_MODIFIER_TABLE: ReadonlyArray<ShieldThresholdModifier> = [
  { name: 'Light Guard',   minor: +2, major: -1, grave: -1 }, // 1
  { name: 'Heavy Guard',   minor: -1, major: +2, grave: -1 }, // 2
  { name: 'Last Stand',    minor: -1, major: -1, grave: +2 }, // 3
  { name: 'Split Guard A', minor: +1, major: +1, grave: -2 }, // 4
  { name: 'Split Guard B', minor: +1, major: -2, grave: +1 }, // 5
  { name: 'Split Guard C', minor: -2, major: +1, grave: +1 }, // 6
  { name: 'Polarized A',   minor: +2, major: -2, grave:  0 }, // 7
  { name: 'Polarized B',   minor: +2, major:  0, grave: -2 }, // 8
  { name: 'Polarized C',   minor:  0, major: +2, grave: -2 }, // 9
  { name: 'Polarized D',   minor: -2, major: +2, grave:  0 }, // 10
  { name: 'Polarized E',   minor: -2, major:  0, grave: +2 }, // 11
  { name: 'Polarized F',   minor:  0, major: -2, grave: +2 }, // 12
];
