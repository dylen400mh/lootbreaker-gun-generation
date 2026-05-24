import { useEffect, useMemo, useRef } from 'react';
import {
  findByKind,
  getBackgroundLayers,
  getGuildLayers,
  getRarityLayers,
  getShieldTableLayers,
  getStatisticsLayers,
  PSD_CANVAS,
} from '../assets/psdManifest';
import { weaponArtUrl, pickWeaponWidth } from '../assets/manifest';
import { damageRowLayers } from '../generation/cardLayout';
import {
  weaponDisplayName,
  type GunWeapon,
  type MeleeWeapon,
  type ShieldWeapon,
  type Weapon,
} from '../generation/types';
import { PsdComposite, PsdOverlay } from './PsdComposite';
import './WeaponCard.css';

interface Props {
  weapon: Weapon;
}

// Layout for the statistics table. The dividers and row labels come from the
// post-processed Statistics Table raster (see extract-psd.mjs); these values
// just place HTML overlays for the dynamic content (Tier/Range header, the
// effects content area). Y values are in PSD canvas px.
const STATS_LAYOUT = {
  tableX: 60,
  tableWidth: 881,
  headerY: 563,
  // Effects content fills the bottom band of the table (below the last
  // divider at canvas y≈873). The "Lightweight" placeholder used to live
  // here but is now masked out at extract time.
  effectsY: 880,
  contentLeftX: 80,
};

export function WeaponCard({ weapon }: Props) {
  if (weapon.category === 'shield') {
    return <ShieldCard weapon={weapon} />;
  }
  return <DamageWeaponCard weapon={weapon} />;
}

