// Extracts every renderable leaf layer from Weapon_PSD.psd as a transparent PNG.
// Emits public/psd/layers/<id>.png + public/psd/manifest.json.
//
// The React side reads manifest.json to know each layer's PSD-recorded position,
// dimensions, parent path, and visibility state. The card composes by toggling
// which layers to render based on the rolled weapon.
//
// Run with: npm run extract-psd

import { initializeCanvas, readPsd } from 'ag-psd';
import { createCanvas, createImageData } from 'canvas';
import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

initializeCanvas(createCanvas, createImageData);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PSD_PATH = resolve(
  __dirname,
  '..',
  '..',
  'Lootbreaker_AppResources',
  'Weapon_PSD.psd',
);
const OUT_DIR = join(ROOT, 'public', 'psd');
const LAYERS_DIR = join(OUT_DIR, 'layers');
const PUBLIC_MANIFEST_PATH = join(OUT_DIR, 'manifest.json');
// Also write into src/ so Vite bundles it (Vite skips JSON in /public).
const SRC_MANIFEST_PATH = join(ROOT, 'src', 'generated', 'psdManifest.json');

// Layers we don't want exported (designer notes, redundant duplicates).
const SKIP_NAMES = new Set([
  'Size and Location rectangle',
]);

// Semantic mappings discovered by visual inspection of extracted layers.
// Inside each `Dice_Column1` group, layers appear in this order (top of stack first).
const DICE_BY_ORDER = [4, 6, 8, 10, 12, 20];

// Inside each `DamageIcons_Column1` group, the 10 layers map to these damage
// types in PSD top→bottom stack order. Verified by visually comparing each
// layer's PNG to Lootbreaker_AppResources/Icons/IC_*.png — earlier ordering
// had Plasma↔Entropy and Dark↔Entropy swapped, so e.g. picking Dark rendered
// the skull (Entropy) icon.
const ELEMENT_BY_ORDER = [
  'Plasma',
  'Light',
  'Entropy',
  'Dark',
  'Volt',
  'Fire',
  'Cold',
  'Acid',
  'Slashing',
  'Kinetic',
];

// Map damage section name (UPPER-CASE in the PSD) to our row label.
const ROW_BY_SECTION = {
  GRAVE: 'grave',
  MAJOR: 'major',
  MINOR: 'minor',
};

