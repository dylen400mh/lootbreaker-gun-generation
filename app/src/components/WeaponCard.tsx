import { useMemo } from 'react';
import {
  findByKind,
  getBackgroundLayers,
  getGuildLayers,
  getRarityLayers,
  PSD_CANVAS,
} from '../assets/psdManifest';
import { weaponArtUrl, pickWeaponWidth } from '../assets/manifest';
import { damageRowLayers } from '../generation/cardLayout';
import type { Weapon } from '../generation/types';
import { PsdComposite, PsdOverlay } from './PsdComposite';
import './WeaponCard.css';

interface Props {
  weapon: Weapon;
}

export function WeaponCard({ weapon }: Props) {
  const fullName = `${weapon.name.prefix} ${weapon.name.abbrev}-${weapon.name.number} ${weapon.name.suffix}`;

  const baseLayers = useMemo(() => getBackgroundLayers(), []);
  const rarityLayers = useMemo(() => getRarityLayers(weapon.rarity), [weapon.rarity]);
  const guildLayers = useMemo(() => getGuildLayers(), []);

  const damageLayers = useMemo(
    () => [
      ...damageRowLayers('minor', weapon.damage.minor, weapon.elements),
      ...damageRowLayers('major', weapon.damage.major, weapon.elements),
      ...damageRowLayers('grave', weapon.damage.grave, weapon.elements),
    ],
    [weapon.damage, weapon.elements],
  );

  const allLayers = useMemo(
    () => [...baseLayers, ...rarityLayers, ...guildLayers, ...damageLayers],
    [baseLayers, rarityLayers, guildLayers, damageLayers],
  );

  // Slot anchors for HTML overlays.
  const weaponSlot = useMemo(() => findByKind('weaponArtSlot'), []);
  const nameSlot = useMemo(() => findByKind('nameTextbox'), []);
  const guildSlot = useMemo(() => findByKind('guildTextbox'), []);
  const quoteSlot = useMemo(() => findByKind('quoteTextbox'), []);
  const statsTable = useMemo(() => findByKind('statisticsTable'), []);

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

        {/* Tier + Range row inside the stats table */}
        {statsTable && (
          <PsdOverlay
            x={statsTable.x + 30}
            y={statsTable.y + 12}
            width={statsTable.width - 60}
            className="weapon-card__row"
          >
            <span>
              Tier {weapon.tier} {weapon.type}
            </span>
            <span>Range: {weapon.range}</span>
          </PsdOverlay>
        )}

        {/* Damage row labels (Minor / Major / Grave) — sit at the row y-positions */}
        <DamageLabel y={616} text="Minor" />
        <DamageLabel y={702} text="Major" />
        <DamageLabel y={789} text="Grave" />

        {/* Module + guild bonus + special — placed below dice grid */}
        {statsTable && (
          <PsdOverlay
            x={statsTable.x + 24}
            y={statsTable.y + statsTable.height - 80}
            width={statsTable.width - 48}
            className="weapon-card__effects"
          >
            <Effects weapon={weapon} />
          </PsdOverlay>
        )}

        {/* Red text quote */}
        {weapon.redText && quoteSlot && (
          <PsdOverlay
            x={60}
            y={quoteSlot.y - 12}
            width={PSD_CANVAS.width - 120}
            className="weapon-card__quote"
          >
            <em>{weapon.redText.effect}</em>
          </PsdOverlay>
        )}
      </PsdComposite>
    </div>
  );
}

function DamageLabel({ y, text }: { y: number; text: string }) {
  return (
    <PsdOverlay x={70} y={y} width={120} className="weapon-card__damage-label">
      {text}
    </PsdOverlay>
  );
}

function Effects({ weapon }: { weapon: Weapon }) {
  const lines: { key: string; text: string; cls?: string }[] = [];
  if (weapon.special) {
    lines.push({ key: 'special', text: firstClause(weapon.special) });
  }
  if (weapon.guildBonus && weapon.guildBonus !== 'X') {
    lines.push({
      key: 'guildBonus',
      text: `${weapon.guildBonus} ${bonusLabel(weapon)}`,
      cls: 'weapon-card__effect--bonus',
    });
  }
  if (weapon.module) {
    lines.push({
      key: 'module',
      text: `${weapon.module.name}: ${weapon.module.text}`,
      cls: 'weapon-card__effect--module',
    });
  }
  return (
    <>
      {lines.map((l) => (
        <div key={l.key} className={`weapon-card__effect ${l.cls ?? ''}`}>
          {l.text}
        </div>
      ))}
    </>
  );
}

function firstClause(s: string): string {
  const i = s.indexOf('(');
  return (i > 0 ? s.slice(0, i) : s).trim();
}

function bonusLabel(weapon: Weapon): string {
  const m = weapon.guildPassive.match(
    /\b(Volt|Fire|Cold|Acid|Dark|Entropy|Light|Plasma|Kinetic)\s+Damage/i,
  );
  return m ? `${m[1]} Damage` : `${weapon.guild} Bonus`;
}
