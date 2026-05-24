// Extracts every renderable leaf layer from a Weapon PSD as a transparent PNG.
// Emits <out-public>/<category>/layers/<id>.png + <out-public>/<category>/manifest.json,
// plus a parallel manifest into src/generated/ that Vite can bundle.
//
// CLI:
//   node scripts/extract-psd.mjs --category gun
//   node scripts/extract-psd.mjs --category melee
//   node scripts/extract-psd.mjs --category shield
//   node scripts/extract-psd.mjs --psd <abs-or-rel-path> --category <name>
//
// `--category` is required; it determines the output subdirectory and the
// generated manifest filename (e.g. `gun` → `src/generated/gunPsdManifest.json`).
//
// Run with: npm run extract-psd:gun  /  npm run extract-psd:melee  /  npm run extract-psd:shield  /  npm run extract-psd

import { initializeCanvas, readPsd } from 'ag-psd';
import { createCanvas, createImageData } from 'canvas';
import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

initializeCanvas(createCanvas, createImageData);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ASSETS_ROOT = resolve(__dirname, '..', '..', 'Lootbreaker_AppResources');

const DEFAULT_PSD_BY_CATEGORY = {
  gun: join(ASSETS_ROOT, 'Weapon_PSD.psd'),
  melee: join(ASSETS_ROOT, 'Melee Weapon Assets', 'Melee_Weapon_Card_Root.psd'),
  shield: join(ASSETS_ROOT, 'Shield Assets', 'Shield_Base.psd'),
};

const { category, psdPath } = parseArgs(process.argv.slice(2));
if (!category) {
  console.error('Missing required --category <gun|melee|shield>');
  process.exit(1);
}
const PSD_PATH = psdPath ?? DEFAULT_PSD_BY_CATEGORY[category];
if (!PSD_PATH) {
  console.error(`Unknown category "${category}" and no --psd path given`);
  process.exit(1);
}

const OUT_DIR = join(ROOT, 'public', 'psd', category);
const LAYERS_DIR = join(OUT_DIR, 'layers');
const PUBLIC_MANIFEST_PATH = join(OUT_DIR, 'manifest.json');
// Also write into src/ so Vite bundles it (Vite skips JSON in /public).
const SRC_MANIFEST_PATH = join(ROOT, 'src', 'generated', `${category}PsdManifest.json`);

// Layers we don't want exported (designer notes, redundant duplicates).
// `Mythic Rarity Setting` exists in the melee/shield PSDs but the spec never
// rolls Mythic — skip the whole group so we don't ship layer PNGs that are
// never used. `Damage Section` (no MINOR/MAJOR/GRAVE suffix) is the shield's
// hidden damage block — shields don't display damage. The exact-match skip
// only matches the shield's bare group; the gun/melee `Damage Section MINOR/
// MAJOR/GRAVE` groups slip past untouched.
const SKIP_NAMES = new Set([
  'Size and Location rectangle',
  'Mythic Rarity Setting',
  'Damage Section',
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
    file: `psd/${category}/layers/${filename}`,
    x: layer.left ?? 0,
    y: layer.top ?? 0,
    width: (layer.right ?? 0) - (layer.left ?? 0),
    height: (layer.bottom ?? 0) - (layer.top ?? 0),
    hidden: !!layer.hidden,
    opacity: layer.opacity ?? 1,
  };
}

