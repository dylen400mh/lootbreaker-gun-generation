import type { Element, GunType, MeleeType, WeaponType } from '../generation/types';

export const WEAPON_WIDTHS = [512, 1024, 2048] as const;
export type WeaponWidth = (typeof WEAPON_WIDTHS)[number];

const gunSlugs: Record<GunType, string> = {
  Pistol: 'handgun',
  SMG: 'smg',
  Shotgun: 'shotgun',
  'Combat Rifle': 'combat-rifle',
  'Sniper Rifle': 'sniper-rifle',
  // Asset slug stays as 'plasma-caster' (the source plasma-gun PNG); only the
  // user-facing label is "Launcher".
  Launcher: 'plasma-caster',
};

// Source PNG for `Dagger` lives as `Kunai.png` in the asset folder; we map it
// to the `dagger` slug (matching the spec's weapon-type name).
const meleeSlugs: Record<MeleeType, string> = {
  Warhammer: 'warhammer',
  Axe: 'axe',
  Lance: 'lance',
  Dagger: 'dagger',
  Sword: 'sword',
  Gauntlet: 'gauntlet',
};

const ALL_SLUGS: Record<WeaponType, string> = { ...gunSlugs, ...meleeSlugs };

export function weaponArtUrl(type: WeaponType, width: WeaponWidth = 1024): string {
  return `/weapons/${ALL_SLUGS[type]}-${width}.webp`;
}

export function pickWeaponWidth(targetCssWidth: number, dpr = 1): WeaponWidth {
  const target = targetCssWidth * Math.min(dpr, 2);
  for (const w of WEAPON_WIDTHS) if (w >= target) return w;
  return WEAPON_WIDTHS[WEAPON_WIDTHS.length - 1];
}

const elementSlugs: Record<Element, string> = {
  Acid: 'acid',
  Cold: 'cold',
  Fire: 'fire',
  Volt: 'volt',
  Dark: 'dark',
  Entropy: 'entropy',
  Light: 'light',
  Plasma: 'plasma',
};

export function elementIconUrl(element: Element): string {
  return `/icons/${elementSlugs[element]}.webp`;
}

export const KINETIC_ICON_URL = '/icons/kinetic.webp';

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;
export const DIE_SIDES: ReadonlyArray<DieSides> = [4, 6, 8, 10, 12, 20];

export function dieIconUrl(sides: DieSides): string {
  return `/dice/d${sides}.png`;
}
