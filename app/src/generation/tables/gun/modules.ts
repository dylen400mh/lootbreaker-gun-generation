import type { DamageGuildName } from '../../types';

export interface ModuleEntry {
  name: string;
  text: string;
}

// Source: spec v0.12 Step Five. Each guild has 6 modules, rolled 1d6.
// Transcribed verbatim from the v0.12 gun spec (name = module title, text =
// effect). Vandal/Stormforged/Noctra are written "Name (effect)"; the rest
// are "Name – effect".
//
// Spec fidelity notes (transcribed as written, not corrected):
//   - Noctra lists a 7th module, "Deadly Rounds", which is unreachable via the
//     1d6 module roll. Kept for fidelity.
//   - Flamekeepers "Blazing Step" has no effect text in the spec (only the
//     action cost).
//   - Ordis "Underbarrel Grenade Launcher" says "part a Movement" (sic).
export const GUILD_MODULES: Record<DamageGuildName, ReadonlyArray<ModuleEntry>> = {
  Vandal: [
    { name: 'Heat Sink', text: '+4 Fire Damage Resistance' },
    {
      name: 'Frenzy Drive',
      text: 'If you roll a Medium Hit, gain +1 Speed until the end of your Turn, if you roll a Maximum Hit gain +3',
    },
    {
      name: 'Havoc Pulse',
      text: 'Deal 1d8 + MGT Kinetic Damage to Adjacent Enemies after you score a Medium or Maximum Hit',
    },
    {
      name: 'Ignition Framework',
      text: 'If you are struck by a Melee Attack the Attacker takes Fire Damage equal to your Willpower Score',
    },
    {
      name: 'Rigged Motivator',
      text: 'Gain a Boon when attempting to repair a piece of technology',
    },
    {
      name: '‘Splosive Core',
      text: 'Deal 2d10 Fire/Kinetic Damage to Adjacent Targets when you gain the Dying Debuff',
    },
  ],
  Stormforged: [
    { name: 'Power Relay', text: 'Deals +1d10 Volt Damage to Machines' },
    {
      name: 'Arc Step',
      text: 'After rolling a Maximum Hit, you can move a number of Squares equal to your Intellect Score',
    },
    {
      name: 'Ion Barrier',
      text: 'Gain +2 Overshield when you roll a Medium Hit, +5 if you Maximum Hit',
    },
    {
      name: 'Static Field',
      text: 'Adjacent Allies gain +2 Overshield when you roll a Medium or Maximum Hit',
    },
    { name: 'Electro-sense', text: 'Gain a Boon to Technology Impact Rolls' },
    { name: 'Grounded', text: '+5 Volt Damage Resistance' },
  ],
  Noctra: [
    { name: 'Shadow Saint', text: 'Gain a Boon on Larceny Impact Rolls' },
    {
      name: 'Auto-Injector',
      text: 'When you would gain the Dying Debuff, this weapon injects you with emergency blood (Or goo, brains, etc), granting you +2d8 Health, potentially avoiding the Dying Debuff if the amount of healing done outweighs the damage and health remaining',
    },
    {
      name: 'Arterial Sync',
      text: 'This weapon is fused with your bloodstream, providing a Boon to all Impact Rolls forced on you by an enemy',
    },
    {
      name: 'Blood Mist',
      text: '1 AP – 2 MP – ReAction – When you are the Target of a Ranged Attack, Spray a concealing mist of blood, granting a Bane on the Triggering Attack',
    },
    { name: 'Charming Projector', text: 'Gain a Boon on Diplomacy Impact Rolls' },
    {
      name: 'Hemodrive Actuator',
      text: '1 AP – 3 MP - Interact – Take 1d4 + 2 True Damage, gain a bonus to your Speed equal to the Damage Taken',
    },
    { name: 'Deadly Rounds', text: 'Maximum Hits apply Slashing Affliction 2' },
  ],
  Dominion: [
    {
      name: 'Piercing Rounds',
      text: 'Guns made by Dominion downgrade a Target’s Cover bonus. A Target in Full Cover is reduced to Half Cover. A Target in Half Cover is reduced to no Cover for this Attack',
    },
    {
      name: 'Gravitar Chamber',
      text: 'Targets who take damage from this weapon suffer Slow 1',
    },
    {
      name: 'Smart Sensor',
      text: 'Targets within 2 Squares of you cannot benefit from the Cloaked Condition',
    },
    { name: 'Techeon Chip', text: 'Gain a Boon on Technology Impact Rolls' },
    { name: 'Zealous Might', text: 'Gain the Grit and Religion Skills' },
    {
      name: 'Might of the Dominion',
      text: 'Allies within 5 Squares gain a Boon on Impact Rolls with Dominion-made Guns',
    },
  ],
  Ordis: [
    {
      name: 'Ricochet Rounds',
      text: 'Maximum Hits deal 1/2 Damage to the nearest hostile Target',
    },
    {
      name: 'Attachment Rail',
      text: 'You can use a 2nd Weapon Attachment Trinket with this Weapon',
    },
    {
      name: 'Drum Magazine',
      text: 'Gun Attacks gain an additional 2d4 Damage (Matching Weapon Type)',
    },
    {
      name: 'Underbarrel Grenade Launcher',
      text: '1 AP - 3 MP – Attack Action - Launch a Grenade at a Square in Range. It deals 3d8 Kinetic and Fire Damage, and has the Splash 1 Keyword',
    },
    {
      name: 'Tactical Sling (It’s Faster than Reloading)',
      text: 'Switch to another weapon in your pack as your Equipped Weapon as part a Movement or Interact Action',
    },
    { name: 'Intimidating Aura', text: 'Gain the Aura and Intimidation Skills' },
  ],
  'Ironwood Rangers': [
    { name: 'Pocket Handbook', text: 'Gain the Nature and World Skills' },
    { name: 'Brambleshot', text: 'On a Maximum Hit, the Target Suffers Bleeding 2' },
    { name: 'Feather Design', text: '+1 Speed' },
    {
      name: 'Terrain Advantage',
      text: 'Gain a Boon on Impact Rolls with this weapon when Attacking from at least 2 Squares above the Target',
    },
    {
      name: 'Hunter’s Mark',
      text: 'Subsequent Attacks with this Weapon at a Target you have Damaged already gain +2 Damage (Does not Stack)',
    },
    {
      name: 'Camouflage Engine',
      text: '[4 MP, 1 AP – Interact] Become Cloaked until the End of your Next Turn',
    },
  ],
  Wytchwyrd: [
    { name: 'Eye of the Coven', text: 'Gain the Magic History and Search Skills' },
    {
      name: 'Mark of Woe',
      text: 'Maximum Hits apply the Weakened 1 Debuff to Targets',
    },
    {
      name: 'Sacrificial Sigil',
      text: '[3 MP - 1 AP – Interact] Deal 2d10 True Damage to your Health. Your next Gun Attack with this Weapon gains +3d8 Dark Damage',
    },
    {
      name: 'Runic Conduit',
      text: 'Gain +1 Momentum when you score a Maximum Hit with this weapon',
    },
    {
      name: 'Fate Rewritten',
      text: '[3 MP - 1 AP – ReAction] After rolling an Impact Roll forced on you by another creature, you can use this ReAction to Re-Roll the Impact Roll with a Boon',
    },
    {
      name: 'Coven’s Chorus',
      text: 'When an Ally within 5 Squares is wielding a Wytchwyrd Weapon, you both gain a Boon to the Impact Roll and +2 Dark Damage on Attacks with those Weapons. This effect can Stack, the damage increasing by +2 for each ally’s equipped Wytchwyrd weapon with the same Module',
    },
  ],
  NecroTek: [
    {
      name: 'Soul Battery',
      text: 'If you kill any living Target, a Will O’ The Wisp spawns on the Square it occupied, hovering above the Loot Pile. If you, or an Ally, Loots the Pile while the Will O’ The Wisp is active, they gain Shields equal to double your Willpower Score. The Will O’ The Wisp lasts for 3 Turns before fading away.',
    },
    {
      name: 'Necrotic Wave',
      text: 'The first time your Shields are reduced to 0 Capacity in a combat encounter, you deal 2d8 Entropy Damage to Adjacent Enemies',
    },
    {
      name: 'Corpsewail',
      text: 'If you reduce a Target to 0 Health, the soul escapes the body, releasing a wail that deals 2d4 Kinetic/Dark Damage to targets within 2 squares',
    },
    { name: 'Spectre’s Cloak', text: 'Gain a Boon on Larceny Impact Rolls' },
    {
      name: 'Corpse Chain',
      text: 'You can shoot the Loot Pile dropped by a Target, causing the Loot to be destroyed, but it deals 4d6 Entropy Damage to all Targets within 3 Squares',
    },
    {
      name: 'Skeletal Destruction',
      text: 'You gain a Boon on Impact Rolls against Undead Targets',
    },
  ],
  'Vow of Vending': [
    { name: 'Heroic Cape', text: 'Gain the Aura and Persuasion Skills' },
    {
      name: 'Paladin’s Bulwark',
      text: 'Gain +1/+2/+3/+4/+5 Kinetic Damage Resistance, based on rarity',
    },
    {
      name: 'Healing Shots',
      text: 'If you Roll a Maximum Hit on a Target, you can choose another Target within Range to gain Health equal to twice your Willpower Score (Minimum 1)',
    },
    {
      name: 'Smite',
      text: 'As a ReAction after dealing damage with this weapon to a Target, [1 AP, X MP] You can Smite the Target for Xd4 Light Damage, where X Equals the amount of Momentum Spent.',
    },
    {
      name: 'Aura of Defence',
      text: 'You and any allies within 2 Squares gain a Boon to Impact Rolls forced on you by enemies.',
    },
    {
      name: 'Branded by Holy Fire',
      text: 'If you roll a Maximum Hit with this weapon, the next Attack made against the same Target gains a Boon',
    },
  ],
  Arkana: [
    {
      name: 'Spellbound Solution',
      text: 'Your Spells deal an additional +2 Damage as long as this weapon is equipped.',
    },
    {
      name: 'Overcharged Feedback',
      text: 'If you Apply an Affliction Debuff to a Target, it gains Weakened 1 Debuff as well',
    },
    {
      name: 'Elemental Overflow',
      text: 'When you cast a Spell, deal 1d6 Chosen Common Elemental Damage to Adjacent Enemies to the Original target.',
    },
    {
      name: 'Shifting Wards',
      text: '[3 MP, 1 AP ReAction] When you take Common Elemental Damage, you can use this ReAction to halve incoming Damage. Until the End of your Next Turn, gain +4 Damage Resistance matching the Common Elemental Damage Type that Triggered this ReAction',
    },
    {
      name: 'Spellcharged Barrel',
      text: '[Interact 1 AP – X MP] As an Interact Action, charge your barrel with a Chosen Common Elemental Damage Type. Your next Gun Attack with this weapon gains +1d4 Chosen Damage type per MP Spent',
    },
    {
      name: 'Magical Guidance',
      text: 'Gain a Boon on all Magic Skill Impact Rolls',
    },
  ],
  Flamekeepers: [
    {
      name: 'Burnt Muzzle',
      text: 'If you roll a Maximum Hit, the Target gains Fire Affliction 1',
    },
    {
      name: 'Burn the Weakness',
      text: 'If you damage a Target that is suffering from Fire Affliction, deal additional Fire Damage equal to double your Willpower Score (Minimum 2)',
    },
    { name: 'Blazing Step', text: 'ReAction [1 AP, 1 MP]' },
    {
      name: 'Scarred by the Flame',
      text: 'You gain +2 Fire Damage Resistance, and you cannot gain the Fire Affliction Condition',
    },
    {
      name: 'Emberstorm',
      text: 'Starting at +1, each Round of a Combat encounter grants you an additional +1 Fire Damage, up to a maximum of +10. This bonus resets at the end of a combat encounter',
    },
    {
      name: 'Book of Cinders',
      text: '+2 World, +5 World when making a Check concerning religions',
    },
  ],
  Banshee: [
    {
      name: 'Soul Consumption',
      text: 'When a Target Suffering from an Affliction Debuff that you damaged with this weapon dies, the Loot Pile they drop becomes Afflicted. When a Loot Pile is Afflicted in this way, you or an ally that loots the pile gains MP equal to your Mind Score',
    },
    {
      name: 'Torment Cascade',
      text: 'If you Apply an Affliction to a Target with this weapon, you may also apply an Affliction to another Target within Range of this Weapon',
    },
    { name: 'Wards of Knowledge', text: 'Gain a Magic or Intellect Skill' },
    {
      name: 'Wraithmark',
      text: 'Targets that are suffering from an Affliction Debuff that you gave them take an additional +2d8 Affliction Damage (Matching Type) at the start of their Turns',
    },
    {
      name: 'Vengeful Shade',
      text: 'When you gain the Dying Debuff, you may use this ReAction [2 AP, 3 MP] to cause the attacker to gain a random Affliction 2 Debuff',
    },
    {
      name: 'Death Spiral',
      text: 'If you inflict an Affliction Debuff, the Affliction deals an additional +2d6 Damage for the duration',
    },
  ],
};
