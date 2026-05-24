import type { DamageGuildName } from '../../types';

export interface ModuleEntry {
  name: string;
  text: string;
}

// Source: spec Step 5. Each guild has 6 modules, rolled 1d6.
// v1 change: Noctra's 7th entry "Deadly Rounds" is dropped.
export const GUILD_MODULES: Record<DamageGuildName, ReadonlyArray<ModuleEntry>> = {
  Vandal: [
    { name: 'Heat Sink', text: '+4 Fire Damage Resistance' },
    {
      name: 'Frenzy Drive',
      text: 'If you roll a Major Hit, gain +1 Speed until end of Turn; Grave Hit grants +3',
    },
    {
      name: 'Havoc Pulse',
      text: 'Deal 1d8 + MGT Kinetic Damage to Adjacent Enemies after a Major or Grave Hit',
    },
    {
      name: 'Ignition Framework',
      text: 'If struck by a Melee Attack, the Attacker takes Fire Damage equal to your Willpower Score',
    },
    { name: 'Rigged Motivator', text: 'Gain +3 Tech when attempting to repair technology' },
    {
      name: "'Splosive Core",
      text: 'Deal 2d10 Fire/Kinetic Damage to Adjacent Targets when you gain the Downed Condition',
    },
  ],
  Stormforged: [
    { name: 'Power Relay', text: 'Deals +1d10 Volt Damage to Robots' },
    {
      name: 'Arc Step',
      text: 'After rolling a Grave Hit, move a number of Squares equal to your Mind Score',
    },
    { name: 'Ion Barrier', text: 'Gain +2 Overshield on Major Hit, +5 on Grave Hit' },
    {
      name: 'Static Field',
      text: 'Adjacent Allies gain +2 Overshield when you roll a Major or Grave Hit',
    },
    { name: 'Electro-sense', text: 'Gain +2 Tech' },
    { name: 'Grounded', text: '+5 Volt Damage Resistance' },
  ],
  Noctra: [
    { name: 'Shadow Saint', text: '+2 Shadow' },
    {
      name: 'Auto-Injector',
      text: 'When you would be Downed, this weapon injects you with emergency blood (Or goo, brains, etc), granting you +2d8 Health, potentially avoiding the Downed Condition if the amount of healing done outweighs the damage and health remaining',
    },
    {
      name: 'Arterial Sync',
      text: 'This weapon is fused with your bloodstream, providing +2 to all Checks to avoid or end the Stunned, Cursed, Frozen, Slow, Taunted, and Charmed Conditions',
    },
    {
      name: 'Blood Mist',
      text: '1 AP – 2 MP – ReAction – When you are the Target of a Ranged Attack, Spray a concealing mist of blood, granting disadvantage on the Triggering Attack',
    },
    { name: 'Charming Projector', text: '+2 Diplomacy' },
    {
      name: 'Hemodrive Actuator',
      text: '1 AP – 3 MP - Interact – Take 1d4 + 2 True Damage, gain a bonus to your Speed equal to the Damage Taken',
    },
  ],
  Dominion: [
    {
      name: 'Piercing Rounds',
      text: "Guns made by Dominion downgrade a Target's Cover bonus. A Target in Full Cover is reduced to Half Cover. A Target in Half Cover is reduced to no Cover for this Attack",
    },
    {
      name: 'Gravitar Chamber',
      text: 'Targets who take damage from this weapon suffer Slow 1',
    },
    {
      name: 'Smart Sensor',
      text: 'Targets within 2 Squares of you cannot benefit from the Cloaked Condition',
    },
    { name: 'Techeon Chip', text: '+2 Tech' },
    { name: 'Zealous Might', text: '+2 Grit' },
    {
      name: 'Might of the Dominion',
      text: 'Allies within 5 Squares who are also wielding Dominion-made weapons gain +3 Accuracy',
    },
  ],
  Ordis: [
    {
      name: 'Ricochet Rounds',
      text: 'Grave Hits deal 1/2 Damage to the nearest hostile Target',
    },
    {
      name: 'Attachment Rail',
      text: 'You can use a 2nd Weapon Attachment Trinket with this Weapon',
    },
    {
      name: 'Drum Magazine',
      text: 'Gun Attacks gain an additional 2d4 Damage (matching weapon type)',
    },
    {
      name: 'Underbarrel Grenade Launcher',
      text: '1 AP - 2 MP - Attack Action - Launch a Grenade at a square in range. It deals 3d8 Kinetic and Fire Damage, and has the Splash 1 Keyword',
    },
    {
      name: 'Tactical Sling',
      text: 'Switch to another weapon in your pack as your equipped weapon as part of a Movement or Interact Action',
    },
    { name: 'Intimidating Aura', text: '+2 Diplomacy' },
  ],
  'Ironwood Rangers': [
    { name: 'Pocket Handbook', text: '+2 World' },
    { name: 'Brambleshot', text: 'On a Grave Hit, the Target suffers Bleeding 2' },
    { name: 'Feather Design', text: '+1 Speed' },
    {
      name: 'Terrain Advantage',
      text: 'Gain +3 Accuracy when Attacking from at least 2 Squares above the Target',
    },
    {
      name: "Hunter's Mark",
      text: "Subsequent Attacks against a Target you've already damaged gain +2 Damage",
    },
    {
      name: 'Camouflage Engine',
      text: '[4 MP, 1 AP, Interact] Become Cloaked until End of Next Turn',
    },
  ],
  Wytchwyrd: [
    { name: 'Eye of the Coven', text: '+2 Search' },
    { name: 'Mark of Woe', text: 'Grave Hits apply Weakened 1 to Targets' },
    {
      name: 'Sacrificial Sigil',
      text: '[3 MP, 1 AP, Interact] Deal 2d10 True Damage to yourself; next Gun Attack gains +3d10 Dark Damage',
    },
    { name: 'Runic Conduit', text: 'Gain +1 Momentum when you score a Grave Hit' },
    {
      name: 'Fate Rewritten',
      text: '[3 MP, 1 AP, ReAction] After Failing a Check, re-roll at Advantage',
    },
    {
      name: "Coven's Chorus",
      text: "When an Ally within 5 Squares wields a Wytchwyrd Weapon, both gain +2 Accuracy and +2 Dark Damage. This effect can Stack, increasing by +2 for each ally's equipped Wytchwyrd weapon with the same Module",
    },
  ],
  NecroTek: [
    {
      name: 'Soul Battery',
      text: "If you kill any living Target, a Will O' The Wisp spawns on the Square it occupied, hovering above the Loot Pile. If you, or an Ally, Loots the Pile while the Will O' The Wisp is active, they gain Shields equal to your Mettle Score. The Will O' The Wisp lasts for 3 Turns before fading away.",
    },
    {
      name: 'Necrotic Wave',
      text: 'The first time your Shields are reduced to 0 Capacity in a combat encounter, you deal 2d8 Entropy Damage to Adjacent Enemies',
    },
    {
      name: 'Corpsewail',
      text: 'If you reduce a Target to 0 Health, the soul escapes the body, releasing a wail that can Stun nearby enemies. [1 AP ReAction/4 MP] Enemeis within 2 Squares of the defeated Target must make a Mind Check against your DC, gaining Stunned 1 on Failure. On a Success, nothing happens.',
    },
    { name: "Spectre's Cloak", text: '+2 Shadow' },
    {
      name: 'Corpse Chain',
      text: 'You can shoot the Loot Pile dropped by a Target, causing the Loot to be destroyed, but it deals 4d6 Entropy Damage to all Targets within 3 Squares',
    },
    { name: 'Spell: Raise Skeleton', text: 'Spell: Raise Skeleton' },
  ],
  'Vow of Vending': [
    { name: 'Heroic Cape', text: '+2 Diplomacy' },
    {
      name: "Paladin's Bulwark",
      text: 'Gain +1/+2/+3/+4/+5 Kinetic Damage Resistance (by rarity)',
    },
    {
      name: 'Healing Shots',
      text: 'On a Grave Hit, choose another Target in Range to gain Health equal to twice your Willpower Score (Minimum 1)',
    },
    {
      name: 'Smite',
      text: 'As a ReAction after dealing damage with this weapon to a Target, [1 AP, X MP] You can Smite the Target for Xd4 Light Damage, where X Equals the amount of Momentum Spent.',
    },
    {
      name: 'Aura of Defence',
      text: 'You and any Adjacent Allies gain a bonus to Checks made to resist Conditions and Spell Effects equal to your Willpower Score (Minimum 1)',
    },
    {
      name: 'Branded by Holy Fire',
      text: 'If you roll a Grave Hit with this weapon, the next Attack made against the same Target gains a bonus to the Accuracy Roll equal to your Willpower Score (Minimum 1)',
    },
  ],
  Arkana: [
    {
      name: 'Spellbound Solution',
      text: 'Your Check DC for Spells gains a +2 Bonus',
    },
    {
      name: 'Overcharged Feedback',
      text: 'If you Apply an Affliction to a Target, it gains Weakened 1',
    },
    {
      name: 'Elemental Overflow',
      text: 'When you cast a Spell, deal 1d6 Chosen Common Elemental Damage to Adjacent Enemies',
    },
    {
      name: 'Shifting Wards',
      text: '[3 MP, 1 AP ReAction] When you take Common Elemental Damage, you can use this ReAction to halve incoming Damage. Until the End of your Next Turn, gain +4 Damage Resistance matching the Common Elemental Damage Type that Triggered this ReAction',
    },
    {
      name: 'Spellcharged Barrel',
      text: '[Interact 1 AP – X MP] As an Interact Action, charge your barrel with a Chosen Common Elemental Damage Type. Your next Gun Attack with this weapon gains +1d4 Chosen Damage type per MP Spent',
    },
    { name: 'Magical Guidance', text: '+2 Magic' },
  ],
  Flamekeepers: [
    {
      name: 'Burnt Muzzle',
      text: 'If you roll a Grave Hit, the Target gains Fire Affliction 1',
    },
    {
      name: 'Burn the Weakness',
      text: 'If you damage a Target that is suffering from Fire Affliction, deal additional Fire Damage equal to your Willpower Score (Minimum 1)',
    },
    {
      name: 'Blazing Step',
      text: 'If you use the Dodge ReAction, you may deal Fire Damage to the triggering Attacker equal to your Willpower Score (Minimum 1)',
    },
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
      text: 'When a Target Suffering from an Affliction that you damaged with this weapon dies, the Loot Pile they drop becomes Afflicted. When a Loot Pile is Afflicted in this way, you or an ally that loots the pile gains MP equal to your Mind Score',
    },
    {
      name: 'Torment Cascade',
      text: 'Applying an Affliction to a Target also applies one to another Target in Range',
    },
    { name: 'Wards of Knowledge', text: '+1 Magic, +1 World, +1 Tech' },
    {
      name: 'Wraithmark',
      text: 'Targets that are suffering from an Affliction that you gave them take an additional +2d8 Affliction Damage (Matching Type) at the start of their Turns',
    },
    {
      name: 'Vengeful Shade',
      text: 'When you gain the Downed Condition, you may use this ReAction [2 AP, 5 MP] to cause the attacker to gain a random Affliction',
    },
    {
      name: 'Death Spiral',
      text: 'If you inflict an Affliction with a Grave Hit, the Affliction deals an additional +2d6 Damage for the duration',
    },
  ],
};
