import type { GuildName } from '../../types';

export interface ModuleEntry {
  name: string;
  text: string;
}

// Source: Lootbreaker_MeleeWeaponGeneration_Version0dot10.pdf — Step Five.
// Each guild has 6 modules, rolled 1d6. Names and effect text transcribed
// verbatim from the PDF.
export const GUILD_MODULES: Record<GuildName, ReadonlyArray<ModuleEntry>> = {
  Vandal: [
    {
      name: 'Sheol Flames',
      text: "Fire Damage from this weapon ignores any of the Target's Damage Resistance",
    },
    {
      name: 'Broken Pieces',
      text: 'When you Lootbreak an item, this weapon gains +5 Slashing Damage until the end of your next turn',
    },
    {
      name: 'Shoddy Build',
      text: 'Grave Hits with this weapon eject shrapnel in a 3 Square cone behind the target, dealing 2d4 Slashing Damage targets in the cone',
    },
    { name: 'Overdrive', text: 'Overheat Bonuses are doubled on this weapon' },
    {
      name: 'Riot Grip',
      text: '+5 Accuracy and +5 Damage against Horde/Swarm enemy types',
    },
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
      text: '+3 Accuracy with this weapon when more than one enemy is adjacent to you',
    },
    {
      name: 'Storm Array',
      text: 'Critical Hits with this weapon deal 1d12 Volt Damage to adjacent Targets',
    },
    {
      name: 'Thunderblast',
      text: 'Grave Hits give Knockback 2 to the target, and Knockback 1 to any adjacent targets',
    },
    {
      name: 'Equilibrium Shatter',
      text: "Grave Hits with this weapon affect the target's balance, giving the target -2 Accuracy until the end of their next turn",
    },
  ],
  Noctra: [
    { name: 'Nightclaw', text: '+4 Entropy Damage, +2 Speed when climbing' },
    {
      name: 'Do A Fade',
      text: 'Grave Hits with this weapon grant you Cloaked until the end of your next turn',
    },
    { name: 'Predator Refined', text: '+3 Shadow, +6 when Cloaked' },
    {
      name: 'Nightwalker Infection',
      text: 'Grave Hits with this weapon apply Vampire Weaknesses to the Target until the end of their next turn',
    },
    {
      name: 'Shadowblade',
      text: 'This weapon gains +10 Damage while you are Cloaked',
    },
    {
      name: 'Unholy Edge',
      text: 'You gain +2d12 Damage against paladins, clerics, or other, similar "Good Guys."',
    },
  ],
  Dominion: [
    { name: 'Shock Attachment', text: '+1d8 Volt Damage' },
    {
      name: 'Banneret',
      text: 'Grave Hits restore Shields equal to your Willpower score (Minimum 1) to all allies within 3 Squares',
    },
    { name: 'Basket Hilt', text: 'This weapon gains the Riposte' },
    {
      name: 'Imperial Might',
      text: 'When you gain the Downed Condition, you also gain Invincible 1',
    },
    {
      name: 'Riot Suppression Attachment',
      text: 'This weapon gains Cleave 2',
    },
    {
      name: 'Dominion Power',
      text: 'Grave Hits with this weapon apply Broken 1 to the target',
    },
  ],
  Ordis: [
    {
      name: "Hunter's Tempo",
      text: 'After you slay an enemy with this weapon, you gain stacking +1 Accuracy buff with this weapon until the end of the current encounter (Maximum +6)',
    },
    { name: 'Trophy Hunter', text: 'Loot Piles grant an additional +10 Gold' },
    {
      name: 'Ambush Tactics',
      text: 'Attacking an enemy who has not taken a turn in the first round of combat grants Advantage and +10 Damage',
    },
    {
      name: 'Armour Is My Religion',
      text: 'Whenever you gain Shields, you gain an additional +5 Shields',
    },
    {
      name: 'Poisoned Upgrade',
      text: 'Grave Hits with this weapon apply Vulnerable 1 to the target',
    },
    {
      name: 'Stalker Enhancement',
      text: 'Major and Grave Hits with this weapon apply Slowed 1 to the target',
    },
  ],
  'Ironwood Rangers': [
    {
      name: 'Wind Enchantments',
      text: 'Major and Grave Hits with this weapon apply Slashing Affliction 1',
    },
    {
      name: 'Thorned Charm',
      text: 'While this weapon is equipped, you gain Thorns 2',
    },
    {
      name: 'Ghillied Up',
      text: '+3 Shadow, +5 when you are in a forested or similar environment',
    },
    {
      name: 'Campfire Temperance',
      text: 'After taking a Quick Break, this weapon gains a +5 bonus to Accuracy and Damage for the next Combat Encounter',
    },
    {
      name: 'Rooted Stance',
      text: 'If you end your turn having not moved a Square, you gain +3 Overshields',
    },
    {
      name: 'Bleed Them',
      text: 'Grave Hits with this weapon apply Broken 1',
    },
  ],
  Wytchwyrd: [
    {
      name: 'Curse-Born',
      text: 'Major and Grave Hits with this weapon apply Hexed 1',
    },
    {
      name: 'Spell-Leech',
      text: 'After you cast a Spell, the next Melee Weapon Attack you make with this weapon before the end of your current turn gains +3 Accuracy and +3 Damage',
    },
    {
      name: 'Eldritch Resonator',
      text: 'Major and Grave Hits grant allies within 3 Squares a +2 bonus to their next Accuracy Roll',
    },
    {
      name: 'Hex Plague',
      text: 'Attacks with this weapon deal 1d6 Dark Damage to adjacent enemies',
    },
    { name: 'Darkblood', text: '+5 Dark Damage Resistance' },
    {
      name: 'Cauldron Charisma',
      text: 'Grave Hits with this weapon apply Taunted 1',
    },
  ],
  NecroTek: [
    {
      name: 'Reverse Funeral',
      text: 'Attacking a Downed target revives the target for the damage rolled. This Attack Action costs 1 VP',
    },
    {
      name: 'Funeral Crown',
      text: 'For each adjacent Loot Pile, you gain +2 to Accuracy Rolls',
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
      text: 'When you deal damage to Humanoid or Light Tagged enemies, you gain an additional +2 Damage against that target',
    },
    {
      name: 'Blade Of Malice',
      text: 'Major and Grave Hits deal an additional +2d4 Entropy Damage',
    },
  ],
  'Vow of Vending': [
    {
      name: 'Lanternbearer',
      text: 'Adjacent Allies gain +3 to Checks made to resist or end Conditions affecting them',
    },
    { name: 'Open Hand', text: 'This weapon gains Crumple 2' },
    {
      name: 'Almskeeper Seal',
      text: 'Whenever you heal a target while this weapon is equipped, you gain +3 to your next Accuracy Roll',
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
      name: "Paladin's Acceleration",
      text: 'When you heal a Downed target, you gain +2 MP',
    },
  ],
  Arkana: [
    {
      name: 'Spellbound Solution',
      text: '+3 to Checks made to resist Spells and Magic Effects',
    },
    {
      name: 'Spellblade',
      text: 'After you make a Melee Attack with this weapon, the next Spell you cast before the end of your current turn costs -1 MP',
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
      text: 'You gain +1 to your Grave hit Impact Threshold while this weapon is equipped',
    },
    {
      name: 'Trapped Caster',
      text: 'Casting a spell with this weapon equipped spawns a sigil underneath the targets of the spell, dealing 1d6 Volt Damage if a target starts its turn on a sigil',
    },
  ],
  Flamekeepers: [
    {
      name: 'Ignition Enchantment',
      text: 'Major and Grave Hits with this weapon grant Fire Affliction 1 to the target',
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
      text: 'When you deal Fire Damage to a target, adjacent enemies take the same Fire Damage',
    },
    {
      name: 'Embered Inlay',
      text: '+5 Fire Damage, +5 Fire Damage Resistance',
    },
  ],
  Banshee: [
    {
      name: "Deathbringer's Steel",
      text: 'You deal an additional +2d12 Damage to Spooked targets',
    },
    {
      name: 'Last Breath',
      text: 'When you are Downed, you gain a +5 Accuracy Bonus with this weapon',
    },
    {
      name: 'Touch Of Fear',
      text: 'Grave Hits with this weapon grant Spooked 1 to all adjacent enemies',
    },
    {
      name: 'Spirit Edge',
      text: '+3 Accuracy to incorporeal targets with this weapon',
    },
    {
      name: 'Grip Of Death',
      text: '+2 Overshields when you slay an enemy with this weapon',
    },
    {
      name: 'Encroaching Doom',
      text: 'You gain +3 to Accuracy and Damage rolls with this weapon when your Shields are depleted',
    },
  ],
};
