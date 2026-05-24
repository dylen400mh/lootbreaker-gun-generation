// Generate WebP variants for the Lootbreaker weapon art and element icons.
// Source: ../Lootbreaker_AppResources/{Weapon Art,Icons}
// Output: ./public/{weapons,icons}
//
// Run via `npm run prepare-assets`.

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ASSETS = resolve(ROOT, '..', 'Lootbreaker_AppResources');
const GUN_SRC = join(ASSETS, 'Weapon Art');
const MELEE_SRC = join(ASSETS, 'Melee Weapon Assets');
const ICON_SRC = join(ASSETS, 'Icons');
const DICE_SRC = join(ASSETS, 'Dice');
const WEAPON_OUT = join(ROOT, 'public', 'weapons');
const ICON_OUT = join(ROOT, 'public', 'icons');
const DICE_OUT = join(ROOT, 'public', 'dice');

const WEAPON_WIDTHS = [512, 1024, 2048];
const ICON_WIDTH = 256;
const DICE_WIDTH = 128;
const WEBP_QUALITY = 85;

const gunMap = {
  'eightgramsoffat01FinalOneHandgunNoBackground.png': 'handgun',
  'eightgramsoffat01FinalOneSubmachingunNoBackground.png': 'smg',
  'eightgramsoffat01FinalOneShtogunNoBackground.png': 'shotgun',
  'eightgramsoffat01FinalOneCombatRifleNoBackground.png': 'combat-rifle',
  'eightgramsoffat01FinalOneSniperRifleNoBackground.png': 'sniper-rifle',
  'eightgramsoffat01FinalOnePlasmaGunNoBackground.png': 'plasma-caster',
};

const meleeMap = {
  'Axe.png': 'axe',
  'Sword.png': 'sword',
  'Lance.png': 'lance',
  'Kunai.png': 'dagger',
  'Gauntlet.png': 'gauntlet',
  'Warhammer.png': 'warhammer',
};

const iconMap = {
  'IC_Acid.png': 'acid',
  'IC_Cold.png': 'cold',
  'IC_FIre.png': 'fire',
  'IC_Volt.png': 'volt',
  'IC_Dark.png': 'dark',
  'IC_Entropy.png': 'entropy',
  'IC_Light.png': 'light',
  'IC_Plasma.png': 'plasma',
  'IC_Kinetic.png': 'kinetic',
};

const diceMap = {
  'd4.png': 'd4',
  'd6.png': 'd6',
  'd8.png': 'd8',
  'd10.png': 'd10',
  'd12.png': 'd12',
  'd20.png': 'd20',
};

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function processWeapon(srcDir, srcName, slug) {
  const srcPath = join(srcDir, srcName);
  for (const width of WEAPON_WIDTHS) {
    const outPath = join(WEAPON_OUT, `${slug}-${width}.webp`);
    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, alphaQuality: 90 })
      .toFile(outPath);
    process.stdout.write(`  ${slug}-${width}.webp\n`);
  }
}

async function processIcon(srcName, slug) {
  const srcPath = join(ICON_SRC, srcName);
  const outPath = join(ICON_OUT, `${slug}.webp`);
  await sharp(srcPath)
    .resize({ width: ICON_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, alphaQuality: 95 })
    .toFile(outPath);
  process.stdout.write(`  ${slug}.webp\n`);
}

// Dice are dark line-art on transparent. We invert to white so they render on the dark UI,
// and produce a small, tightly-trimmed PNG (PNG keeps line crispness better than WebP at small sizes).
async function processDice(srcName, slug) {
  const srcPath = join(DICE_SRC, srcName);
  const outPath = join(DICE_OUT, `${slug}.png`);
  await sharp(srcPath)
    .trim()
    .resize({ width: DICE_WIDTH, withoutEnlargement: true })
    .negate({ alpha: false })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  process.stdout.write(`  ${slug}.png\n`);
}

async function main() {
  await Promise.all([ensureDir(WEAPON_OUT), ensureDir(ICON_OUT), ensureDir(DICE_OUT)]);

  console.log('Processing guns:');
  for (const [src, slug] of Object.entries(gunMap)) {
    await processWeapon(GUN_SRC, src, slug);
  }

  console.log('Processing melee weapons:');
  for (const [src, slug] of Object.entries(meleeMap)) {
    await processWeapon(MELEE_SRC, src, slug);
  }

  console.log('Processing icons:');
  for (const [src, slug] of Object.entries(iconMap)) {
    await processIcon(src, slug);
  }

  console.log('Processing dice:');
  for (const [src, slug] of Object.entries(diceMap)) {
    await processDice(src, slug);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
