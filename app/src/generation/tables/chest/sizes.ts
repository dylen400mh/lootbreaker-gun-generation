// Chest size → number of d6s rolled. Per Chest Rolls spec v0.10:
// Small=1, Medium=2, Large=3, Giga=4. The dice sum (range 1–24) indexes
// CHEST_LOOT_TABLE.

export type ChestSize = 'Small' | 'Medium' | 'Large' | 'Giga';

export const CHEST_SIZES: ReadonlyArray<ChestSize> = ['Small', 'Medium', 'Large', 'Giga'];

export const CHEST_SIZE_DICE: Record<ChestSize, number> = {
  Small: 1,
  Medium: 2,
  Large: 3,
  Giga: 4,
};
