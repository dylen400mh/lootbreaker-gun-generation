// Discovery script: prints the PSD layer tree without exporting anything.
// Use this once the PSD has been converted from CMYK to RGB (e.g. via Photopea).
//
// Run with: node scripts/inspect-psd.mjs
// Optional: pass a path:  node scripts/inspect-psd.mjs ../path/to/file.psd

import { readPsd } from 'ag-psd';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PSD = resolve(
  __dirname,
  '..',
  '..',
  'Lootbreaker_AppResources',
  'Weapon_PSD.psd',
);
const psdPath = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_PSD;

console.log(`Reading: ${psdPath}\n`);

let psd;
try {
  psd = readPsd(readFileSync(psdPath), {
    skipLayerImageData: true,
    skipCompositeImageData: true,
    skipThumbnail: true,
  });
} catch (e) {
  console.error('Failed to read PSD:', e.message);
  if (/CMYK|color mode/i.test(e.message)) {
    console.error('\nThe PSD must be in RGB color mode.');
    console.error('Convert it in Photopea:  Image → Mode → RGB Color → Save as PSD');
  }
  process.exit(1);
}

console.log(`Canvas: ${psd.width} × ${psd.height}`);
const layerCount = countLeaves(psd.children ?? []);
const groupCount = countGroups(psd.children ?? []);
console.log(`Layers: ${layerCount} leaf, ${groupCount} group(s)\n`);
console.log('Tree:');
walk(psd.children ?? [], 0);

function walk(layers, depth) {
  const indent = '  '.repeat(depth);
  for (const l of layers) {
    const kind = l.children ? '📁' : '🗎';
    const name = l.name ?? '<unnamed>';
    const hidden = l.hidden ? ' [hidden]' : '';
    const bbox =
      l.left !== undefined && l.top !== undefined
        ? `  ${l.left},${l.top} → ${l.right},${l.bottom} (${(l.right ?? 0) - (l.left ?? 0)}×${(l.bottom ?? 0) - (l.top ?? 0)})`
        : '';
    const text = l.text ? `  text="${l.text.text?.slice(0, 40) ?? ''}"` : '';
    console.log(`${indent}${kind} ${name}${hidden}${bbox}${text}`);
    if (l.children) walk(l.children, depth + 1);
  }
}

function countLeaves(layers) {
  let n = 0;
  for (const l of layers) {
    if (l.children) n += countLeaves(l.children);
    else n += 1;
  }
  return n;
}

function countGroups(layers) {
  let n = 0;
  for (const l of layers) {
    if (l.children) {
      n += 1;
      n += countGroups(l.children);
    }
  }
  return n;
}
