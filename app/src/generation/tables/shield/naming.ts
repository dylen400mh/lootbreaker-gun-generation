// Source: spec v0.12 "Naming". 1d10 → shield base name.
export const SHIELD_BASE_NAMES: ReadonlyArray<string> = [
  'Aegis',     // 1
  'Bulwark',   // 2
  'Bastion',   // 3
  'Rampart',   // 4
  'Ward',      // 5
  'Sentinel',  // 6
  'Barrier',   // 7
  'Safeguard', // 8
  'Defiant',   // 9
  'Plate',     // 10
];

// Source: spec v0.12 "Prefixes and Suffixes" — a 1d100 table where each entry
// spans two rolls (1-2, 3-4, …, 99-100), giving 50 prefixes and 50 suffixes.
// Index with floor((roll - 1) / 2). Shields use these dedicated lists, not the
// shared gun/melee prefix/suffix table. A shield gets either a prefix or a
// suffix, never both.
export const SHIELD_PREFIXES: ReadonlyArray<string> = [
  'Iron', 'Steel', 'Stone', 'Storm', 'Flame', 'Frost', 'Shadow', 'Light',
  'Sun', 'Moon', 'Star', 'Void', 'Blood', 'Bone', 'Ash', 'Ember', 'Thunder',
  'Gale', 'Tidal', 'Deep', 'Crystal', 'Obsidian', 'Gold', 'Silver', 'Bronze',
  'Platinum', 'Runic', 'Arcane', 'Mystic', 'Eldritch', 'Divine', 'Sacred',
  'Profane', 'Cursed', 'Nice', 'Warded', 'Emperor’s', 'Empress’', 'Tyrant’s',
  'Rebel’s', 'Grim', 'Ivory', 'Sable', 'Unbroken', 'Ever', 'King’s', 'Queen’s',
  'Argent', 'Voided', 'Blessed',
];

export const SHIELD_SUFFIXES: ReadonlyArray<string> = [
  'Protector', 'Carapace', 'Mantle', 'Cloak', 'Veil', 'Screen', 'Shell',
  'Citadel', 'Fortress', 'Defender', 'Defiance', 'Resolve', 'Endurance',
  'Resilient', 'Fortitude', 'Vigil', 'Watch', 'Barricade', 'Blocker', 'Cover',
  'Sanctum', 'Refuge', 'Haven', 'Seal', 'Brace', 'Anchor', 'Frame', 'Nullifier',
  'Interceptor', 'Dampener', 'Holdfast', 'Deflector', 'Watcher', 'Garrison',
  'Redoubt', 'Picket', 'Shockwall', 'Forcefield', 'Forcewall', 'Bracer',
  'Shield', 'Phaseline', 'Ironveil', 'Battlement', 'Rioter', 'Rearguard',
  'Vanguard', 'Abosorber', 'Lattice', 'Standard',
];
