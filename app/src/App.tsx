import { useCallback, useMemo, useState } from 'react';
import { getBackgroundLayers } from './assets/psdManifest';
import { useChoiceModal } from './components/ChoiceModal';
import { Controls } from './components/Controls';
import { PsdComposite } from './components/PsdComposite';
import { WeaponCard } from './components/WeaponCard';
import { generateWeapon } from './generation/procedure';
import type { Tier, Weapon } from './generation/types';
import './App.css';

export default function App() {
  const [tier, setTier] = useState<Tier>(2);
  const [redText, setRedText] = useState(false);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [rolling, setRolling] = useState(false);
  const { askChoice, modal } = useChoiceModal();
  const backgroundLayers = useMemo(() => getBackgroundLayers(), []);

  const handleRoll = useCallback(async () => {
    setRolling(true);
    try {
      const w = await generateWeapon({ tier, redTextEnabled: redText }, askChoice);
      setWeapon(w);
    } finally {
      setRolling(false);
    }
  }, [tier, redText, askChoice]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Lootbreaker</h1>
        <p className="app__subtitle">Procedural Gun Generator</p>
      </header>

      <main className="app__main">
        <div className="app__result">
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
            onRoll={handleRoll}
            rolling={rolling}
          />
        </div>
      </main>

      {modal}
    </div>
  );
}
