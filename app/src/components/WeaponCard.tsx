import { useEffect, useMemo, useRef } from 'react';
import {
  findByKind,
  findDamageIcon,
  findDie,
  getBackgroundLayers,
  getGuildLayers,
  getRarityLayers,
  getShieldTableLayers,
  getStatisticsLayers,
  PSD_CANVAS,
  spellManifestKey,
  type ManifestKey,
  type PsdLayer,
} from '../assets/psdManifest';
import { weaponArtUrl, pickWeaponWidth } from '../assets/manifest';
import { damageRowLayers } from '../generation/cardLayout';
import { parseDamage } from '../generation/damage';
import {
  OFFENSIVE_DELIVERY_DESCRIPTIONS,
  SUPPORT_DELIVERY_DESCRIPTIONS,
} from '../generation/tables/spell/deliveryTypes';
import {
  weaponDisplayName,
  type GunWeapon,
  type MeleeWeapon,
  type OffensiveSpellWeapon,
  type ShieldWeapon,
  type SpellCondition,
  type SpellGuildBonus,
  type SpellWeapon,
  type SupportSpellWeapon,
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
  if (weapon.category === 'spell') {
    return <SpellCard weapon={weapon} />;
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

// Renders the shield's guild passive (with the rolled value woven into the
// description text via a `{value}` placeholder) plus the optional threshold
// modifier. Guilds whose value is the spec's "X" marker (no bonus at Common)
// skip the passive line entirely. Shrinks font until everything fits.
function AutoFitShieldEffects({ weapon }: { weapon: ShieldWeapon }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasBonus = weapon.guildPassive.value !== 'X';
  const passiveText = hasBonus
    ? weapon.guildPassive.description.replace('{value}', weapon.guildPassive.value)
    : '';
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
  }, [weapon, passiveText]);
  const mod = weapon.thresholdModifier;
  return (
    <div ref={ref} className="weapon-card__effects">
      {hasBonus && (
        <div className="weapon-card__effect">
          <span className="weapon-card__module-name">{weapon.guildPassive.name}:</span>{' '}
          {passiveText}
        </div>
      )}
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

// ---- Spell card ------------------------------------------------------------

// Picks the correct manifest (AOE vs Missile/Beam) for the spell's delivery
// type. AOE PSD only ships a single Minor damage row; Missile/Beam ships all
// three (Minor/Major/Grave).
function spellCardKey(weapon: SpellWeapon): ManifestKey {
  return spellManifestKey(weapon.deliveryType);
}

// Y position (canvas px) for the effects content overlay — anchored below
// the dice rows so the description and guild-bonus text never overlap dice
// icons. Missile/Beam packs three dice rows (Minor/Major/Grave) ending at
// canvas y≈937, then a divider at ≈940. AOE has a single Damage row ending
// at canvas y≈764, then a divider at ≈767. Both PSDs have their lower
// placeholder bands masked at extract time so the overlay sits on a clean
// background.
function spellEffectsY(key: ManifestKey): number {
  return key === 'spell-missile-beam' ? 945 : 770;
}

// Spells reuse the gun/melee damage card geometry but skip the elemental cell
// roll — the icon next to each die row is the spell's rolled DamageType, and
// there are no bonus dice. AOE spells render one flat row; single-target
// offensive spells render Minor/Major/Grave.
function spellDamageRow(
  key: ManifestKey,
  row: 'minor' | 'major' | 'grave',
  formula: string,
  damageType: string,
): PsdLayer[] {
  const out: PsdLayer[] = [];
  let column = 1;
  for (const term of parseDamage(formula)) {
    for (let i = 0; i < term.count; i += 1) {
      const die = findDie(key, row, column, term.sides);
      if (die) out.push(die);
      column += 1;
      if (column > 7) return out;
    }
  }
  const icon = findDamageIcon(key, row, column, damageType as never);
  if (icon) out.push(icon);
  return out;
}

function SpellCard({ weapon }: { weapon: SpellWeapon }) {
  if (weapon.subType === 'Offensive') {
    return <OffensiveSpellCard weapon={weapon} />;
  }
  return <SupportSpellCard weapon={weapon} />;
}

function OffensiveSpellCard({ weapon }: { weapon: OffensiveSpellWeapon }) {
  const fullName = weaponDisplayName(weapon);
  const key = spellCardKey(weapon);

  const baseLayers = useMemo(() => getBackgroundLayers(key), [key]);
  const rarityLayers = useMemo(() => getRarityLayers(key, weapon.rarity), [key, weapon.rarity]);
  const guildLayers = useMemo(() => getGuildLayers(key), [key]);
  const statsLayers = useMemo(() => getStatisticsLayers(key), [key]);

  const damageLayers = useMemo(() => {
    if (weapon.damage.kind === 'aoe') {
      return spellDamageRow(key, 'minor', weapon.damage.damage, weapon.damageType);
    }
    return [
      ...spellDamageRow(key, 'minor', weapon.damage.minor, weapon.damageType),
      ...spellDamageRow(key, 'major', weapon.damage.major, weapon.damageType),
      ...spellDamageRow(key, 'grave', weapon.damage.grave, weapon.damageType),
    ];
  }, [key, weapon.damage, weapon.damageType]);

  const allLayers = useMemo(
    () => [...baseLayers, ...rarityLayers, ...guildLayers, ...statsLayers, ...damageLayers],
    [baseLayers, rarityLayers, guildLayers, statsLayers, damageLayers],
  );

  const nameSlot = useMemo(() => findByKind(key, 'nameTextbox'), [key]);
  const guildSlot = useMemo(() => findByKind(key, 'guildTextbox'), [key]);
  const quoteRect = useMemo(() => findByKind(key, 'quoteBottomRect'), [key]);

  const rangeValue = String(weapon.damage.range);
  const areaValue =
    weapon.damage.kind === 'aoe' ? weapon.damage.area ?? '' : '';

  return (
    <div className={`weapon-card weapon-card--${weapon.rarity.toLowerCase()}`}>
      <PsdComposite layers={allLayers}>
        {nameSlot && (
          <PsdOverlay
            x={0}
            y={nameSlot.y - 20}
            width={PSD_CANVAS.width}
            height={nameSlot.height + 40}
            className="weapon-card__name-wrap"
          >
            <AutoFitName name={fullName} />
          </PsdOverlay>
        )}

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

        {/* The raster's top two placeholder rows ("Tier 1 Spell" / "Range" and
            "Delivery type: X" / "Area: X [s]s]") were cleared at extract
            time, leaving an empty 112-px band that holds these two live
            overlays. */}
        <PsdOverlay
          x={STATS_LAYOUT.tableX + 20}
          y={STATS_LAYOUT.headerY}
          width={STATS_LAYOUT.tableWidth - 40}
          height={56}
          className="weapon-card__row"
        >
          <span>Tier {weapon.tier} Spell</span>
          <span className="weapon-card__row-range">
            <span>Range:</span>
            <span>{rangeValue}</span>
          </span>
        </PsdOverlay>

        <PsdOverlay
          x={STATS_LAYOUT.tableX + 20}
          y={STATS_LAYOUT.headerY + 56}
          width={STATS_LAYOUT.tableWidth - 40}
          height={56}
          className="weapon-card__row"
        >
          <span>Delivery Type: {weapon.deliveryType}</span>
          {areaValue ? (
            <span className="weapon-card__row-range">
              <span>Area:</span>
              <span>{areaValue}</span>
            </span>
          ) : (
            <span />
          )}
        </PsdOverlay>

        {quoteRect && (
          <PsdOverlay
            x={STATS_LAYOUT.contentLeftX}
            y={spellEffectsY(key)}
            width={STATS_LAYOUT.tableX + STATS_LAYOUT.tableWidth - STATS_LAYOUT.contentLeftX - 20}
            height={quoteRect.y - spellEffectsY(key) - 8}
          >
            <AutoFitSpellEffects
              mpCost={weapon.mpCost}
              conditions={weapon.conditions}
              description={OFFENSIVE_DELIVERY_DESCRIPTIONS[weapon.deliveryType]}
              bonus={weapon.guildBonus}
            />
          </PsdOverlay>
        )}
      </PsdComposite>
    </div>
  );
}

function SupportSpellCard({ weapon }: { weapon: SupportSpellWeapon }) {
  const fullName = weaponDisplayName(weapon);
  // Support spells always render on the Missile/Beam card frame — its taller
  // statistics table fits the healing / range / VP cost stack better, and
  // support deliveries (Missile / Beam / Multi-Target Missile / Cube) all
  // skip damage dice, so the three damage rows are simply empty.
  const key: ManifestKey = 'spell-missile-beam';

  const baseLayers = useMemo(() => getBackgroundLayers(key), [key]);
  const rarityLayers = useMemo(() => getRarityLayers(key, weapon.rarity), [key, weapon.rarity]);
  const guildLayers = useMemo(() => getGuildLayers(key), [key]);
  const statsLayers = useMemo(() => getStatisticsLayers(key), [key]);

  const allLayers = useMemo(
    () => [...baseLayers, ...rarityLayers, ...guildLayers, ...statsLayers],
    [baseLayers, rarityLayers, guildLayers, statsLayers],
  );

  const nameSlot = useMemo(() => findByKind(key, 'nameTextbox'), [key]);
  const guildSlot = useMemo(() => findByKind(key, 'guildTextbox'), [key]);
  const quoteRect = useMemo(() => findByKind(key, 'quoteBottomRect'), [key]);

  return (
    <div className={`weapon-card weapon-card--${weapon.rarity.toLowerCase()}`}>
      <PsdComposite layers={allLayers}>
        {nameSlot && (
          <PsdOverlay
            x={0}
            y={nameSlot.y - 20}
            width={PSD_CANVAS.width}
            height={nameSlot.height + 40}
            className="weapon-card__name-wrap"
          >
            <AutoFitName name={fullName} />
          </PsdOverlay>
        )}

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

        {/* The raster's top two placeholder rows were cleared at extract
            time; these two overlays fill the resulting 112-px band. */}
        <PsdOverlay
          x={STATS_LAYOUT.tableX + 20}
          y={STATS_LAYOUT.headerY}
          width={STATS_LAYOUT.tableWidth - 40}
          height={56}
          className="weapon-card__row"
        >
          <span>Tier {weapon.tier} Spell</span>
          <span className="weapon-card__row-range">
            <span>Range:</span>
            <span>{weapon.healing.range}</span>
          </span>
        </PsdOverlay>

        <PsdOverlay
          x={STATS_LAYOUT.tableX + 20}
          y={STATS_LAYOUT.headerY + 56}
          width={STATS_LAYOUT.tableWidth - 40}
          height={56}
          className="weapon-card__row"
        >
          <span>Delivery Type: {weapon.deliveryType}</span>
          {weapon.healing.area ? (
            <span className="weapon-card__row-range">
              <span>Area:</span>
              <span>{weapon.healing.area}</span>
            </span>
          ) : (
            <span />
          )}
        </PsdOverlay>

        {quoteRect && (
          <PsdOverlay
            x={STATS_LAYOUT.contentLeftX}
            y={spellEffectsY(key)}
            width={STATS_LAYOUT.tableX + STATS_LAYOUT.tableWidth - STATS_LAYOUT.contentLeftX - 20}
            height={quoteRect.y - spellEffectsY(key) - 8}
          >
            <AutoFitSpellEffects
              mpCost={weapon.mpCost}
              vitalityCost={weapon.healing.vitalityCost}
              description={SUPPORT_DELIVERY_DESCRIPTIONS[weapon.deliveryType] ?? ''}
              bonus={weapon.guildBonus}
            />
          </PsdOverlay>
        )}
      </PsdComposite>
    </div>
  );
}


// Stacked content for the spell card's lower effects band, top → bottom:
//   1. MP Cost (always)
//   2. Conditions list (offensive only, hidden when empty)
//      OR Vitality Cost (support only)
//   3. Delivery-type description (spec verbatim)
//   4. Guild bonus, with `{value}` woven into the description text
// Bonus is hidden entirely when the rolled value is the spec's "X" marker
// (no bonus at this rarity). One shared font-size auto-shrink pass keeps
// every line at a consistent size.
function AutoFitSpellEffects({
  mpCost,
  conditions,
  vitalityCost,
  description,
  bonus,
}: {
  mpCost: number;
  conditions?: SpellCondition[];
  vitalityCost?: number;
  description: string;
  bonus: SpellGuildBonus;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasBonus = bonus.value !== 'X';
  const bonusText = hasBonus
    ? bonus.description.replace('{value}', bonus.value)
    : '';
  const conditionsText = conditions && conditions.length > 0
    ? conditions.map((c) => `${c.name} (${c.duration} turn${c.duration === 1 ? '' : 's'})`).join(', ')
    : '';
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const MAX = 44;
    const MIN = 24;
    let size = MAX;
    el.style.setProperty('--effect-size', `${size}px`);
    while (size > MIN && el.scrollHeight > el.clientHeight) {
      size -= 1;
      el.style.setProperty('--effect-size', `${size}px`);
    }
  }, [mpCost, conditionsText, vitalityCost, description, bonusText]);
  return (
    <div ref={ref} className="weapon-card__effects">
      <div className="weapon-card__effect">MP Cost: {mpCost}</div>
      {conditionsText && (
        <div className="weapon-card__effect">Conditions: {conditionsText}</div>
      )}
      {vitalityCost != null && (
        <div className="weapon-card__effect">Vitality Cost: {vitalityCost}</div>
      )}
      {description && (
        <div className="weapon-card__effect">{description}</div>
      )}
      {hasBonus && (
        <div className="weapon-card__effect">
          <span className="weapon-card__module-name">{bonus.name}:</span>{' '}
          {bonusText}
        </div>
      )}
    </div>
  );
}

// Spell names like "Crimson Multi-Target Missile of Plasma" can blow past
// the name-slot width at the default 84-px font. Shrink to fit so the name
// stays on one centered line without clipping.
function AutoFitName({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const MAX = 84;
    const MIN = 40;
    let size = MAX;
    el.style.setProperty('--name-size', `${size}px`);
    while (size > MIN && el.scrollWidth > el.clientWidth) {
      size -= 2;
      el.style.setProperty('--name-size', `${size}px`);
    }
  }, [name]);
  return (
    <div ref={ref} className="weapon-card__name weapon-card__name--fit">
      {name}
    </div>
  );
}
