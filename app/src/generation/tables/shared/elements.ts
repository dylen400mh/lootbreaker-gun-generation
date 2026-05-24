import type { Element, ElementResult, Rarity } from '../../types';

// Source: spec Step 4. d100 row × rarity column.
// Each cell is either:
//   - null → no elemental damage ("N/A")
//   - { kind: 'fixed', elements: [...] } → deterministic elements
//   - { kind: 'choose-common' } → row 97-100 Common: pick a common type (Acid/Cold/Fire/Volt) with no bonus
//   - { kind: 'choose-bonus', bonusDice: '+1d6' | '+2d6' } → pick common-or-rare with that bonus dice
//   - { kind: 'choose-bonus-pair', bonusDice: '+1d6' } → pick 2 (with that bonus each) — Legendary 97-100

export type ElementCell =
  | null
  | { kind: 'fixed'; elements: ElementResult[] }
  | { kind: 'choose-common' }
  | { kind: 'choose-bonus'; bonusDice: string }
  | { kind: 'choose-bonus-pair'; bonusDice: string };

interface RowDef {
  range: [number, number]; // inclusive
  Common: ElementCell;
  Uncommon: ElementCell;
  Rare: ElementCell;
  Epic: ElementCell;
  Legendary: ElementCell;
}

const E = (element: Element, bonusDice?: string): ElementResult =>
  bonusDice ? { element, bonusDice } : { element };

const NA: ElementCell = null;
const fixed = (...elements: ElementResult[]): ElementCell => ({
  kind: 'fixed',
  elements,
});

