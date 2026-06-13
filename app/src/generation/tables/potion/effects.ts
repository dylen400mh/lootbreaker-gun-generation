import type { PotionEffect, Rarity } from '../../types';

// Source: Lootbreaker_AppResources/Potion Assets/Potion List New Master.pdf.
//
// Each per-rarity table is indexed by the dice total (the spec's "2d12",
// "1d20", etc. roll). Descriptions are transcribed verbatim — capitalization,
// punctuation, the trademark symbol on "Moose Juice^TM", spec typos like
// "Lucky Potion / Advantage on your next Accuracy Roll" stay as-written.
//
// v1 deviations from the spec (see CLAUDE.md "v1 deviations"):
//   * Uncommon row 8 duplicate: the spec lists TWO row-8 entries
//     ("Battery Acid Cola" and "Hot Sauce"). We shifted everything after
//     the first 8 down by one: Battery Acid Cola stays at 8, Hot Sauce
//     becomes 9, …, Quick Concentrate (was 19) becomes 20. The original
//     row 20 "Moose Juice^TM" is cut entirely until the client confirms
//     which way to resolve the duplicate.

export const COMMON_2D12_TABLE: Record<number, PotionEffect> = {
  2: {
    roll: 2,
    name: 'Sketchy Sludge',
    description:
      'This potion imbues the target with -3 Accuracy and -2 to all Checks until the end of the current encounter. It tastes really bad.',
  },
  3: {
    roll: 3,
    name: 'Bottled Lightning',
    description: 'All Attacks gain +1 Volt Damage until the end of the current encounter',
  },
  4: {
    roll: 4,
    name: 'Liquid Tape',
    description:
      'If you drink this potion your feet seal to the floor. Your Speed becomes 0 until the end of your next turn. You become immune to all effects that would give you forced movement.',
  },
  5: { roll: 5, name: 'Shield Potion', description: '+1d6 to equipped Shield' },
  6: { roll: 6, name: 'Health Potion', description: '+1d6 to HP' },
  7: { roll: 7, name: 'Deadeye Potion', description: '+1 to your next Accuracy Roll' },
  8: { roll: 8, name: 'Overshield Potion', description: '+5 Overshield' },
  9: { roll: 9, name: 'Multi-Flavour Potion', description: '+2 Shields and +2 HP' },
  10: {
    roll: 10,
    name: 'Checkered Potion',
    description: '+1 Bonus to the next Check you make until the end of the current encounter',
  },
  11: {
    roll: 11,
    name: 'Goose Grease',
    description:
      'Lube yourself up with grease, granting you +5 Speed until the end of your next turn. As long as you have +5 Speed as a result of Goose Grease you gain the following restrictions: You must move in straight line. You must use your full Speed whenever you move. If you hit another object or are stopped before completing your full movement action, you take 1d6 Kinetic Damage multiplied by the number of Squares left in your movement.',
  },
  12: { roll: 12, name: 'Speed Shot', description: '+1 Speed until the end of your next turn' },
  13: {
    roll: 13,
    name: 'Clanker Combo',
    description: '+2 Overshield. +10 if the target of this potion has a Machine Tag',
  },
  14: {
    roll: 14,
    name: 'Bomb Beverage',
    description: 'Deals 2d6 Damage to anyone who drinks it, or gets splashed by it',
  },
  15: {
    roll: 15,
    name: 'Skill Sauce',
    description: '+1 to a Random skill until the end of the current encounter',
  },
  16: {
    roll: 16,
    name: 'Liquid Grilled Cheese',
    description:
      'Drink this. Do it. Do it now. +1 Shield Regeneration Score until the end of the current encounter',
  },
  17: {
    roll: 17,
    name: 'Jar of Dirt',
    description:
      'Consume this magic jar of dirt to gain +2 Speed on earthen ground. If you put someone’s heart within this potion and drink it, it instead gives you +5 Speed and +5 Overshield. You also, potentially, become a cannibal.',
  },
  18: { roll: 18, name: 'Fairy Juice', description: '+3 Flight until the end of your next Turn' },
  19: {
    roll: 19,
    name: 'Unicorn Ooze',
    description:
      'Your Spells gain +1 Accuracy and +2 Light Damage until the end of your next turn. You also sparkle.',
  },
  20: {
    roll: 20,
    name: 'Gooey Dog Lager',
    description: 'You can communicate with animals until the end of the current encounter',
  },
  21: {
    roll: 21,
    name: 'Apple Flavoured Gasoline',
    description: 'This isn’t good for you. Don’t drink it. Creates a puddle of 3x3 flammable liquid.',
  },
  22: { roll: 22, name: 'Cherry Cola', description: '+1 Shields' },
  23: {
    roll: 23,
    name: 'Hops Hops',
    description: '+1 Jump Distance until the end of the current encounter',
  },
  24: {
    roll: 24,
    name: 'Bubbly Brew',
    description:
      'The next time you would take fall damage, take half instead. This effect lasts until the end of the current encounter',
  },
};

