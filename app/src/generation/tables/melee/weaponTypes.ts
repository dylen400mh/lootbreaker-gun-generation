import type { BaseDamage, DamageRow, MeleeType, Tier } from '../../types';

export interface MeleeTypeDef {
  type: MeleeType;
  baseDamage: BaseDamage;
  // Free-form range string straight from the spec (e.g. "1/5", "2/4", "1").
  range: string;
  special?: string;
  damage: Record<Tier, DamageRow>;
}

// Source: Lootbreaker_MeleeWeaponGeneration_Version0dot10.pdf — Step One.
// Damage values and specials transcribed verbatim from the PDF.

export const MELEE_TYPES: Record<MeleeType, MeleeTypeDef> = {
  Dagger: {
    type: 'Dagger',
    baseDamage: 'Slashing',
    range: '1/5',
    special: 'Twinstrike: Attacking a second time with this weapon costs only 1 AP, instead of 2.',
    damage: {
      1: { minor: '1d4', major: '1d4', grave: '2d4' },
      2: { minor: '1d4', major: '1d6', grave: '2d6' },
      3: { minor: '1d6', major: '1d8', grave: '2d6' },
    },
  },
  Warhammer: {
    type: 'Warhammer',
    baseDamage: 'Kinetic',
    range: '1',
    special: 'Cannot be thrown. Heavy: -2 Accuracy',
    damage: {
      1: { minor: '1d8', major: '1d10', grave: '2d10' },
      2: { minor: '1d10', major: '1d12', grave: '2d12' },
      3: { minor: '1d12', major: '1d20 + 1d6', grave: '2d20 + 1d6' },
    },
  },
  Sword: {
    type: 'Sword',
    baseDamage: 'Slashing',
    range: '1/2',
    damage: {
      1: { minor: '1d6', major: '1d8', grave: '2d8' },
      2: { minor: '1d8', major: '1d10', grave: '2d10' },
      3: { minor: '1d10', major: '1d12', grave: '2d12' },
    },
  },
  Lance: {
    type: 'Lance',
    baseDamage: 'Slashing',
    range: '2/4',
    special: 'Reach: +1 Range',
    damage: {
      1: { minor: '1d4', major: '1d6', grave: '2d6' },
      2: { minor: '1d6', major: '1d8', grave: '2d8' },
      3: { minor: '1d8', major: '1d10', grave: '2d10' },
    },
  },
  Gauntlet: {
    type: 'Gauntlet',
    baseDamage: 'Kinetic',
    range: '1',
    special: 'Cannot Be Thrown',
    damage: {
      1: { minor: '1d4', major: '2d4', grave: '3d4' },
      2: { minor: '2d4', major: '2d6', grave: '3d6' },
      3: { minor: '2d6', major: '2d8', grave: '3d10' },
    },
  },
  Axe: {
    type: 'Axe',
    baseDamage: 'Slashing',
    range: '1/3',
    damage: {
      1: { minor: '1d6', major: '1d8', grave: '2d8' },
      2: { minor: '1d8', major: '1d10', grave: '2d10' },
      3: { minor: '1d10', major: '1d12', grave: '2d12' },
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
