// Source: spec Step 0 — Determine Spell Type (Support or Offensive). 1d20.
import type { SpellSubType } from '../../types';

// Indexed by d20 roll (1..20) − 1. `null` slots are Player Choice.
export const SUB_TYPE_BY_D20: ReadonlyArray<SpellSubType | null> = [
  'Offensive', 'Offensive', 'Offensive', 'Offensive', 'Offensive',
  'Offensive', 'Offensive', 'Offensive', 'Offensive', 'Offensive',
  'Offensive', 'Offensive', 'Offensive', 'Offensive', 'Offensive',
  'Offensive', 'Support', 'Support', 'Support', null,
];

export const SUB_TYPE_PLAYER_CHOICE: ReadonlyArray<SpellSubType> = [
  'Offensive',
  'Support',
];
