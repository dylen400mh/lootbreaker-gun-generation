// Chest Rolls v0.10 — 24-row loot table, verbatim per spec.
// Indexed by the total of the chest's d6 roll(s) (1–24).
//
// `gold` is the Tier 1 base value. Tier 2 adds +100, Tier 3 adds +200 — but
// only to rows that already have gold; rows with `gold: 0` stay at zero.
// `items` is the verbatim non-gold portion of the row, e.g.
// "Uncommon Melee Weapon + Uncommon Spell". Empty string when the row is
// gold-only.

export interface ChestLootRow {
  gold: number;
  items: string;
}

export const CHEST_LOOT_TABLE: Record<number, ChestLootRow> = {
  1: { gold: 20, items: '' },
  2: { gold: 0, items: 'Common Potion' },
  3: { gold: 0, items: 'Common Trinket' },
  4: { gold: 30, items: 'Common Health Potion' },
  5: { gold: 30, items: 'Common Shield Potion' },
  6: { gold: 30, items: 'Common Gun' },
  7: { gold: 40, items: 'Common Trinket' },
  8: { gold: 40, items: 'Common Health Potion' },
  9: { gold: 40, items: 'Common Shield Potion' },
  10: { gold: 40, items: 'Uncommon Trinket' },
  11: { gold: 40, items: 'Uncommon Spell' },
  12: { gold: 40, items: 'Uncommon Spell' },
  13: { gold: 80, items: 'Uncommon Melee Weapon' },
  14: { gold: 80, items: 'Random Potion' },
  15: { gold: 80, items: 'Random Potion + 2 Common Shield Potions' },
  16: { gold: 80, items: 'Uncommon Melee Weapon + Uncommon Spell' },
  17: { gold: 90, items: 'Uncommon Trinket + Uncommon Gun' },
  18: { gold: 100, items: 'Uncommon Trinket + Uncommon Gun + Common Health Potion' },
  19: { gold: 100, items: '2 Random Potions + Uncommon Melee Weapon' },
  20: { gold: 100, items: 'Rare Spell' },
  21: { gold: 120, items: 'Rare Melee Weapon' },
  22: { gold: 120, items: 'Rare Gun + Random Trinket + 2 Common Shield Potions' },
  23: { gold: 150, items: 'Epic Melee Weapon + Random Trinket + 2 Common Health Potions' },
  24: {
    gold: 200,
    items: 'Epic Gun + Rare Potion + 3 Common Health Potions + Rare Shield',
  },
};
