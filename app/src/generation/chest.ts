import { d, mulberry32 } from './rng';
import { CHEST_LOOT_TABLE } from './tables/chest/loot';
import { CHEST_SIZE_DICE } from './tables/chest/sizes';
import type { ChestRoll, ChestSize, Tier } from './types';

export interface ChestOptions {
  size: ChestSize;
  tier: Tier;
  seed?: number;
}

export function rollChest({ size, tier, seed }: ChestOptions): ChestRoll {
  const actualSeed = seed ?? Math.floor(Math.random() * 0xffffffff);
  const rng = mulberry32(actualSeed);
  const diceCount = CHEST_SIZE_DICE[size];
  const rolls: number[] = [];
  for (let i = 0; i < diceCount; i += 1) rolls.push(d(rng, 6));
  const total = rolls.reduce((a, b) => a + b, 0);
  const row = CHEST_LOOT_TABLE[total];
  // Tier 2/3 add +100/+200 to any non-zero gold value. Gold-less rows
  // (2, 3) stay at zero — the spec only scales "each gold amount".
  const gold = row.gold > 0 ? row.gold + (tier - 1) * 100 : 0;
  return { size, tier, rolls, total, gold, items: row.items };
}

// Formats the chest's loot as a single line: joins "<gold>g" and the row's
// item text with " + ", skipping empty pieces. Row 1 → "20g", row 2 →
// "Common Potion", row 18 → "100g + Uncommon Trinket + Uncommon Gun +
// Common Health Potion".
export function formatChestLoot(chest: ChestRoll): string {
  const parts: string[] = [];
  if (chest.gold > 0) parts.push(`${chest.gold}g`);
  if (chest.items) parts.push(chest.items);
  return parts.join(' + ');
}