function DamageWeaponCard({ weapon }: { weapon: GunWeapon | MeleeWeapon }) {
  const fullName = weaponDisplayName(weapon);

  const baseLayers = useMemo(() => getBackgroundLayers(weapon.category), [weapon.category]);
  const rarityLayers = useMemo(
    () => getRarityLayers(weapon.category, weapon.rarity),
    [weapon.category, weapon.rarity],
  );
  const guildLayers = useMemo(() => getGuildLayers(weapon.category), [weapon.category]);
  const statsLayers = useMemo(() => getStatisticsLayers(weapon.category), [weapon.category]);

  const damageLayers = useMemo(
    () => [
      ...damageRowLayers(weapon.category, 'minor', weapon.damage.minor, weapon.baseDamage, weapon.elements),
      ...damageRowLayers(weapon.category, 'major', weapon.damage.major, weapon.baseDamage, weapon.elements),
      ...damageRowLayers(weapon.category, 'grave', weapon.damage.grave, weapon.baseDamage, weapon.elements),
    ],
    [weapon.category, weapon.damage, weapon.baseDamage, weapon.elements],
  );

  const allLayers = useMemo(
    () => [...baseLayers, ...rarityLayers, ...guildLayers, ...statsLayers, ...damageLayers],
    [baseLayers, rarityLayers, guildLayers, statsLayers, damageLayers],
  );

  // Slot anchors for HTML overlays.
  const weaponSlot = useMemo(() => findByKind(weapon.category, 'weaponArtSlot'), [weapon.category]);
  const nameSlot = useMemo(() => findByKind(weapon.category, 'nameTextbox'), [weapon.category]);
  const guildSlot = useMemo(() => findByKind(weapon.category, 'guildTextbox'), [weapon.category]);
  const quoteRect = useMemo(
    () => findByKind(weapon.category, 'quoteBottomRect'),
    [weapon.category],
  );

  // The PSD's weaponArtSlot bounds (610×387, aspect 1.576) extend up into the
  // rarity strip and down into the guild strip. Our source weapon PNGs are
  // narrower aspect (1.44), so `object-fit: contain` height-limits them and
  // they fill the entire slot — overlapping both strips. Trim the overlay to
  // the gap between rarity bottom and guild top so the gun sits safely inside.
  const weaponArtBox = useMemo(() => {
    if (!weaponSlot) return null;
    const PADDING = 12; // PSD-px breathing room above and below
    const rarityBottom = rarityLayers.reduce(
      (max, l) => Math.max(max, l.y + l.height),
      0,
    );
    const guildTop = guildLayers.reduce(
      (min, l) => Math.min(min, l.y),
      Number.POSITIVE_INFINITY,
    );
    const top = Math.max(weaponSlot.y, rarityBottom + PADDING);
    const bottom = Math.min(
      weaponSlot.y + weaponSlot.height,
      Number.isFinite(guildTop) ? guildTop - PADDING : weaponSlot.y + weaponSlot.height,
    );
    return { x: weaponSlot.x, y: top, width: weaponSlot.width, height: Math.max(0, bottom - top) };
  }, [weaponSlot, rarityLayers, guildLayers]);

  const weaponArtSrc = weaponArtUrl(weapon.type, pickWeaponWidth(800, 2));

  return (
    <div className={`weapon-card weapon-card--${weapon.rarity.toLowerCase()}`}>
      <PsdComposite layers={allLayers}>
        {/* Rolled gun, contained inside the safe area between rarity and guild. */}
        {weaponArtBox && (
          <PsdOverlay
            x={weaponArtBox.x}
            y={weaponArtBox.y}
            width={weaponArtBox.width}
            height={weaponArtBox.height}
          >
            <img
              src={weaponArtSrc}
              alt={`${weapon.type}`}
              className="weapon-card__art"
              decoding="async"
              crossOrigin="anonymous"
            />
          </PsdOverlay>
        )}

        {/* Name across the top */}
        {nameSlot && (
          <PsdOverlay
            x={0}
            y={nameSlot.y - 20}
            width={PSD_CANVAS.width}
            height={nameSlot.height + 40}
            className="weapon-card__name-wrap"
          >
            <div className="weapon-card__name">{fullName}</div>
          </PsdOverlay>
        )}

        {/* Guild label below rarity */}
        {guildSlot && (
          <PsdOverlay
            x={0}
            y={guildSlot.y - 10}
            width={PSD_CANVAS.width}
            height={guildSlot.height + 30}
            className="weapon-card__guild-wrap"
          >
            <div className="weapon-card__guild">{weapon.guild}</div>
          </PsdOverlay>
        )}

        {/* Tier + Type + Range header — the only HTML text inside the stats
            table; dividers and row labels come from the rasterized PSD layer. */}
        <PsdOverlay
          x={STATS_LAYOUT.tableX + 20}
          y={STATS_LAYOUT.headerY}
          width={STATS_LAYOUT.tableWidth - 40}
          height={47}
          className="weapon-card__row"
        >
          <span>
            Tier {weapon.tier} {weapon.type}
          </span>
          <span className="weapon-card__row-range">
            <span>Range:</span>
            <span>{weapon.range}</span>
          </span>
        </PsdOverlay>

        {/* Module + guild bonus + special — fill the lightweight cell, below
            the rasterized "Lightweight" label. Height is bounded to stop just
            above the bottom rectangle. If the content would overflow, the
            font-size auto-shrinks (down to a legible floor) so all lines stay
            visible without bleeding onto the rule. */}
        {quoteRect && (
          <PsdOverlay
            x={STATS_LAYOUT.contentLeftX}
            y={STATS_LAYOUT.effectsY}
            width={STATS_LAYOUT.tableX + STATS_LAYOUT.tableWidth - STATS_LAYOUT.contentLeftX - 20}
            height={quoteRect.y - STATS_LAYOUT.effectsY - 8}
          >
            <AutoFitEffects weapon={weapon} />
          </PsdOverlay>
        )}

        {/* Red text — vertically centered between the bottom rectangle and
            the bottom of the card. Title (bold) + effect, both red, font-size
            auto-shrinks if the effect would overflow the band. */}
        {weapon.redText && quoteRect && (
          <PsdOverlay
            x={quoteRect.x}
            y={quoteRect.y + quoteRect.height}
            width={quoteRect.width}
            height={PSD_CANVAS.height - (quoteRect.y + quoteRect.height)}
          >
            <AutoFitQuote weapon={weapon} />
          </PsdOverlay>
        )}
      </PsdComposite>
    </div>
  );
}

// Wraps <Effects> in a container whose font-size shrinks (via the
// --effect-size CSS variable) until all lines fit within the bounded height.
// Floor of 28 PSD-px keeps the text legible at the rendered scale.
function AutoFitEffects({ weapon }: { weapon: GunWeapon | MeleeWeapon }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const MAX = 44;
    const MIN = 28;
    let size = MAX;
    el.style.setProperty('--effect-size', `${size}px`);
    while (size > MIN && el.scrollHeight > el.clientHeight) {
      size -= 1;
      el.style.setProperty('--effect-size', `${size}px`);
    }
  }, [weapon]);
  return (
    <div ref={ref} className="weapon-card__effects">
      <Effects weapon={weapon} />
    </div>
  );
}