async function main() {
  console.log(`Reading ${PSD_PATH}`);
  const buf = await fs.readFile(PSD_PATH);
  const psd = readPsd(buf);
  console.log(`Canvas: ${psd.width} × ${psd.height}`);

  await fs.mkdir(LAYERS_DIR, { recursive: true });

  // Rarity text layers are flat raster (not live text) and were authored in muted
  // tones for readability. Their flanking-box vectors use raw saturated colors that
  // visually clash. Sample the rasterized text once up front so boxes can match.
  const rarityTextColors = collectRarityTextColors(psd.children ?? []);

  const used = new Set();
  const entries = [];

  await walk(psd.children ?? [], [], entries, used, rarityTextColors);

  const manifest = {
    canvas: { width: psd.width, height: psd.height },
    layers: entries,
  };
  await fs.writeFile(PUBLIC_MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  await fs.mkdir(dirname(SRC_MANIFEST_PATH), { recursive: true });
  await fs.writeFile(SRC_MANIFEST_PATH, JSON.stringify(manifest));
  console.log(`Wrote ${entries.length} layers + manifest.json`);
}

async function walk(layers, path, entries, used, rarityTextColors) {
  let leafIdx = 0;
  for (const layer of layers) {
    const name = layer.name ?? '<unnamed>';
    const isGroup = Array.isArray(layer.children);
    const newPath = [...path, name];

    if (SKIP_NAMES.has(name)) {
      continue;
    }

    if (isGroup) {
      await walk(layer.children, newPath, entries, used, rarityTextColors);
      continue;
    }

    let entry = null;
    if (hasPixels(layer) && layer.canvas) {
      entry = await emitRasterLayer(layer, newPath, used);
    } else if (layer.vectorMask?.paths?.length) {
      entry = await emitVectorLayer(layer, newPath, used, rarityTextColors);
    }

    if (entry) {
      entry.semantic = deriveSemantic(newPath, leafIdx);
      entries.push(entry);
      leafIdx += 1;
    }
  }
}

async function emitRasterLayer(layer, newPath, used) {
  const id = uniqueId(newPath, used);
  const filename = `${id}.png`;
  const outPath = join(LAYERS_DIR, filename);
  const canvas = postProcessRaster(layer, newPath);
  await fs.writeFile(outPath, canvas.toBuffer('image/png'));
  return {
    id,
    name: layer.name ?? '<unnamed>',
    path: newPath,
    file: `psd/layers/${filename}`,
    x: layer.left ?? 0,
    y: layer.top ?? 0,
    width: (layer.right ?? 0) - (layer.left ?? 0),
    height: (layer.bottom ?? 0) - (layer.top ?? 0),
    hidden: !!layer.hidden,
    opacity: layer.opacity ?? 1,
  };
}

// Rasterizes a vector shape layer (paths + solid fill) onto a transparent canvas
// sized to the path's bounding box. Curves are drawn as cubic Beziers using each
// knot's preceding/following control points (already in absolute pixel coords —
// see ag-psd's readBezierKnot which multiplies by canvas width/height).
async function emitVectorLayer(layer, newPath, used, rarityTextColors) {
  const paths = layer.vectorMask.paths;
  const bounds = computePathBounds(paths);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;

  const cw = Math.ceil(bounds.width);
  const ch = Math.ceil(bounds.height);
  const ox = Math.floor(bounds.x);
  const oy = Math.floor(bounds.y);

  const canvas = createCanvas(cw, ch);
  const ctx = canvas.getContext('2d');
  ctx.translate(-ox, -oy);

  for (const p of paths) {
    if (!p.knots || p.knots.length === 0) continue;
    ctx.beginPath();
    const k0 = p.knots[0];
    ctx.moveTo(k0.points[2], k0.points[3]);
    for (let i = 1; i < p.knots.length; i += 1) {
      const prev = p.knots[i - 1];
      const cur = p.knots[i];
      ctx.bezierCurveTo(
        prev.points[4], prev.points[5], // outgoing control of prev
        cur.points[0], cur.points[1],   // incoming control of cur
        cur.points[2], cur.points[3],   // anchor of cur
      );
    }
    if (!p.open) {
      const last = p.knots[p.knots.length - 1];
      ctx.bezierCurveTo(
        last.points[4], last.points[5],
        k0.points[0], k0.points[1],
        k0.points[2], k0.points[3],
      );
      ctx.closePath();
    }
    ctx.fillStyle = resolveBoxFillStyle(layer, newPath, rarityTextColors);
    ctx.fill(p.fillRule === 'non-zero' ? 'nonzero' : 'evenodd');
  }

  const id = uniqueId(newPath, used);
  const filename = `${id}.png`;
  await fs.writeFile(join(LAYERS_DIR, filename), canvas.toBuffer('image/png'));

  return {
    id,
    name: layer.name ?? '<unnamed>',
    path: newPath,
    file: `psd/layers/${filename}`,
    x: ox,
    y: oy,
    width: cw,
    height: ch,
    hidden: !!layer.hidden,
    opacity: layer.opacity ?? 1,
  };
}

// Per-layer raster touch-ups. The PSD's Statistics Table layer bakes in
// placeholder copy that the rolled card replaces — "Tier 1 WEAPONTYPE" / "Range"
// at the top, and the words "Lightweight Effects" at the bottom (the latter
// was an example showing where Pistol's "Light Frame" passive would render).
// Strip those rows so only the four dividers + Minor/Major/Grave row labels
// survive; live header text and effects are rendered as HTML overlays.
function postProcessRaster(layer, newPath) {
  const leaf = newPath[newPath.length - 1];
  if (leaf !== 'Statistics Table') return layer.canvas;
  const src = layer.canvas;
  const out = createCanvas(src.width, src.height);
  const ctx = out.getContext('2d');
  ctx.drawImage(src, 0, 0);
  // Header text (above the first divider at local y≈49). 0..46 covers the
  // text without touching the rule.
  ctx.clearRect(0, 0, src.width, 47);
  // "Lightweight" + "Effects" placeholder. The last divider sits at local
  // y≈309-311, so 320 starts a clean row below it.
  ctx.clearRect(0, 320, src.width, src.height - 320);
  return out;
}

function computePathBounds(paths) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of paths) {
    for (const k of p.knots ?? []) {
      // Consider all six numbers — control points can extend past anchors.
      for (let i = 0; i < k.points.length; i += 2) {
        const x = k.points[i];
        const y = k.points[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!Number.isFinite(minX)) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Walk the PSD up front and collect each rarity's text-layer rendered color so
// the rarityBox vector layers can be rasterized in the matching tone instead of
// the raw HSB/CMYK fill (which often clashes with the muted text).
function collectRarityTextColors(rootChildren) {
  const map = new Map();
  function walk(layers, ancestors) {
    for (const l of layers ?? []) {
      const path = [...ancestors, l.name];
      const rarIdx = path.findIndex((n) => n === 'Rarities');
      if (rarIdx >= 0 && l.canvas) {
        const setting = path[rarIdx + 1];
        const m = setting?.match(/^(.+) Rarity Setting$/);
        if (m && /Text Box$/.test(l.name)) {
          const c = sampleDominantColor(l.canvas);
          if (c) map.set(m[1], c);
        }
      }
      if (l.children) walk(l.children, path);
    }
  }
  walk(rootChildren, []);
  return map;
}

// Returns the alpha-weighted RGB average of a node-canvas's mostly-opaque pixels.
// For a text layer this lands on the body color of the glyphs, ignoring AA edges.
function sampleDominantColor(canvas) {
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let r = 0, g = 0, b = 0, total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 220) continue;
    r += data[i] * a;
    g += data[i + 1] * a;
    b += data[i + 2] * a;
    total += a;
  }
  if (total === 0) return null;
  return [Math.round(r / total), Math.round(g / total), Math.round(b / total)];
}

// For rarity flanking boxes, prefer the matching text's rendered color so they
// don't clash. Everything else (guild boxes, top backing, etc.) keeps its
// authored vectorFill.
function resolveBoxFillStyle(layer, path, rarityTextColors) {
  const rarIdx = path.findIndex((n) => n === 'Rarities');
  if (rarIdx >= 0) {
    const setting = path[rarIdx + 1];
    const m = setting?.match(/^(.+) Rarity Setting$/);
    const leaf = path[path.length - 1];
    if (m && (leaf === 'Box Left' || leaf === 'Box Right')) {
      const c = rarityTextColors.get(m[1]);
      if (c) return `rgba(${c[0]}, ${c[1]}, ${c[2]}, 1)`;
    }
  }
  return resolveFillStyle(layer);
}

// PSD colors come in several flavors (RGB, RGBA, CMYK, HSB, Grayscale, ...).
// Convert any we see into a CSS rgba string. Defaults to opaque white if unknown.
function resolveFillStyle(layer) {
  const c = layer.vectorFill?.color ?? layer.effects?.solidFill?.[0]?.color;
  if (!c) return '#ffffff';
  const a = 'a' in c ? c.a : 1;
  // HSB must come before the RGB check — both have a `b` property.
  if ('h' in c && 's' in c && 'b' in c) {
    // ag-psd: h normalized 0..1, s and b are 0..100.
    const [r, g, b] = hsbToRgb(c.h, c.s / 100, c.b / 100);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if ('r' in c && 'g' in c && 'b' in c) {
    return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a})`;
  }
  if ('c' in c && 'm' in c && 'y' in c && 'k' in c) {
    // CMYK channels are 0-100 in ag-psd; convert via the standard formula.
    const r = 255 * (1 - c.c / 100) * (1 - c.k / 100);
    const g = 255 * (1 - c.m / 100) * (1 - c.k / 100);
    const b = 255 * (1 - c.y / 100) * (1 - c.k / 100);
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
  }
  if ('k' in c && Object.keys(c).length === 1) {
    const v = Math.round(255 * (1 - c.k / 100));
    return `rgba(${v}, ${v}, ${v}, ${a})`;
  }
  return '#ffffff';
}

function hsbToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Walks the path components and produces a structured semantic descriptor where applicable.
function deriveSemantic(path, leafIdx) {
  // Damage row dice icons:
  // [..., 'Damage Section MINOR'|'MAJOR'|'GRAVE', 'Dice Column N', 'Dice_Column1'|'DamageIcons_Column1', 'Layer X']
  const dmgIdx = path.findIndex((p) => /^Damage Section /.test(p));
  if (dmgIdx >= 0) {
    const section = path[dmgIdx].replace('Damage Section ', '');
    const row = ROW_BY_SECTION[section];
    const colMatch = path[dmgIdx + 1]?.match(/Dice Column (\d+)/);
    const variant = path[dmgIdx + 2];
    if (row && colMatch && variant) {
      const column = Number(colMatch[1]);
      if (variant === 'Dice_Column1') {
        const sides = DICE_BY_ORDER[leafIdx];
        if (sides) return { kind: 'die', row, column, sides };
      } else if (variant === 'DamageIcons_Column1') {
        const element = ELEMENT_BY_ORDER[leafIdx];
        if (element) return { kind: 'damageIcon', row, column, element };
      }
    }
    if (path[path.length - 1] === 'Additional Effect Textbox') {
      return { kind: 'additionalEffectTextbox', row };
    }
  }

  // Rarity labels: [..., 'Rarities', '<Name> Rarity Setting', 'Box Left'|'Box Right'|'<Name> Text Box']
  const rarIdx = path.findIndex((p) => p === 'Rarities');
  if (rarIdx >= 0) {
    const settingName = path[rarIdx + 1];
    if (settingName) {
      const m = settingName.match(/^(.+) Rarity Setting$/);
      if (m) {
        const rarity = m[1];
        const leaf = path[path.length - 1];
        if (/Text Box$/.test(leaf)) return { kind: 'rarityText', rarity };
        if (leaf === 'Box Left' || leaf === 'Box Right') {
          return { kind: 'rarityBox', rarity, side: leaf === 'Box Left' ? 'left' : 'right' };
        }
      }
    }
    if (path[path.length - 1] === 'Luminous Rarity Setting') {
      return { kind: 'rarityText', rarity: 'Luminous' };
    }
  }

  // Top-level slot layers we'll reference by name.
  const leaf = path[path.length - 1];
  if (leaf === 'Background') return { kind: 'background' };
  if (leaf === 'Gradient BG') return { kind: 'gradientBg' };
  if (leaf === 'Paintstroke') return { kind: 'paintstroke' };
  if (leaf === 'Weapon Art') return { kind: 'weaponArtSlot' };
  if (leaf === 'Statistics Table') return { kind: 'statisticsTable' };
  if (leaf === 'Name Text Box') return { kind: 'nameTextbox' };
  if (leaf === 'Guild Text Box') return { kind: 'guildTextbox' };
  if (leaf === 'Quote Text Box') return { kind: 'quoteTextbox' };
  if (leaf === 'Top Backing') return { kind: 'topBacking' };
  if (/^Stats and Quotes Backing/.test(leaf)) return { kind: 'statsBacking' };
  if (/^Grunge/.test(leaf)) return { kind: 'grunge' };
  if (leaf === 'Box Left' || leaf === 'Box Right') {
    if (path.includes('Guild Info')) {
      return { kind: 'guildBox', side: leaf === 'Box Left' ? 'left' : 'right' };
    }
  }
  if (leaf === 'Bottom Rectangle') return { kind: 'quoteBottomRect' };

  return null;
}

function hasPixels(layer) {
  const w = (layer.right ?? 0) - (layer.left ?? 0);
  const h = (layer.bottom ?? 0) - (layer.top ?? 0);
  return w > 0 && h > 0;
}

function uniqueId(path, used) {
  const base = path.map(slug).join('--');
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    || 'unnamed';
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