export const UNCOMMON_1D20_TABLE: Record<number, PotionEffect> = {
  1: { roll: 1, name: 'Shield Potion', description: '+2d6 to equipped Shield' },
  2: { roll: 2, name: 'Health Potion', description: '+2d6 to HP' },
  3: { roll: 3, name: 'Deadeye Potion', description: '+2 to your next Accuracy Roll' },
  4: { roll: 4, name: 'Overshield Potion', description: '+10 Overshield' },
  5: { roll: 5, name: 'Multi-Flavour Potion', description: '+1d6 Shields and +1d6 HP' },
  6: {
    roll: 6,
    name: 'Checkered Potion',
    description: '+2 Bonus to the next Check you make until the end of the current encounter',
  },
  7: {
    roll: 7,
    name: 'Cold Brewski',
    description: '+5 Cold Damage Resistance until the end of the current encounter',
  },
  8: {
    roll: 8,
    name: 'Battery Acid Cola',
    description: '+5 Acid Damage Resistance until the end of the current encounter',
  },
  // The spec also lists row 8 as "Hot Sauce" — duplicate roll value. Shifted
  // down to slot 9 here; everything after shifts by one as well, dropping
  // "Moose Juice^TM" (originally row 20) off the bottom of the 1d20 table.
  9: {
    roll: 9,
    name: 'Hot Sauce',
    description: '+5 Fire Damage Resistance until the end of the current encounter',
  },
  10: {
    roll: 10,
    name: 'Not An Energy Drink',
    description: '+5 Volt Damage Resistance until the end of the current encounter',
  },
  11: {
    roll: 11,
    name: 'Potion Of Incredible Charm',
    description: '+2 Diplomacy until the end of the current encounter',
  },
  12: {
    roll: 12,
    name: 'Maverick Potion',
    description: '+2 Piloting until the end of the current encounter',
  },
  13: {
    roll: 13,
    name: 'Dwarven Toughness Tonic',
    description: '+2 Grit until the end of the current encounter',
  },
  14: {
    roll: 14,
    name: 'Gymnast’s Booster Shot',
    description: '+2 Athletics until the end of the current encounter',
  },
  15: {
    roll: 15,
    name: 'Wizard’s Cheat',
    description: '+2 Magic until the end of the current encounter',
  },
  16: {
    roll: 16,
    name: 'Nerd’s Nuzzle',
    description: '+2 Tech until the end of the current encounter',
  },
  17: {
    roll: 17,
    name: 'Potion of Discovery',
    description: '+2 Search until the end of the current encounter',
  },
  18: {
    roll: 18,
    name: 'Sneaky Sauce',
    description: '+2 Shadow until the end of the current encounter',
  },
  19: {
    roll: 19,
    name: 'Common Sense Concentrate',
    description: '+2 World until the end of the current encounter',
  },
  20: {
    roll: 20,
    name: 'Quick Concentrate',
    description: '+1 Speed until the end of the current encounter',
  },
};

export const RARE_2D8_TABLE: Record<number, PotionEffect> = {
  2: { roll: 2, name: 'Shield Potion', description: '+3d6 to equipped Shield' },
  3: { roll: 3, name: 'Health Potion', description: '+3d6 to HP' },
  4: { roll: 4, name: 'Deadeye Potion', description: '+3 to your next Accuracy Roll' },
  5: { roll: 5, name: 'Overshield Potion', description: '+15 Overshield' },
  6: { roll: 6, name: 'Multi-Flavour Potion', description: '+1d8 Shields and +1d8 HP' },
  7: {
    roll: 7,
    name: 'Checkered Potion',
    description: '+3 Bonus to the next Check you make until the end of the current encounter',
  },
  8: { roll: 8, name: 'Gold Farming Brew', description: '+1d6 to the next Chest you loot' },
  9: { roll: 9, name: 'Potion Of Anticipation', description: '+1 MP' },
  10: {
    roll: 10,
    name: 'Paladin’s Tankard',
    description: '+5 Dark Damage Resistance until the end of the current encounter',
  },
  11: {
    roll: 11,
    name: 'Anti-Paladin Potion',
    description: '+5 Light Damage Resistance until the end of the current encounter',
  },
  12: {
    roll: 12,
    name: 'Gooey Gristle',
    description: '+5 Plasma Damage Resistance until the end of the current encounter',
  },
  13: {
    roll: 13,
    name: 'Not Today Bone Person',
    description: '+5 Entropy Damage Resistance until the end of the current encounter',
  },
  14: { roll: 14, name: 'Venereal Vacator', description: 'Cures all non-magical diseases' },
  15: {
    roll: 15,
    name: 'Liquid Mana Bread',
    description: 'This is blended bread. It tastes terrible. Go to hell. +1 MP',
  },
  16: {
    roll: 16,
    name: 'Liquid Lizard',
    description:
      'You regrow a missing limb, heal a gouged-out eye, or other, similar, permanent injury. Additionally, you gain +10 Overshields',
  },
};