export const ELEMENT_TABLE: ReadonlyArray<RowDef> = [
  // 1-4
  { range: [1, 4], Common: NA, Uncommon: NA, Rare: NA, Epic: NA, Legendary: fixed(E('Acid')) },
  // 5-8
  { range: [5, 8], Common: NA, Uncommon: NA, Rare: NA, Epic: NA, Legendary: fixed(E('Cold')) },
  // 9-12
  { range: [9, 12], Common: NA, Uncommon: NA, Rare: NA, Epic: NA, Legendary: fixed(E('Fire')) },
  // 13-16
  { range: [13, 16], Common: NA, Uncommon: NA, Rare: NA, Epic: NA, Legendary: fixed(E('Volt')) },
  // 17-20
  {
    range: [17, 20],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Acid')),
    Legendary: fixed(E('Acid', '+1d6')),
  },
  // 21-24
  {
    range: [21, 24],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Cold')),
    Legendary: fixed(E('Cold', '+1d6')),
  },
  // 25-28
  {
    range: [25, 28],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Fire')),
    Legendary: fixed(E('Fire', '+1d6')),
  },
  // 29-32
  {
    range: [29, 32],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Volt')),
    Legendary: fixed(E('Volt', '+1d6')),
  },
  // 33-36
  {
    range: [33, 36],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Acid', '+1d6')),
    Legendary: fixed(E('Dark', '+1d6')),
  },
  // 37-40
  {
    range: [37, 40],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Cold', '+1d6')),
    Legendary: fixed(E('Entropy', '+1d6')),
  },
  // 41-44
  {
    range: [41, 44],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Fire', '+1d6')),
    Legendary: fixed(E('Light', '+1d6')),
  },
  // 45-48
  {
    range: [45, 48],
    Common: NA,
    Uncommon: NA,
    Rare: NA,
    Epic: fixed(E('Volt', '+1d6')),
    Legendary: fixed(E('Plasma', '+1d6')),
  },
  // 49-52
  {
    range: [49, 52],
    Common: NA,
    Uncommon: NA,
    Rare: fixed(E('Acid')),
    Epic: fixed(E('Dark', '+1d6')),
    Legendary: fixed(E('Acid', '+2d6')),
  },
  // 53-56
  {
    range: [53, 56],
    Common: NA,
    Uncommon: NA,
    Rare: fixed(E('Cold')),
    Epic: fixed(E('Entropy', '+1d6')),
    Legendary: fixed(E('Cold', '+2d6')),
  },
  // 57-60
  {
    range: [57, 60],
    Common: NA,
    Uncommon: NA,
    Rare: fixed(E('Fire')),
    Epic: fixed(E('Light', '+1d6')),
    Legendary: fixed(E('Fire', '+2d6')),
  },
  // 61-64
  {
    range: [61, 64],
    Common: NA,
    Uncommon: NA,
    Rare: fixed(E('Volt')),
    Epic: fixed(E('Plasma', '+1d6')),
    Legendary: fixed(E('Volt', '+2d6')),
  },
  // 65-68
  {
    range: [65, 68],
    Common: NA,
    Uncommon: fixed(E('Acid')),
    Rare: fixed(E('Acid', '+1d6')),
    Epic: fixed(E('Acid', '+2d6')),
    Legendary: fixed(E('Dark', '+2d6')),
  },
  // 69-72
  {
    range: [69, 72],
    Common: NA,
    Uncommon: fixed(E('Cold')),
    Rare: fixed(E('Cold', '+1d6')),
    Epic: fixed(E('Cold', '+2d6')),
    Legendary: fixed(E('Entropy', '+2d6')),
  },
  // 73-76
  {
    range: [73, 76],
    Common: NA,
    Uncommon: fixed(E('Fire')),
    Rare: fixed(E('Fire', '+1d6')),
    Epic: fixed(E('Fire', '+2d6')),
    Legendary: fixed(E('Light', '+2d6')),
  },
  // 77-80
  {
    range: [77, 80],
    Common: NA,
    Uncommon: fixed(E('Volt')),
    Rare: fixed(E('Volt', '+1d6')),
    Epic: fixed(E('Volt', '+2d6')),
    Legendary: fixed(E('Plasma', '+2d6')),
  },
  // 81-84
  {
    range: [81, 84],
    Common: fixed(E('Acid')),
    Uncommon: fixed(E('Acid', '+1d6')),
    Rare: fixed(E('Dark', '+1d6')),
    Epic: fixed(E('Acid'), E('Fire')),
    Legendary: fixed(E('Acid', '+1d6'), E('Fire', '+1d6')),
  },
  // 85-88
  {
    range: [85, 88],
    Common: fixed(E('Cold')),
    Uncommon: fixed(E('Cold', '+1d6')),
    Rare: fixed(E('Entropy', '+1d6')),
    Epic: fixed(E('Cold'), E('Volt')),
    Legendary: fixed(E('Cold', '+1d6'), E('Volt', '+1d6')),
  },
  // 89-92
  {
    range: [89, 92],
    Common: fixed(E('Fire')),
    Uncommon: fixed(E('Fire', '+1d6')),
    Rare: fixed(E('Light', '+1d6')),
    Epic: fixed(E('Dark'), E('Entropy')),
    Legendary: fixed(E('Dark', '+1d6'), E('Entropy', '+1d6')),
  },
  // 93-96
  {
    range: [93, 96],
    Common: fixed(E('Volt')),
    Uncommon: fixed(E('Volt', '+1d6')),
    Rare: fixed(E('Plasma', '+1d6')),
    Epic: fixed(E('Light'), E('Plasma')),
    Legendary: fixed(E('Light', '+1d6'), E('Plasma', '+1d6')),
  },
  // 97-100
  {
    range: [97, 100],
    Common: { kind: 'choose-common' },
    Uncommon: { kind: 'choose-bonus', bonusDice: '+1d6' },
    Rare: { kind: 'choose-bonus', bonusDice: '+1d6' },
    Epic: { kind: 'choose-bonus', bonusDice: '+2d6' },
    Legendary: { kind: 'choose-bonus-pair', bonusDice: '+1d6' },
  },
];

export function lookupElementCell(roll: number, rarity: Rarity): ElementCell {
  for (const row of ELEMENT_TABLE) {
    if (roll >= row.range[0] && roll <= row.range[1]) {
      return row[rarity];
    }
  }
  throw new Error(`Element roll out of range: ${roll}`);
}

export const COMMON_ELEMENTS: ReadonlyArray<Element> = ['Acid', 'Cold', 'Fire', 'Volt'];
export const RARE_ELEMENTS: ReadonlyArray<Element> = ['Dark', 'Entropy', 'Light', 'Plasma'];
export const COMMON_OR_RARE_ELEMENTS: ReadonlyArray<Element> = [
  ...COMMON_ELEMENTS,
  ...RARE_ELEMENTS,
];
