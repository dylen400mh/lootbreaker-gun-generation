// Source: spec Step 6 (Support) — Determine Healing Type. 1d6.
import type { SpellHealingType } from '../../types';

export const HEALING_TYPE_BY_D6: ReadonlyArray<SpellHealingType> = [
  'Shields', 'Shields', 'Shields',
  'Health',  'Health',  'Health',
];