export const EPIC_1D12_TABLE: Record<number, PotionEffect> = {
  1: { roll: 1, name: 'Shield Potion', description: '+4d8 to equipped Shield' },
  2: { roll: 2, name: 'Health Potion', description: '+4d8 to HP' },
  3: { roll: 3, name: 'Deadeye Potion', description: '+4 to your next Accuracy Roll' },
  4: { roll: 4, name: 'Overshield Potion', description: '+20 Overshields' },
  5: { roll: 5, name: 'Multi-Flavour Potion', description: '+2d6 Shields and +2d6 HP' },
  6: {
    roll: 6,
    name: 'Checkered Potion',
    description: '+4 Bonus to the next Check you make until the end of the current encounter',
  },
  7: { roll: 7, name: 'Lucky Potion', description: 'Advantage on your next Accuracy Roll' },
  8: {
    roll: 8,
    name: 'Breaker’s Brew',
    description: 'Effects from the next item you Lootbreak are increased by +5',
  },
  9: { roll: 9, name: 'Bulking Brew', description: '+2 Might until the end of the current encounter' },
  10: { roll: 10, name: 'Liquid Speed', description: '+2 Reflex until the end of the current encounter' },
  11: { roll: 11, name: 'Brain Blast', description: '+2 Mind until the end of the current encounter' },
  12: {
    roll: 12,
    name: 'Strengthening Drought',
    description: '+2 Willpower until the end of the current encounter',
  },
};

export const LEGENDARY_1D10_TABLE: Record<number, PotionEffect> = {
  1: { roll: 1, name: 'Shield Potion', description: '+5d10 to equipped Shield' },
  2: { roll: 2, name: 'Health Potion', description: '+5d10 to HP' },
  3: { roll: 3, name: 'Deadeye Potion', description: '+5 to your next Accuracy Roll' },
  4: { roll: 4, name: 'Overshield Potion', description: '+25 Overshield' },
  5: { roll: 5, name: 'Multi-Flavour Potion', description: '+2d10 Shields and +2d10 HP' },
  6: {
    roll: 6,
    name: 'Checkered Potion',
    description: '+5 Bonus to the next Check you make until the end of the current encounter',
  },
  7: {
    roll: 7,
    name: 'Drink Of Destiny',
    description:
      'The next time you would roll damage for a spell, gun attack, melee weapon attack, or a Talent’s effect, you deal maximum possible damage on all dice, instead of rolling',
  },
  8: {
    roll: 8,
    name: 'Reaper’s Sauce',
    description:
      'For the next three combat encounters, you cannot die. You may be Downed, but you will not fully die until the end of the third combat encounter, should you have normally died already. Really freaks out the locals.',
  },
  9: {
    roll: 9,
    name: 'Bedlam’s Bridal Booze',
    description:
      'You drink this, you go insane. There’s no Check, no way to avoid it. Throw this at enemies and watch them go berserk. It’ll be REALLY funny. A target hit by this potion sees everyone, and everything, as a hostile. They’ll fight to their last breath to kill everything around them. This effect ends after the target has killed everything in sight or is deceased.',
  },
  10: {
    roll: 10,
    name: 'Moonmilk',
    description:
      'Your bones turn to jelly. You slurp around like an ooze. It’s absolutely horrifying to look at, but you don’t die. You can squeeze through gaps as narrow as 1 inch, as long as you are not wearing equipment. This effect lasts until the end of the current encounter.',
  },
};

// Per-rarity roll metadata: how many dice and what sided. The 1d* tables can
// reuse a single d* roll; the 2d* tables sum two of them.
export interface PotionRoll {
  dice: number;
  sides: number;
}

export const POTION_ROLL_BY_RARITY: Record<Rarity, PotionRoll> = {
  Common: { dice: 2, sides: 12 },
  Uncommon: { dice: 1, sides: 20 },
  Rare: { dice: 2, sides: 8 },
  Epic: { dice: 1, sides: 12 },
  Legendary: { dice: 1, sides: 10 },
};

export const POTION_TABLE_BY_RARITY: Record<Rarity, Record<number, PotionEffect>> = {
  Common: COMMON_2D12_TABLE,
  Uncommon: UNCOMMON_1D20_TABLE,
  Rare: RARE_2D8_TABLE,
  Epic: EPIC_1D12_TABLE,
  Legendary: LEGENDARY_1D10_TABLE,
};
