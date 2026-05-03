import type { WeaponType } from '../types';

export interface Abbrev {
  short: string;
  long: string;
}

// Source: spec Step 7a. 1d6 per weapon type.
export const ABBREVIATIONS: Record<WeaponType, ReadonlyArray<Abbrev>> = {
  Pistol: [
    { short: 'RV', long: 'Revolver' },
    { short: 'RP', long: 'Repeater Pistol' },
    { short: 'SP', long: 'Sidearm Pistol' },
    { short: 'QDP', long: 'Quick Draw Pistol' },
    { short: 'HC', long: 'Hand Cannon' },
    { short: 'HOB', long: 'Hold Out Blaster' },
  ],
  SMG: [
    { short: 'VSM', long: 'Velocity Sub Machine Gun' },
    { short: 'CQM', long: 'Close Quarters Model' },
    { short: 'RSG', long: 'Rapid Scatter Gun' },
    { short: 'ADM', long: 'Automatic Drift-Control Machine Gun' },
    { short: 'RSM', long: 'Rapid Suppression Model' },
    { short: 'BFS', long: 'Burst Fire Sub Machine Gun' },
  ],
  Shotgun: [
    { short: 'SG', long: 'Shotgun' },
    { short: 'TSG', long: 'Tactical Shotgun' },
    { short: 'HSG', long: 'Heavy Shotgun' },
    { short: 'DBS', long: 'Double Barrel Shotgun' },
    { short: 'CS', long: 'Cluster Shotgun' },
    { short: 'RSG', long: 'Ripper Shotgun' },
  ],
  'Combat Rifle': [
    { short: 'CR', long: 'Combat Rifle' },
    { short: 'HCR', long: 'Heavy Combat Rifle' },
    { short: 'ACR', long: 'Advanced Combat Rifle' },
    { short: 'PCR', long: 'Pulse Combat Rifle' },
    { short: 'SCR', long: 'Shock Combat Rifle' },
    { short: 'SBR', long: 'Standard Battle Rifle' },
  ],
  'Sniper Rifle': [
    { short: 'SR', long: 'Sniper Rifle' },
    { short: 'LSR', long: 'Long Shot Rifle' },
    { short: 'MSR', long: 'Marksman Rifle' },
    { short: 'DS', long: 'Distant Shot' },
    { short: 'GSR', long: 'Ghost Sight Rifle' },
    { short: 'LDL', long: 'Long Distance Laser' },
  ],
  Launcher: [
    { short: 'GL', long: 'Grenade Launcher' },
    { short: 'HRX', long: 'Heavy Rocket Exchange' },
    { short: 'CAT', long: 'Catapult' },
    { short: 'PEL', long: 'Plasma Emissions Launcher' },
    { short: 'VML', long: 'Volatile Missile Launcher' },
    { short: 'HGL', long: 'Heavy Grenade Launcher' },
  ],
};

// Source: spec Step 7c. 1d100 each.
export const PREFIXES: ReadonlyArray<string> = [
  'Adamant', 'Aetherbound', 'Ashwrought', 'Astral', 'Barbed',
  'Behemoth', 'Binary', 'Blackened', 'Bleak', 'Blooded',
  'Boundless', 'Bronze', 'Cataclysmic', 'Celestial', 'Chrono-Locked',
  'Cobalt', 'Coiled', 'Cold-Wrought', 'Covenant', 'Crimson',
  'Cryptic', 'Cyclonic', 'Darklight', 'Dawnforged', 'Deepcore',
  'Dire', 'Draconic', 'Dream-Carved', 'Dreadful', 'Embered',
  'Entropic', 'Etheric', 'Eviscerating', 'Fallen', 'Fanged',
  'Fell', 'Forsaken', 'Frostbitten', 'Fulgurite', 'Gilded',
  'Glacial', 'Gravital', 'Grim', 'Haloed', 'Hellborn',
  'Hollowed', 'Hyper', 'Ignited', 'Infinite', 'Ironclad',
  'Jagged', 'Leviathan', 'Luminous', 'Midnight', 'Molten',
  'Monolith', 'Necrotic', 'Nullified', 'Obsidian', 'Omega',
  'Ornery', 'Parallax', 'Phased', 'Plastic', 'Prism',
  'Quake-Born', 'Quantum', 'Radiant', "Reckoner's", 'Rift-Borne',
  'Runic', 'Ruinous', 'Sabled', 'Seraphic', 'Shattered',
  'Silent', 'Silvered', 'Singularity', 'Siphoning', 'Solaris',
  'Spectral', 'Spellwrought', 'Starkiller', 'Stormbound', 'Sunken',
  'Tempestuous', 'Thorned', 'Titanic', 'Twilight', 'Umbral',
  'Vanguard', 'Voidglass', 'Voltaic', 'Warborn', 'Whispering',
  'Wild', 'Windcarved', 'Witch-Marked', 'Wrym-Bound', 'Zenith',
];

export const SUFFIXES: ReadonlyArray<string> = [
  'Apex', 'Ascendant', 'Bastion', 'Blackout', 'Blackstar',
  'Bloom', 'Brimstone', 'Catalyst', 'Cinder', 'Cipher',
  'Collapse', 'Crest', 'Dawn', 'Depths', 'Discord',
  'Drift', 'Echo', 'Edge', 'Ember', 'Eclipse',
  'Fang', 'Flux', 'Frost', 'Fury', 'Ghast',
  'Ghost', 'Gloom', 'Gravemind', 'Gravity', 'Gravestone',
  'Halo', 'Horizon', 'Hunger', 'Inferno', 'Ironheart',
  'Lament', 'Legacy', 'Longshadow', 'Maw', 'Mirage',
  'Monolith', 'Nemesis', 'Nexus', 'Nightfall', 'Null',
  'Oblivion', 'Omen', 'Oracle', 'Paradox', 'Phantom',
  'Pulse', 'Quake', 'Radiant', 'Rapture', 'Reaper',
  'Requiem', 'Rift', 'Ritual', 'Ruin', 'Runefall',
  'Scorn', 'Sever', 'Shade', 'Shatter', 'Shiver',
  'Silence', 'Signal', 'Siphon', 'Solstice', 'Sovereign',
  'Spectre', 'Spiral', 'Spite', 'Starfall', 'Storm',
  'Sundown', 'Surge', 'Talon', 'Tempest', 'Terminus',
  'Thunder', 'Thorn', 'Torrent', 'Twilight', 'Umbrashard',
  'Vanguard', 'Vengeance', 'Verdict', 'Vesper', 'Void',
  'Vortex', 'Wardbreaker', 'Warden', 'Wayfarer', 'Whisper',
  'Wildfire', 'Wind', 'Wraith', 'Wyrd', 'Zephyr',
];
