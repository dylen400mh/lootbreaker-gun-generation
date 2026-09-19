import type { DamageGuildName } from '../../types';

export interface ModuleEntry {
  name: string;
  text: string;
}

// Source: spec v0.12 (Lootbreaker_MeleeWeaponGeneration_Version0dot12.pdf) —
// Step Five. Each guild has 6 modules, rolled 1d6, written "Name: effect".
// Transcribed verbatim (name = module title, text = effect).
//
// Spec fidelity note: a few modules still use the pre-v0.12 hit terminology
// ("Major and Grave Hits") even though the rest of the spec moved to
// Medium/Maximum — kept as written (Ordis "Stalker Enhancement", Wytchwyrd
// "Curse-Born").
export const GUILD_MODULES: Record<DamageGuildName, ReadonlyArray<ModuleEntry>> = {
  Vandal: [
    {
      name: 'Sheol Flames',
      text: 'Fire Damage from this weapon ignores any of the Target’s Damage Resistance',
    },
    {
      name: 'Broken Pieces',
      text: 'When you Lootbreak an item, this weapon gains +5 Slashing Damage until the end of your next turn',
    },
    {
      name: 'Shoddy Build',
      text: 'Maximum Hits with this weapon eject shrapnel in a 3 Square cone behind the target, dealing 2d4 Slashing Damage targets in the cone',
    },
    { name: 'Overdrive', text: 'Overheat Bonuses are doubled on this weapon' },
    { name: 'Riot Grip', text: '+5 Damage against Horde/Swarm enemy types' },
    { name: 'Concrete Breaker', text: '+15 Damage against structures' },
  ],
  Stormforged: [
    {
      name: 'Leeching Edge',
      text: 'Whenever you deal damage to a shield, you gain Shields equal to your Might Score (Minimum 1)',
    },
    {
      name: 'High Voltage Loot',
      text: 'When you slay an enemy with this weapon, the Loot Pile dropped by this enemy becomes electrified, dealing 2d6 Volt Damage to adjacent enemies when it is looted',
    },
    {
      name: 'Eye Of The Storm',
      text: 'Gain a Boost with this weapon when more than one enemy is adjacent to you',
    },
    {
      name: 'Storm Array',
      text: 'Critical Hits with this weapon deal 1d12 Volt Damage to adjacent Targets',
    },
    {
      name: 'Thunderblast',
      text: 'Maximum Hits give Push 2 to the target, and Push 1 to any adjacent targets',
    },
    {
      name: 'Equilibrium Shatter',
      text: 'Maximum Hits with this weapon affect the target’s balance, giving the target a Bane on the next Impact Roll they make',
    },
  ],
  Noctra: [
    { name: 'Nightclaw', text: '+4 Entropy Damage, +2 Speed when climbing' },
    {
      name: 'Do A Fade',
      text: 'Maximum Hits with this weapon grant you Cloaked until the end of your next turn',
    },
    { name: 'Predator Refined', text: 'Gain a Boost to Larceny Rolls' },
    {
      name: 'Nightwalker Infection',
      text: 'Maximum Hits with this weapon apply Vampire Weaknesses to the Target until the end of their next turn',
    },
    { name: 'Shadowblade', text: 'This weapon gains +5 Damage while you are Cloaked' },
    {
      name: 'Unholy Edge',
      text: 'You gain +2d12 Damage against paladins, clerics, or other, similar “Good Guys.”',
    },
  ],
  Dominion: [
    { name: 'Shock Attachment', text: '+1d8 Volt Damage' },
    {
      name: 'Banneret',
      text: 'Maximum Hits restore Shields equal to your Willpower score (Minimum 1) to all allies within 3 Squares',
    },
    { name: 'Basket Hilt', text: 'This weapon gains the Riposte Keyword' },
    {
      name: 'Imperial Might',
      text: 'The first time you gain the Dying Condition in an encounter, you also gain Invincible 1',
    },
    { name: 'Crowd Control Attachment', text: 'This weapon gains Cleave 2' },
    {
      name: 'Dominion Power',
      text: 'Maximum Hits with this weapon apply Broken 1 to the target',
    },
  ],
  Ordis: [
    {
      name: 'Hunter’s Tempo',
      text: 'After you slay an enemy with this weapon, you gain a Boost to all Impact Rolls until the end of your turn.',
    },
    { name: 'Trophy Hunter', text: 'Loot Piles grant an additional +10 Gold' },
    {
      name: 'Ambush Tactics',
      text: 'Attacking an enemy who has not taken a turn in the first round of combat grants a Boost to Impact Rolls and +5 Damage',
    },
    {
      name: 'Armour Is My Religion',
      text: 'Whenever you gain Shields, you gain an additional +2 Shields',
    },
    {
      name: 'Poisoned Upgrade',
      text: 'Maximum Hits with this weapon apply Broken 1 to the target',
    },
    {
      name: 'Stalker Enhancement',
      text: 'Major and Grave Hits with this weapon apply Hinder 1 to the target',
    },
  ],
  'Ironwood Rangers': [
    {
      name: 'Wind Enchantments',
      text: 'Medium and Maximum Hits with this weapon apply Slashing Affliction 1',
    },
    { name: 'Thorned Charm', text: 'While this weapon is equipped, you gain Thorns 1' },
    {
      name: 'Ghillied Up',
      text: 'Gain a Boost on Larceny Rolls, Gain the Sneaking Skill',
    },
    {
      name: 'Campfire Temperance',
      text: 'After taking a Quick Break, this weapon gains a +5 bonus to Damage for the next Combat Encounter',
    },
    {
      name: 'Rooted Stance',
      text: 'If you end your turn having not moved a Square, you gain +3 Overshields',
    },
    { name: 'Bleed Them', text: 'Maximum Hits with this weapon apply Broken 1' },
  ],
  Wytchwyrd: [
    { name: 'Curse-Born', text: 'Major and Grave Hits with this weapon apply Hexed 1' },
    {
      name: 'Spell-Leech',
      text: 'After you cast a Spell, the next Melee Weapon Attack you make with this weapon before the end of your current turn gains +3 Damage',
    },
    {
      name: 'Eldritch Resonator',
      text: 'Medium and Maximum Hits grant allies within 3 Squares a Boost to their next Impact Roll',
    },
    {
      name: 'Hex Plague',
      text: 'Attacks with this weapon deal 1d6 Dark Damage to adjacent enemies',
    },
    { name: 'Darkblood', text: '+5 Dark Damage Resistance' },
    {
      name: 'Cauldron Charisma',
      text: 'Maximum Hits with this weapon apply Taunted 1',
    },
  ],
  NecroTek: [
    {
      name: 'Reverse Funeral',
      text: 'Attacking a Dying target revives the target for the damage rolled. This Attack Action costs 1 VP',
    },
    {
      name: 'Funeral Crown',
      text: 'When you are adjacent to a Loot Pile, you gain Boost to Impact Rolls',
    },
    {
      name: 'Marrowguard',
      text: 'Slaying a target with this weapon grants +2 Overshield',
    },
    {
      name: 'Endless Dark',
      text: 'Targets suffering from Entropy Affliction take an additional +2d10 Entropy Damage from this weapon',
    },
    {
      name: 'Vile Creation',
      text: 'When you deal damage to Humanoid or Light Tagged enemies, you gain an additional +3 Damage against that target',
    },
    {
      name: 'Blade Of Malice',
      text: 'Medium and Maximum Hits deal an additional +2d4 Entropy Damage',
    },
  ],
  'Vow of Vending': [
    { name: 'Lanternbearer', text: 'Adjacent Allies gain a Boost to Impact Rolls' },
    { name: 'Open Hand', text: 'This weapon gains Push 2' },
    {
      name: 'Almskeeper Seal',
      text: 'Whenever you heal a target while this weapon is equipped, you gain a Boost to your next Impact Roll',
    },
    {
      name: 'Light Inlay',
      text: 'When you use a potion to regain Shields or HP while this weapon is equipped, you gain an additional +1d8 Healing',
    },
    {
      name: 'Slayer Enchantment',
      text: 'When you deal damage to Undead, Dark, or Entropy Tagged enemies, you gain an additional +5 Damage against that target',
    },
    {
      name: 'Paladin’s Acceleration',
      text: 'When you heal a Dying target, you gain +2 MP',
    },
  ],
  Arkana: [
    { name: 'Spellbound Solution', text: 'Gain a Magic Skill' },
    {
      name: 'Spellblade',
      text: 'After you make a Melee Attack with this weapon, the next Spell you cast before the end of your current turn costs -1 MP (minimum 0)',
    },
    {
      name: 'Arcane Burn',
      text: 'Enemies that take damage from this weapon take +5 Damage from spells you cast until the end of your next turn',
    },
    {
      name: 'Magic Recycler',
      text: 'Casting a spell with this weapon equipped refunds 1 MP to you',
    },
    {
      name: 'Future Sight',
      text: 'You gain a Boost to Impact Rolls you are subjected to',
    },
    {
      name: 'Trapped Caster',
      text: 'Casting a spell with this weapon equipped spawns a sigil underneath the targets of the spell, dealing 1d6 Volt Damage if a target starts its turn on a sigil',
    },
  ],
  Flamekeepers: [
    {
      name: 'Ignition Enchantment',
      text: 'Medium and Maximum Hits with this weapon grant Fire Affliction 1 to the target',
    },
    {
      name: 'Sanctified Steel',
      text: 'You are immune to Fire Affliction while this weapon is equipped',
    },
    {
      name: 'Compounding Holy Fire',
      text: 'Targets suffering from Fire Affliction take an additional +2d10 Fire Damage from this weapon',
    },
    {
      name: 'Funeral Pyre',
      text: 'After you slay an enemy with this weapon, choose any number of adjacent Squares to the target. A Fire Hazard is created there, which deals 2d6 Fire Damage, and it lasts until the end of your next turn',
    },
    {
      name: 'Link The Fires',
      text: 'When you deal Fire Damage to a target, adjacent enemies take half Fire Damage',
    },
    {
      name: 'Embered Inlay',
      text: '+5 Fire Damage, +5 Fire Damage Resistance',
    },
  ],
  Banshee: [
    {
      name: 'Deathbringer’s Steel',
      text: 'You deal an additional +2d12 Damage to Spooked targets',
    },
    {
      name: 'Last Breath',
      text: 'When you are Dying, you gain a Boost to Impact Rolls with this weapon',
    },
    {
      name: 'Touch Of Fear',
      text: 'Maximum Hits with this weapon grant Spooked 1 to all adjacent enemies',
    },
    {
      name: 'Spirit Edge',
      text: 'Gain a Boost to Impact Rolls against incorporeal targets with this weapon',
    },
    {
      name: 'Grip Of Death',
      text: '+2 Overshields when you slay an enemy with this weapon',
    },
    {
      name: 'Encroaching Doom',
      text: 'You gain a Boost to Impact Rolls and +2 Damage rolls with this weapon when your Shields are depleted',
    },
  ],
};