// Same shrink-to-fit pattern as AutoFitEffects, applied to the flavor text
// band (~137 PSD-px tall under the bottom rule). Floor at 20 PSD-px.
function AutoFitQuote({ weapon }: { weapon: GunWeapon | MeleeWeapon }) {
  const ref = useRef<HTMLDivElement>(null);
  const redText = weapon.redText;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const MAX = 34;
    const MIN = 20;
    let size = MAX;
    el.style.setProperty('--quote-size', `${size}px`);
    while (size > MIN && el.scrollHeight > el.clientHeight) {
      size -= 1;
      el.style.setProperty('--quote-size', `${size}px`);
    }
  }, [redText]);
  if (!redText) return null;
  return (
    <div ref={ref} className="weapon-card__quote">
      <span className="weapon-card__quote-title">{redText.title}</span>{' '}
      <span className="weapon-card__quote-effect">{redText.effect}</span>
    </div>
  );
}

function Effects({ weapon }: { weapon: GunWeapon | MeleeWeapon }) {
  return (
    <>
      {weapon.special && (
        <div className="weapon-card__effect">{firstClause(weapon.special)}</div>
      )}
      {weapon.guildBonus && weapon.guildBonus !== 'X' && (
        <div className="weapon-card__effect">
          {formatBonus(weapon.guildBonus)} {weapon.guildBonusLabel}
        </div>
      )}
      {weapon.module && (
        <div className="weapon-card__effect">
          <span className="weapon-card__module-name">{weapon.module.name}:</span>{' '}
          {weapon.module.text}
        </div>
      )}
    </>
  );
}

function firstClause(s: string): string {
  const i = s.indexOf('(');
  return (i > 0 ? s.slice(0, i) : s).trim();
}

// Spec writes some guild bonuses with a leading "+" ("+1") and some without
// ("1d6", "1"). Normalize so the card always shows a sign.
function formatBonus(raw: string): string {
  const t = raw.trim();
  return t.startsWith('+') || t.startsWith('-') ? t : `+${t}`;
}

// ---- Shield card -----------------------------------------------------------

// PSD coordinates for the three shield stat tables and the spaces around them.
// Column centers below were measured by sampling each table raster's text
// pixels — labels aren't always evenly distributed, so geometric thirds give
// misaligned values.
const SHIELD_LAYOUT = {
  // Threshold Table bounds: x=163,y=322,w=676,h=124. 3 columns Minor/Major/Grave.
  // Label x-centers in the raster: 45 / 338 / 630. Add layer.x = 163.
  threshold: {
    valuesY: 378,
    valuesHeight: 60,
    columnCenters: [208, 501, 793] as [number, number, number],
    columnWidth: 220,
  },
  // Capacity Table bounds: x=207,y=547,w=140,h=125. Label fills width.
  capacity: { centerX: 277, valueY: 610, height: 60 },
  // Regen Table bounds: x=617,y=547,w=216,h=125. Label fills width.
  regen: { centerX: 725, valueY: 610, height: 60 },
  // Effects-box header (Spell_DefaultBox > Table): x=61,y=731,w=877,h=108.
  // Top half is the "Tier X Shield | Guild" header; the divider rule sits
  // around local y≈50; the bottom half used to be the "Effects" label and is
  // now empty — the effects content overlay anchors right below the divider.
  effectsHeader: { x: 81, y: 731, width: 837, height: 50 },
  effects: { x: 81, y: 790, width: 837 },
};

