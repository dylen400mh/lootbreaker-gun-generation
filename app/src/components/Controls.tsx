import { GUILD_BY_D12 } from '../generation/tables/gun/guilds';
import { GUN_PLAYER_CHOICE_TYPES } from '../generation/tables/gun/weaponTypes';
import { MELEE_PLAYER_CHOICE_TYPES } from '../generation/tables/melee/weaponTypes';
import { RARITIES } from '../generation/types';
import type {
  GuildName,
  GunType,
  MeleeType,
  Rarity,
  Tier,
  WeaponCategory,
} from '../generation/types';
import './Controls.css';

interface Props {
  category: WeaponCategory;
  tier: Tier;
  onTierChange: (t: Tier) => void;
  redText: boolean;
  onRedTextChange: (v: boolean) => void;
  weaponType: GunType | MeleeType | '';
  onWeaponTypeChange: (t: GunType | MeleeType | '') => void;
  guild: GuildName | '';
  onGuildChange: (g: GuildName | '') => void;
  rarity: Rarity | '';
  onRarityChange: (r: Rarity | '') => void;
  onRoll: () => void;
  rolling: boolean;
  onDownload: () => void;
  canDownload: boolean;
  downloading: boolean;
}

const TIERS: Tier[] = [1, 2, 3];

export function Controls({
  category,
  tier,
  onTierChange,
  redText,
  onRedTextChange,
  weaponType,
  onWeaponTypeChange,
  guild,
  onGuildChange,
  rarity,
  onRarityChange,
  onRoll,
  rolling,
  onDownload,
  canDownload,
  downloading,
}: Props) {
  const typeOptions: ReadonlyArray<GunType | MeleeType> =
    category === 'gun' ? GUN_PLAYER_CHOICE_TYPES : MELEE_PLAYER_CHOICE_TYPES;

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

      <fieldset className="controls__group">
        <legend>Weapon</legend>
        <select
          className="controls__select"
          value={weaponType}
          onChange={(e) => onWeaponTypeChange(e.target.value as GunType | MeleeType | '')}
        >
          <option value="">Random</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="controls__group">
        <legend>Guild</legend>
        <select
          className="controls__select"
          value={guild}
          onChange={(e) => onGuildChange(e.target.value as GuildName | '')}
        >
          <option value="">Random</option>
          {GUILD_BY_D12.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="controls__group">
        <legend>Rarity</legend>
        <select
          className="controls__select"
          value={rarity}
          onChange={(e) => onRarityChange(e.target.value as Rarity | '')}
        >
          <option value="">Random</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
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
