import type { GunType } from '../../types';

export interface Abbrev {
  short: string;
  long: string;
}

// Source: spec Step 7a. 1d6 per weapon type.
export const ABBREVIATIONS: Record<GunType, ReadonlyArray<Abbrev>> = {
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
