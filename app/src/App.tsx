import { useCallback, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { getBackgroundLayers } from './assets/psdManifest';
import { ChestPanel } from './components/ChestPanel';
import { useChoiceModal } from './components/ChoiceModal';
import { Controls } from './components/Controls';
import { PsdComposite } from './components/PsdComposite';
import { WeaponCard } from './components/WeaponCard';
import { generateWeapon } from './generation/procedure';
import { weaponFilenameStem } from './generation/types';
import type {
  GuildName,
  GunType,
  MeleeType,
  Rarity,
  Tier,
  Weapon,
  WeaponCategory,
} from './generation/types';
import './App.css';

const CATEGORIES: ReadonlyArray<{ value: WeaponCategory; label: string }> = [
  { value: 'gun', label: 'Guns' },
  { value: 'melee', label: 'Melee' },
  { value: 'shield', label: 'Shields' },
  { value: 'spell', label: 'Spells' },
];

export default function App() {
  const [category, setCategory] = useState<WeaponCategory>('gun');
  const [tier, setTier] = useState<Tier>(2);
  const [redText, setRedText] = useState(false);
  const [shieldDigits, setShieldDigits] = useState(false);
  const [weaponType, setWeaponType] = useState<GunType | MeleeType | ''>('');
  const [guild, setGuild] = useState<GuildName | ''>('');
  const [rarity, setRarity] = useState<Rarity | ''>('');
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [rolling, setRolling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { askChoice, modal } = useChoiceModal();
  // Empty-state background follows the active category so switching tabs
  // before rolling shows the right card frame. Spells default to the
  // Missile/Beam variant for the empty-state preview; the live SpellCard
  // swaps to the AOE manifest when a generated spell uses an AOE delivery.
  const backgroundLayers = useMemo(
    () => getBackgroundLayers(category === 'spell' ? 'spell-missile-beam' : category),
    [category],
  );
  const cardRef = useRef<HTMLDivElement>(null);

  // Switching category resets the pinned weapon-type selection (the option
  // list changes), clears the rolled card, and resets the guild pin since
  // shields use a different guild table than guns/melee.
  const handleCategoryChange = useCallback((next: WeaponCategory) => {
    setCategory(next);
    setWeaponType('');
    setGuild('');
    setWeapon(null);
  }, []);

  const handleRoll = useCallback(async () => {
    setRolling(true);
    try {
      const w = await generateWeapon(
        {
          category,
          tier,
          redTextEnabled: redText,
          weaponType: weaponType || undefined,
          guild: guild || undefined,
          rarity: rarity || undefined,
          shieldDigits,
        },
        askChoice,
      );
      setWeapon(w);
    } finally {
      setRolling(false);
    }
  }, [category, tier, redText, weaponType, guild, rarity, shieldDigits, askChoice]);

  const handleDownload = useCallback(async () => {
    if (!weapon) return;
    // Capture the inner PSD canvas at its natural 1000×1363 size with the
    // viewport-scaling transform reset. Capturing the outer (scaled) wrapper
    // confuses html-to-image's bounding-box math and can clip absolute
    // children near the edges (e.g. the flavor text at y≈1226).
    const inner = cardRef.current?.querySelector('.psd-composite__inner') as HTMLElement | null;
    if (!inner) return;
    setDownloading(true);
    try {
      // Pre-warm every image so html-to-image's serialization step never sees
      // a half-decoded raster. iOS Safari skips images that aren't fully
      // ready, which left the background + stats raster blank in earlier
      // exports while text rendered fine.
      const imgs = Array.from(inner.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? img.decode().catch(() => undefined)
            : new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
              }),
        ),
      );
      const opts = {
        width: 1000,
        height: 1363,
        pixelRatio: 2,
        // cacheBust forces a refetch which on Safari can race past the warmed
        // cache and re-introduce blank images. Leave it off — the live
        // crossOrigin <img> tags are already canvas-readable.
        cacheBust: false,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      };
      // Safari sometimes returns a blank PNG on the first toBlob call before
      // images finish decoding into the off-screen canvas. Discarding the
      // first pass and using the second is a documented workaround.
      await toBlob(inner, opts);
      const blob = await toBlob(inner, opts);
      if (!blob) return;
      const filename = `${weaponFilenameStem(weapon)}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      // Mobile: prefer Web Share with files when available so users can drop
      // the card straight into a chat / save it via the system share sheet.
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: filename });
          return;
        } catch {
          // user dismissed share sheet — fall through to download
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [weapon]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Lootbreaker</h1>
        <p className="app__subtitle">Procedural Weapon Generator</p>
      </header>

      <ChestPanel />

      <div className="app__divider" role="presentation" />

      <div className="app__tabs" role="tablist" aria-label="Weapon category">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={category === c.value}
            className={`app__tab ${category === c.value ? 'is-active' : ''}`}
            onClick={() => handleCategoryChange(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <main className="app__main">
        <div className="app__result" ref={cardRef}>
          {weapon ? (
            <WeaponCard weapon={weapon} />
          ) : (
            <PsdComposite layers={backgroundLayers} />
          )}
        </div>

        <div className="app__controls-wrap">
          <Controls
            category={category}
            tier={tier}
            onTierChange={setTier}
            redText={redText}
            onRedTextChange={setRedText}
            shieldDigits={shieldDigits}
            onShieldDigitsChange={setShieldDigits}
            weaponType={weaponType}
            onWeaponTypeChange={setWeaponType}
            guild={guild}
            onGuildChange={setGuild}
            rarity={rarity}
            onRarityChange={setRarity}
            onRoll={handleRoll}
            rolling={rolling}
            onDownload={handleDownload}
            canDownload={!!weapon}
            downloading={downloading}
          />
        </div>
      </main>

      {modal}
    </div>
  );
}
