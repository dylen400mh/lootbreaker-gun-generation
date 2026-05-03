import type { Tier } from '../generation/types';
import './Controls.css';

interface Props {
  tier: Tier;
  onTierChange: (t: Tier) => void;
  redText: boolean;
  onRedTextChange: (v: boolean) => void;
  onRoll: () => void;
  rolling: boolean;
  onDownload: () => void;
  canDownload: boolean;
  downloading: boolean;
}

const TIERS: Tier[] = [1, 2, 3];

export function Controls({
  tier,
  onTierChange,
  redText,
  onRedTextChange,
  onRoll,
  rolling,
  onDownload,
  canDownload,
  downloading,
}: Props) {
  return (
    <div className="controls">
      <fieldset className="controls__group">
        <legend>Tier</legend>
        <div className="controls__tiers" role="radiogroup" aria-label="Player tier">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tier === t}
              className={`controls__tier ${tier === t ? 'is-active' : ''}`}
              onClick={() => onTierChange(t)}
            >
              T{t}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="controls__toggle">
        <input
          type="checkbox"
          checked={redText}
          onChange={(e) => onRedTextChange(e.target.checked)}
        />
        <span>Red Text</span>
      </label>

      <button
        type="button"
        className="controls__roll"
        onClick={onRoll}
        disabled={rolling}
      >
        {rolling ? 'Rolling…' : 'Roll Weapon'}
      </button>

      <button
        type="button"
        className="controls__download"
        onClick={onDownload}
        disabled={!canDownload || downloading}
      >
        {downloading ? 'Saving…' : 'Download PNG'}
      </button>
    </div>
  );
}
