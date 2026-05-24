import type { Rarity } from '../../types';

// Source: spec Step 3. 2d6 cross-table. First die = row, second die = column.
// Indexed [row-1][col-1].
export const RARITY_TABLE: ReadonlyArray<ReadonlyArray<Rarity>> = [
  ['Common', 'Common', 'Common', 'Common', 'Uncommon', 'Rare'],
  ['Common', 'Common', 'Common', 'Uncommon', 'Uncommon', 'Rare'],
  ['Common', 'Common', 'Uncommon', 'Uncommon', 'Rare', 'Rare'],
  ['Common', 'Uncommon', 'Uncommon', 'Rare', 'Rare', 'Epic'],
  ['Uncommon', 'Uncommon', 'Rare', 'Rare', 'Epic', 'Legendary'],
  ['Rare', 'Rare', 'Rare', 'Epic', 'Legendary', 'Legendary'],
];

export const RARITY_ORDER: ReadonlyArray<Rarity> = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
];