function ShieldCard({ weapon }: { weapon: ShieldWeapon }) {
  const fullName = weaponDisplayName(weapon);

  const baseLayers = useMemo(() => getBackgroundLayers('shield'), []);
  const rarityLayers = useMemo(() => getRarityLayers('shield', weapon.rarity), [weapon.rarity]);
  const tableLayers = useMemo(() => getShieldTableLayers(), []);
  const nameSlot = useMemo(() => findByKind('shield', 'nameTextbox'), []);
  const quoteRect = useMemo(() => findByKind('shield', 'quoteBottomRect'), []);

  const allLayers = useMemo(
    () => [...baseLayers, ...rarityLayers, ...tableLayers],
    [baseLayers, rarityLayers, tableLayers],
  );

  const mod = weapon.thresholdModifier;
  const minor = weapon.thresholds.minor + (mod?.minor ?? 0);
  const major = weapon.thresholds.major + (mod?.major ?? 0);
  const grave = weapon.thresholds.grave + (mod?.grave ?? 0);

  return (
    <div className={`weapon-card weapon-card--${weapon.rarity.toLowerCase()}`}>
      <PsdComposite layers={allLayers}>
        {/* Name across the top */}
        {nameSlot && (
          <PsdOverlay
            x={0}
            y={nameSlot.y - 20}
            width={PSD_CANVAS.width}
            height={nameSlot.height + 40}
            className="weapon-card__name-wrap"
          >
            <div className="weapon-card__name">{fullName}</div>
          </PsdOverlay>
        )}

        {/* Threshold values — Minor / Major / Grave, aligned under the actual
            raster label positions (not geometric thirds). */}
        {SHIELD_LAYOUT.threshold.columnCenters.map((cx, i) => {
          const value = [minor, major, grave][i];
          return (
            <PsdOverlay
              key={i}
              x={cx - SHIELD_LAYOUT.threshold.columnWidth / 2}
              y={SHIELD_LAYOUT.threshold.valuesY}
              width={SHIELD_LAYOUT.threshold.columnWidth}
              height={SHIELD_LAYOUT.threshold.valuesHeight}
              className="shield-card__stat-cell"
            >
              <div className="shield-card__stat-value">{value}</div>
            </PsdOverlay>
          );
        })}

        {/* Capacity value — single number, centered. */}
        <PsdOverlay
          x={SHIELD_LAYOUT.capacity.centerX - 70}
          y={SHIELD_LAYOUT.capacity.valueY}
          width={140}
          height={SHIELD_LAYOUT.capacity.height}
          className="shield-card__stat-cell"
        >
          <div className="shield-card__stat-value">{weapon.capacity}</div>
        </PsdOverlay>

        {/* Regen formula — "<base> + MND". */}
        <PsdOverlay
          x={SHIELD_LAYOUT.regen.centerX - 108}
          y={SHIELD_LAYOUT.regen.valueY}
          width={216}
          height={SHIELD_LAYOUT.regen.height}
          className="shield-card__stat-cell"
        >
          <div className="shield-card__stat-value">{weapon.regenerationBase} + MND</div>
        </PsdOverlay>

        {/* Effects-box header overlay: Tier + "Shield" on the left, guild on
            the right — same idea as the gun stats-table "Tier X TYPE | Range"
            header that gets masked from the raster and replaced live. */}
        <PsdOverlay
          x={SHIELD_LAYOUT.effectsHeader.x}
          y={SHIELD_LAYOUT.effectsHeader.y}
          width={SHIELD_LAYOUT.effectsHeader.width}
          height={SHIELD_LAYOUT.effectsHeader.height}
          className="weapon-card__row"
        >
          <span>Tier {weapon.tier} Shield</span>
          <span>{weapon.guild}</span>
        </PsdOverlay>

        {/* Effects content — guild passive, in the same shrink-to-fit style
            as gun/melee. Bounded between the effects-box bottom (y≈839) and
            the quote bottom rectangle (y≈1168). */}
        {quoteRect && (
          <PsdOverlay
            x={SHIELD_LAYOUT.effects.x}
            y={SHIELD_LAYOUT.effects.y}
            width={SHIELD_LAYOUT.effects.width}
            height={quoteRect.y - SHIELD_LAYOUT.effects.y - 8}
          >
            <AutoFitShieldEffects weapon={weapon} />
          </PsdOverlay>
        )}
      </PsdComposite>
    </div>
  );
}

// Mirrors AutoFitEffects: render the guild passive (and the optional
// threshold modifier) as effect lines and shrink the font until everything
// fits the bounded effects band.
function AutoFitShieldEffects({ weapon }: { weapon: ShieldWeapon }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const MAX = 44;
    const MIN = 28;
    let size = MAX;
    el.style.setProperty('--effect-size', `${size}px`);
    while (size > MIN && el.scrollHeight > el.clientHeight) {
      size -= 1;
      el.style.setProperty('--effect-size', `${size}px`);
    }
  }, [weapon]);
  const value = weapon.guildPassive.value === 'X' ? null : weapon.guildPassive.value;
  const mod = weapon.thresholdModifier;
  return (
    <div ref={ref} className="weapon-card__effects">
      {value && <div className="weapon-card__effect">{formatBonus(value)}</div>}
      <div className="weapon-card__effect">
        <span className="weapon-card__module-name">{weapon.guildPassive.name}:</span>{' '}
        {weapon.guildPassive.description}
      </div>
      {mod && (
        <div className="weapon-card__effect">
          <span className="weapon-card__module-name">Threshold Modifier:</span>{' '}
          {mod.name} (Minor {signed(mod.minor)}, Major {signed(mod.major)}, Grave{' '}
          {signed(mod.grave)})
        </div>
      )}
    </div>
  );
}

function signed(n: number): string {
  if (n === 0) return '0';
  return n > 0 ? `+${n}` : String(n);
}
