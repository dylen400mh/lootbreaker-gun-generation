// Source: spec Step 9 (Offensive — 1d100 Prefix) and Step 8 (Support — 1d20
// Prefix). Offensive's 1d100 prefix list is verbatim identical to the shared
// gun/melee PREFIXES table (`tables/shared/naming.ts`), so we re-export it
// rather than duplicate. Support spells use a separate 1d20 prefix list.
export { PREFIXES as OFFENSIVE_SPELL_PREFIXES_D100 } from '../shared/naming';

export const SUPPORT_SPELL_PREFIXES_D20: ReadonlyArray<string> = [
  'Angelic',
  'Refreshing',
  'Blooming',
  'Rejuvenating',
  'Blessed',
  'Celestial',
  'Cleansing',
  'Divine',
  'Empyrean',
  'Glowing',
  'Graceful',
  'Harmonic',
  'Hopeful',
  'Kindred',
  'Merciful',
  'Ascendant',
  'Restorative',
  'Reinforcing',
  'Verdant',
  'Consecrated',
];
