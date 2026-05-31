import { useCallback, useState } from 'react';
import { formatChestLoot, rollChest } from '../generation/chest';
import { CHEST_SIZES, CHEST_SIZE_DICE } from '../generation/tables/chest/sizes';
import type { ChestRoll, ChestSize, Tier } from '../generation/types';
import './ChestPanel.css';

const TIERS: Tier[] = [1, 2, 3];

export function ChestPanel() {
  const [size, setSize] = useState<ChestSize>('Small');
  const [tier, setTier] = useState<Tier>(1);
  const [chest, setChest] = useState<ChestRoll | null>(null);

  const handleRoll = useCallback(() => {
    setChest(rollChest({ size, tier }));
  }, [size, tier]);

  const diceCount = CHEST_SIZE_DICE[size];

  return (
    <section className="chest-panel" aria-label="Chest loot">
      <header className="chest-panel__header">
        <h2 className="chest-panel__title">Chest</h2>
        <p className="chest-panel__subtitle">Roll loot, then visit the generators below for any weapons it awards.</p>
      </header>

      <div className="chest-panel__controls">
        <fieldset className="chest-panel__group">
          <legend>Size</legend>
          <select
            className="chest-panel__select"
            value={size}
            onChange={(e) => setSize(e.target.value as ChestSize)}
          >
            {CHEST_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} ({CHEST_SIZE_DICE[s]}d6)
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="chest-panel__group">
          <legend>Tier</legend>
          <div className="chest-panel__tiers" role="radiogroup" aria-label="Chest tier">
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tier === t}
                className={`chest-panel__tier ${tier === t ? 'is-active' : ''}`}
                onClick={() => setTier(t)}
              >
                T{t}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="button" className="chest-panel__roll" onClick={handleRoll}>
          Roll {diceCount}d6
        </button>
      </div>

      {chest && (
        <div className="chest-panel__result" aria-live="polite">
          <div className="chest-panel__result-header">
            {chest.size} Chest — Tier {chest.tier}
          </div>
          <div className="chest-panel__result-rolls">
            Rolled {chest.rolls.length}d6: [{chest.rolls.join(', ')}] = {chest.total}
          </div>
          <div className="chest-panel__result-loot">{formatChestLoot(chest)}</div>
        </div>
      )}
    </section>
  );
}
