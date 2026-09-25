import type { BaseDamage, DamageRow, GunType, Tier } from '../../types';

export interface GunTypeDef {
  type: GunType;
  baseDamage: BaseDamage;
  // Free-form range string straight from the spec.
  range: string;
  special?: string;
  damage: Record<Tier, DamageRow>;
}

// Source: spec v0.12 Step One. Base damage is now a flat integer per tier ×
// hit band (Minimum/Medium/Maximum) rather than dice — stored as numeric
// strings so the shared DamageRow shape (dice strings for melee/spell) is
// unchanged. Row keys map Minimum→minor, Medium→major, Maximum→grave.
//
// v1/v0.12 change: Scout Rifle is gone entirely (no longer a d8 slot); d8
// slots 7 and 8 are both Player Choice.

export const GUN_TYPES: Record<GunType, GunTypeDef> = {
  Pistol: {
    type: 'Pistol',
    baseDamage: 'Kinetic',
    range: '10',
    special:
      'Fan the Hammer: After making an Attack with a pistol at a target, as an Interact Action [1 AP], you may make a second attack at the same target with a Bane. This attack deals half damage.',
    damage: {
      1: { minor: '1', major: '2', grave: '4' },
      2: { minor: '2', major: '3', grave: '5' },
      3: { minor: '3', major: '4', grave: '6' },
    },
  },
  SMG: {
    type: 'SMG',
    baseDamage: 'Kinetic',
    range: '7',
    special: 'Mobile: You gain +1 Speed after attacking with this weapon',
    damage: {
      1: { minor: '2', major: '4', grave: '7' },
      2: { minor: '4', major: '6', grave: '9' },
      3: { minor: '6', major: '8', grave: '11' },
    },
  },
  Shotgun: {
    type: 'Shotgun',
    baseDamage: 'Kinetic',
    range: '5',
    special:
      'Pointblank: Adjacent targets take an additional +1d6 Damage (Matching Damage Type)',
    damage: {
      1: { minor: '4', major: '6', grave: '10' },
      2: { minor: '6', major: '8', grave: '12' },
      3: { minor: '8', major: '10', grave: '14' },
    },
  },
  'Combat Rifle': {
    type: 'Combat Rifle',
    baseDamage: 'Kinetic',
    range: '10',
    damage: {
      1: { minor: '4', major: '6', grave: '8' },
      2: { minor: '6', major: '8', grave: '10' },
      3: { minor: '8', major: '10', grave: '12' },
    },
  },
  'Sniper Rifle': {
    type: 'Sniper Rifle',
    baseDamage: 'Kinetic',
    range: '18',
    special:
      'Steady Shot: As an Interact Action [1 AP], reduce your Speed to 0. You gain a Boost on your Impact Roll with this weapon. You cannot use your Speed Score until your next turn.',
    damage: {
      1: { minor: '3', major: '5', grave: '7' },
      2: { minor: '5', major: '7', grave: '9' },
      3: { minor: '7', major: '9', grave: '11' },
    },
  },
  Launcher: {
    type: 'Launcher',
    baseDamage: 'Kinetic',
    range: '6',
    special: 'Splash 1 (Deal 1/2 Damage to adjacent targets)',
    damage: {
      1: { minor: '4', major: '6', grave: '9' },
      2: { minor: '6', major: '8', grave: '11' },
      3: { minor: '8', major: '10', grave: '13' },
    },
  },
};

// d8 roll → weapon type. Slots 7 and 8 ("Player Choice") are null and trigger
// the choice modal in procedure.ts.
export const GUN_BY_D8: ReadonlyArray<GunType | null> = [
  'Pistol', // 1
  'SMG', // 2
  'Shotgun', // 3
  'Combat Rifle', // 4
  'Sniper Rifle', // 5
  'Launcher', // 6
  null, // 7 — Player Choice
  null, // 8 — Player Choice
];

export const GUN_PLAYER_CHOICE_TYPES: ReadonlyArray<GunType> = [
  'Pistol',
  'SMG',
  'Shotgun',
  'Combat Rifle',
  'Sniper Rifle',
  'Launcher',
];
