import { useEffect, useMemo, useRef } from 'react';
import {
  findByKind,
  getBackgroundLayers,
  getGuildLayers,
  getRarityLayers,
  getStatisticsLayers,
  PSD_CANVAS,
} from '../assets/psdManifest';
import { weaponArtUrl, pickWeaponWidth } from '../assets/manifest';
import { damageRowLayers } from '../generation/cardLayout';
import { GUILDS } from '../generation/tables/guilds';
import type { Weapon } from '../generation/types';
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
  const fullName = `${weapon.name.prefix} ${weapon.name.abbrev}-${weapon.name.number} ${weapon.name.suffix}`;

  const baseLayers = useMemo(() => getBackgroundLayers(), []);
  const rarityLayers = useMemo(() => getRarityLayers(weapon.rarity), [weapon.rarity]);
  const guildLayers = useMemo(() => getGuildLayers(), []);
  const statsLayers = useMemo(() => getStatisticsLayers(), []);

  const damageLayers = useMemo(
    () => [
      ...damageRowLayers('minor', weapon.damage.minor, weapon.elements),
      ...damageRowLayers('major', weapon.damage.major, weapon.elements),
      ...damageRowLayers('grave', weapon.damage.grave, weapon.elements),
    ],
    [weapon.damage, weapon.elements],
  );

  const allLayers = useMemo(
    () => [...baseLayers, ...rarityLayers, ...guildLayers, ...statsLayers, ...damageLayers],
    [baseLayers, rarityLayers, guildLayers, statsLayers, damageLayers],
  );

  // Slot anchors for HTML overlays.
  const weaponSlot = useMemo(() => findByKind('weaponArtSlot'), []);
  const nameSlot = useMemo(() => findByKind('nameTextbox'), []);
  const guildSlot = useMemo(() => findByKind('guildTextbox'), []);
  const quoteRect = useMemo(() => findByKind('quoteBottomRect'), []);

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
function AutoFitEffects({ weapon }: { weapon: Weapon }) {
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
function AutoFitQuote({ weapon }: { weapon: Weapon }) {
  const ref = useRef<HTMLDivElement>(null);
  const redText = weapon.redText;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const MAX = 36;
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
      <span className="weapon-card__quote-title">{redText.title}</span>
      {' — '}
      {redText.effect}
    </div>
  );
}

function Effects({ weapon }: { weapon: Weapon }) {
  return (
    <>
      {weapon.special && (
        <div className="weapon-card__effect">{firstClause(weapon.special)}</div>
      )}
      {weapon.guildBonus && weapon.guildBonus !== 'X' && (
        <div className="weapon-card__effect">
          {formatBonus(weapon.guildBonus)} {GUILDS[weapon.guild].bonusLabel}
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