// Rasterizes a vector shape layer (paths + solid fill, optional stroke) onto
// a transparent canvas sized to the path's bounding box. Curves are drawn as
// cubic Beziers using each knot's preceding/following control points (already
// in absolute pixel coords — see ag-psd's readBezierKnot which multiplies by
// canvas width/height). If `vectorStroke.strokeEnabled` is true, a second
// pass strokes the same path — used for the shield panel borders (Layer
// 61/62/63 under Spell_DefaultBox).
async function emitVectorLayer(layer, newPath, used, rarityTextColors) {
  const paths = layer.vectorMask.paths;
  const bounds = computePathBounds(paths);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;

  const stroke = layer.vectorStroke;
  const strokeEnabled = !!stroke?.strokeEnabled;
  const lineWidth = stroke?.lineWidth?.value ?? 0;
  // Stroke alignment: 'inside' is the only one that fits within the existing
  // path bounds; 'outside' / 'center' would extend the visible pixels past
  // the path bbox. Pad the canvas by lineWidth in those cases so the stroke
  // doesn't get clipped.
  const align = stroke?.lineAlignment ?? 'center';
  const pad = strokeEnabled && align !== 'inside' ? Math.ceil(lineWidth) : 0;

  const cw = Math.ceil(bounds.width) + pad * 2;
  const ch = Math.ceil(bounds.height) + pad * 2;
  const ox = Math.floor(bounds.x) - pad;
  const oy = Math.floor(bounds.y) - pad;

  const canvas = createCanvas(cw, ch);
  const ctx = canvas.getContext('2d');
  ctx.translate(-ox, -oy);

  const fillEnabled = stroke ? stroke.fillEnabled !== false : true;

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
    if (fillEnabled) {
      ctx.fillStyle = resolveBoxFillStyle(layer, newPath, rarityTextColors);
      ctx.fill(p.fillRule === 'non-zero' ? 'nonzero' : 'evenodd');
    }
    if (strokeEnabled && lineWidth > 0) {
      ctx.lineWidth = lineWidth;
      ctx.lineCap = mapCanvasLineCap(stroke.lineCapType);
      ctx.lineJoin = mapCanvasLineJoin(stroke.lineJoinType);
      ctx.miterLimit = stroke.miterLimit ?? 10;
      ctx.strokeStyle = resolveStrokeStyle(stroke);
      // Photoshop 'inside' alignment draws the entire stroke on the inside
      // of the path edge. canvas2d's stroke is centered on the path, so we
      // stroke at N× width and clip to the fill — the outside half is
      // clipped away, leaving the inside half visible. We compensate for
      // two things: (1) AA at the clip boundary eats ~half a pixel of solid
      // color, (2) the card composite is CSS-scaled to ~0.7× when displayed
      // in the browser. Stroke at lineWidth*12 so the surviving inside
      // portion is ~6× lineWidth in PSD pixels — matches the apparent
      // thickness in the reference design after the web scale-down, and
      // overlaps the diagonal column-divider slashes (Layer 244/245) that
      // start 6 PSD-px inset from the panel edge.
      if (align === 'inside') {
        ctx.save();
        ctx.clip(p.fillRule === 'non-zero' ? 'nonzero' : 'evenodd');
        ctx.lineWidth = lineWidth * 12;
        ctx.stroke();
        ctx.restore();
      } else if (align === 'outside') {
        // No canvas equivalent for 'outside' either — approximate by
        // stroking at 2× width then clearing the inside.
        ctx.save();
        ctx.lineWidth = lineWidth * 2;
        ctx.stroke();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill(p.fillRule === 'non-zero' ? 'nonzero' : 'evenodd');
        ctx.restore();
      } else {
        ctx.stroke();
      }
    }
  }

  const id = uniqueId(newPath, used);
  const filename = `${id}.png`;
  await fs.writeFile(join(LAYERS_DIR, filename), canvas.toBuffer('image/png'));

  return {
    id,
    name: layer.name ?? '<unnamed>',
    path: newPath,
    file: `psd/${category}/layers/${filename}`,
    x: ox,
    y: oy,
    width: cw,
    height: ch,
    hidden: !!layer.hidden,
    opacity: layer.opacity ?? 1,
  };
}

function mapCanvasLineCap(t) {
  if (t === 'round') return 'round';
  if (t === 'square') return 'square';
  return 'butt';
}

function mapCanvasLineJoin(t) {
  if (t === 'round') return 'round';
  if (t === 'bevel') return 'bevel';
  return 'miter';
}

