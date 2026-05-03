import { useCallback, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { getBackgroundLayers } from './assets/psdManifest';
import { useChoiceModal } from './components/ChoiceModal';
import { Controls } from './components/Controls';
import { PsdComposite } from './components/PsdComposite';
import { WeaponCard } from './components/WeaponCard';
import { generateWeapon } from './generation/procedure';
import type { GuildName, Rarity, Tier, Weapon, WeaponType } from './generation/types';
import './App.css';

export default function App() {
  const [tier, setTier] = useState<Tier>(2);
  const [redText, setRedText] = useState(false);
  const [weaponType, setWeaponType] = useState<WeaponType | ''>('');
  const [guild, setGuild] = useState<GuildName | ''>('');
  const [rarity, setRarity] = useState<Rarity | ''>('');
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [rolling, setRolling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { askChoice, modal } = useChoiceModal();
  const backgroundLayers = useMemo(() => getBackgroundLayers(), []);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleRoll = useCallback(async () => {
    setRolling(true);
    try {
      const w = await generateWeapon(
        {
          tier,
          redTextEnabled: redText,
          weaponType: weaponType || undefined,
          guild: guild || undefined,
          rarity: rarity || undefined,
        },
        askChoice,
      );
      setWeapon(w);
    } finally {
      setRolling(false);
    }
  }, [tier, redText, weaponType, guild, rarity, askChoice]);

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
      const blob = await toBlob(inner, {
        width: 1000,
        height: 1363,
        pixelRatio: 2,
        cacheBust: true,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      });
      if (!blob) return;
      const filename = `lootbreaker-${weapon.name.prefix}-${weapon.name.abbrev}-${weapon.name.number}.png`
        .toLowerCase()
        .replace(/\s+/g, '-');
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
        <p className="app__subtitle">Procedural Gun Generator</p>
      </header>

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
            tier={tier}
            onTierChange={setTier}
            redText={redText}
            onRedTextChange={setRedText}
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
