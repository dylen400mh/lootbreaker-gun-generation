import type { BaseDamage, DamageRow, MeleeType, Tier } from '../../types';

export interface MeleeTypeDef {
  type: MeleeType;
  baseDamage: BaseDamage;
  // Free-form range string straight from the spec (e.g. "1/5", "2/4", "1/1").
  range: string;
  special?: string;
  damage: Record<Tier, DamageRow>;
}

// Source: spec v0.12 (Lootbreaker_MeleeWeaponGeneration_Version0dot12.pdf) —
// Step One. Base damage is now a flat integer per tier × hit band
// (Minimum/Medium/Maximum) rather than dice — stored as numeric strings so the
// shared DamageRow shape is unchanged. Row keys map Minimum→minor, Medium→
// major, Maximum→grave.

export const MELEE_TYPES: Record<MeleeType, MeleeTypeDef> = {
  Dagger: {
    type: 'Dagger',
    baseDamage: 'Slashing',
    range: '1/5',
    special:
      'Twinstrike: As an Interact Action [1 AP] after attacking with a dagger, you may deal 1d4 Slashing damage to an adjacent target you have already damaged with this weapon.',
    damage: {
      1: { minor: '2', major: '3', grave: '5' },
      2: { minor: '3', major: '4', grave: '6' },
      3: { minor: '4', major: '5', grave: '7' },
    },
  },
  Warhammer: {
    type: 'Warhammer',
    baseDamage: 'Kinetic',
    range: '1/1',
    special: 'Heavy: You gain a Bane to Impact Rolls with this weapon',
    damage: {
      1: { minor: '8', major: '10', grave: '13' },
      2: { minor: '10', major: '12', grave: '15' },
      3: { minor: '12', major: '14', grave: '17' },
    },
  },
  Sword: {
    type: 'Sword',
    baseDamage: 'Slashing',
    range: '1/3',
    damage: {
      1: { minor: '4', major: '6', grave: '8' },
      2: { minor: '6', major: '8', grave: '10' },
      3: { minor: '8', major: '10', grave: '12' },
    },
  },
  Lance: {
    type: 'Lance',
    baseDamage: 'Slashing',
    range: '2/4',
    special: 'Reach: +1 Melee Range',
    damage: {
      1: { minor: '2', major: '4', grave: '6' },
      2: { minor: '4', major: '6', grave: '8' },
      3: { minor: '6', major: '8', grave: '10' },
    },
  },
  Gauntlet: {
    type: 'Gauntlet',
    baseDamage: 'Kinetic',
    range: '1/1',
    special: 'Forceful: Gauntlets gains Push 1',
    damage: {
      1: { minor: '4', major: '6', grave: '9' },
      2: { minor: '6', major: '8', grave: '11' },
      3: { minor: '8', major: '10', grave: '13' },
    },
  },
  Axe: {
    type: 'Axe',
    baseDamage: 'Slashing',
    range: '1/4',
    special: 'Cleave: Deal half damage to an adjacent single target to your original target.',
    damage: {
      1: { minor: '2', major: '4', grave: '7' },
      2: { minor: '4', major: '6', grave: '9' },
      3: { minor: '6', major: '8', grave: '11' },
    },
  },
};

// 2d4 sum → melee weapon type. Sum 8 ("Player Choice") is null and triggers
// the choice modal. Source: spec Step One table.
export const MELEE_BY_2D4: Record<number, MeleeType | null> = {
  2: 'Warhammer',
  3: 'Axe',
  4: 'Lance',
  5: 'Dagger',
  6: 'Sword',
  7: 'Gauntlet',
  8: null, // Player Choice
};

export const MELEE_PLAYER_CHOICE_TYPES: ReadonlyArray<MeleeType> = [
  'Warhammer',
  'Axe',
  'Lance',
  'Dagger',
  'Sword',
  'Gauntlet',
];