function resolveStrokeStyle(stroke) {
  const c = stroke?.content?.color;
  if (!c) return '#ffffff';
  const a = ('a' in c ? c.a : 1) * (stroke.opacity ?? 1);
  if ('r' in c && 'g' in c && 'b' in c) {
    return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a})`;
  }
  if ('c' in c && 'm' in c && 'y' in c && 'k' in c) {
    const r = 255 * (1 - c.c / 100) * (1 - c.k / 100);
    const g = 255 * (1 - c.m / 100) * (1 - c.k / 100);
    const b = 255 * (1 - c.y / 100) * (1 - c.k / 100);
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
  }
  if ('h' in c && 's' in c && 'b' in c) {
    const [r, g, b] = hsbToRgb(c.h, c.s / 100, c.b / 100);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return '#ffffff';
}

// Per-layer raster touch-ups. The PSD's Statistics Table layer bakes in
// placeholder copy that the rolled card replaces — "Tier 1 WEAPONTYPE" / "Range"
// at the top, and the words "Lightweight Effects" at the bottom (the latter
// was an example showing where Pistol's "Light Frame" passive would render).
// Strip those rows so only the four dividers + Minor/Major/Grave row labels
// survive; live header text and effects are rendered as HTML overlays.
//
// The shield stat tables (Threshold/Capacity/Regen) bake in placeholder
// values ("X", "X + MND") under their column headers. Clear the bottom half
// of each so the HTML value overlays don't visually collide with the "X".
function postProcessRaster(layer, newPath) {
  const leaf = newPath[newPath.length - 1];
  if (leaf === 'Statistics Table') {
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
  // Shield stat tables: clear the bottom half (the placeholder values) and
  // leave the top header text intact. Each table's raster is ~124 px tall;
  // values live below y≈50 in the local frame.
  if (leaf === 'Threshold Table' || leaf === 'Capacity Table' || leaf === 'Regen Table') {
    const src = layer.canvas;
    const out = createCanvas(src.width, src.height);
    const ctx = out.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.clearRect(0, 50, src.width, src.height - 50);
    return out;
  }
  // Shield effects-box header raster (Spell_DefaultBox > Table, visible).
  // Top band (y≈0-56) is the gray header bar with baked-in "Tier 1 Shield" /
  // "Guild" placeholder glyphs. We want to keep the gray rectangle (so the
  // live "Tier X Shield" + guild overlay sits on a proper PSD-colored bar)
  // but strip the placeholder text. Sample the bar's predominant rgba
  // (lower-third of the bar avoids glyph pixels), clear the band, and
  // repaint with that uniform color. Bottom (y≈60-108) is the "Effects" row
  // label — clear it entirely so the effects-content overlay starts clean.
  if (newPath[newPath.length - 2] === 'Spell_DefaultBox' && leaf === 'Table') {
    const src = layer.canvas;
    const out = createCanvas(src.width, src.height);
    const ctx = out.getContext('2d');
    ctx.drawImage(src, 0, 0);
    const barRgba = sampleBarBackground(src, 50, 55) ?? 'rgb(123, 123, 121)';
    ctx.clearRect(0, 0, src.width, 60);
    if (barRgba) {
      ctx.fillStyle = barRgba;
      ctx.fillRect(0, 0, src.width, 56);
    }
    ctx.clearRect(0, 60, src.width, src.height - 60);
    return out;
  }
  return layer.canvas;
}

// Sample the rasterized gray bar at a non-text strip (5px slice near the
// bar's bottom) and return its mean rgba. We keep the original ~43% alpha so
// the repainted bar composites over the underlying stats backing exactly the
// way the PSD does in Photoshop, rather than appearing as a too-bright
// opaque rectangle on the card.
function sampleBarBackground(srcCanvas, yStart, yEnd) {
  const ctx = srcCanvas.getContext('2d');
  const h = yEnd - yStart;
  if (h <= 0) return null;
  const d = ctx.getImageData(0, yStart, srcCanvas.width, h).data;
  let r = 0, g = 0, b = 0, a = 0, count = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 60) continue;
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
    a += d[i + 3];
    count += 1;
  }
  if (!count) return null;
  const alpha = (a / count / 255).toFixed(3);
  return `rgba(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}, ${alpha})`;
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

  // Shield-only top-level stat rasters.
  if (leaf === 'Threshold Table') return { kind: 'thresholdTable' };
  if (leaf === 'Regen Table') return { kind: 'regenTable' };
  if (leaf === 'Capacity Table') return { kind: 'capacityTable' };
  // Shield threshold-table column dividers (the diagonal slashes between
  // Minor/Major and Major/Grave). They paint in front of the effectsPanel
  // backings, so they must render after them in getBackgroundLayers.
  if (leaf === 'Layer 244') return { kind: 'decorAccent', side: 'left' };
  if (leaf === 'Layer 245') return { kind: 'decorAccent', side: 'right' };
  // Spell_DefaultBox children — the shield card's "stats card" frame, modeled
  // on the gun/melee Statistics Table layout. Inside the group, layer order
  // (top of stack first) is: Table[hidden], Table (visible effects-band
  // header), Layer 61 (dark panel behind threshold), Layer 62 (panel behind
  // capacity), Layer 63 (panel behind regen).
  if (path[path.length - 2] === 'Spell_DefaultBox') {
    if (leaf === 'Table' && leafIdx === 1) return { kind: 'effectsBox' };
    if (leaf === 'Layer 61') return { kind: 'effectsPanel', slot: 'threshold' };
    if (leaf === 'Layer 62') return { kind: 'effectsPanel', slot: 'capacity' };
    if (leaf === 'Layer 63') return { kind: 'effectsPanel', slot: 'regen' };
  }

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

function parseArgs(argv) {
  let category = null;
  let psdPath = null;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--category') {
      category = argv[i + 1];
      i += 1;
    } else if (a === '--psd') {
      psdPath = resolve(argv[i + 1]);
      i += 1;
    } else if (a.startsWith('--category=')) {
      category = a.slice('--category='.length);
    } else if (a.startsWith('--psd=')) {
      psdPath = resolve(a.slice('--psd='.length));
    }
  }
  return { category, psdPath };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
