import type { DamageRow, Tier, WeaponType } from '../types';

export interface WeaponTypeDef {
  type: WeaponType;
  range: number;
  special?: string;
  damage: Record<Tier, DamageRow>;
}

// Source: spec Step 1. v1 change:
//   - Scout Rifle is dropped (slot 5 of the d8 silently re-rolls in procedure.ts).

export const WEAPON_TYPES: Record<WeaponType, WeaponTypeDef> = {
  Pistol: {
    type: 'Pistol',
    range: 8,
    special: 'Light Frame (Dual Wield Attacks gain Bonus to Accuracy or Damage)',
    damage: {
      1: { minor: '1d4', major: '1d4', grave: '2d4' },
      2: { minor: '1d6', major: '1d6', grave: '2d6' },
      3: { minor: '2d6', major: '2d8', grave: '2d10' },
    },
  },
  SMG: {
    type: 'SMG',
    range: 5,
    damage: {
      1: { minor: '1d4', major: '2d4', grave: '3d4' },
      2: { minor: '2d4', major: '2d6', grave: '3d6' },
      3: { minor: '2d6', major: '2d8', grave: '3d10' },
    },
  },
  Shotgun: {
    type: 'Shotgun',
    range: 2,
    damage: {
      1: { minor: '1d6', major: '2d6', grave: '2d8' },
      2: { minor: '1d8', major: '2d8', grave: '2d10' },
      3: { minor: '1d10', major: '2d10', grave: '3d12' },
    },
  },
  'Combat Rifle': {
    type: 'Combat Rifle',
    range: 8,
    damage: {
      1: { minor: '1d6', major: '1d8', grave: '2d8' },
      2: { minor: '1d8', major: '1d10', grave: '2d10' },
      3: { minor: '1d10', major: '1d12', grave: '2d12' },
    },
  },
  'Sniper Rifle': {
    type: 'Sniper Rifle',
    range: 12,
    special:
      "Steady Shot (Reduce Movement Score to 0 to gain bonus to Accuracy Roll — can't use if already moved this turn)",
    damage: {
      1: { minor: '1d4', major: '1d6', grave: '2d6' },
      2: { minor: '1d6', major: '1d8', grave: '2d8' },
      3: { minor: '1d8', major: '1d10', grave: '2d10' },
    },
  },
  Launcher: {
    type: 'Launcher',
    range: 4,
    special: 'Splash 1 (Deal 1/2 Damage to Adjacent Targets)',
    damage: {
      1: { minor: '1d8', major: '1d10', grave: '2d10' },
      2: { minor: '1d10', major: '1d12', grave: '2d12' },
      3: { minor: '1d12', major: '1d20 + 1d12', grave: '2d20 + 1d12' },
    },
  },
};

// d8 roll → weapon type. Slot 5 (Scout Rifle position) is null and triggers a re-roll
// in procedure.ts. Slot 8 ("Player Choice") is also null and triggers the choice modal.
export const WEAPON_BY_D8: ReadonlyArray<WeaponType | null> = [
  'Pistol', // 1
  'SMG', // 2
  'Shotgun', // 3
  'Combat Rifle', // 4
  null, // 5 — Scout Rifle (dropped in v1; re-roll)
  'Sniper Rifle', // 6
  'Launcher', // 7
  null, // 8 — Player Choice
];

export const PLAYER_CHOICE_TYPES: ReadonlyArray<WeaponType> = [
  'Pistol',
  'SMG',
  'Shotgun',
  'Combat Rifle',
  'Sniper Rifle',
  'Launcher',
];
