import { GUILD_BY_D12 } from '../generation/tables/gun/guilds';
import { GUN_PLAYER_CHOICE_TYPES } from '../generation/tables/gun/weaponTypes';
import { MELEE_PLAYER_CHOICE_TYPES } from '../generation/tables/melee/weaponTypes';
import { SHIELD_PLAYER_CHOICE_GUILDS } from '../generation/tables/shield/guilds';
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
  shieldDigits: boolean;
  onShieldDigitsChange: (v: boolean) => void;
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
  shieldDigits,
  onShieldDigitsChange,
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
  const isShield = category === 'shield';
  const isSpell = category === 'spell';
  // Spells have no pre-rollable "weapon type" — the delivery type is rolled
  // mid-procedure. Guns/melee gun expose their player-choice type list.
  const typeOptions: ReadonlyArray<GunType | MeleeType> =
    category === 'gun' ? GUN_PLAYER_CHOICE_TYPES : MELEE_PLAYER_CHOICE_TYPES;
  // Shields roll on a 2d8 → 14-guild table; guns/melee/spells on a d12 → 12
  // guilds (offensive spells share the gun/melee table; support spells use a
  // 6-guild subset). When the user pins a non-applicable guild for a support
  // spell, the procedure quietly re-rolls.
  const guildOptions: ReadonlyArray<GuildName> = isShield
    ? SHIELD_PLAYER_CHOICE_GUILDS
    : GUILD_BY_D12;

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

      {/* Shields have no per-type roll — guild is the first dice step. Spells
          have a delivery type but it's rolled mid-procedure, not pre-pinned. */}
      {!isShield && !isSpell && (
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
      )}

      <fieldset className="controls__group">
        <legend>Guild</legend>
        <select
          className="controls__select"
          value={guild}
          onChange={(e) => onGuildChange(e.target.value as GuildName | '')}
        >
          <option value="">Random</option>
          {guildOptions.map((g) => (
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

      {/* Red text is a gun/melee mechanic only. Shields and spells don't have
          a red-text step. */}
      {!isShield && !isSpell && (
        <label className="controls__toggle">
          <input
            type="checkbox"
            checked={redText}
            onChange={(e) => onRedTextChange(e.target.checked)}
          />
          <span>Red Text</span>
        </label>
      )}

      {/* Shield-only flavor toggle: append a 1–3 digit numeric tag to the
          name (e.g. "Steel Aegis 137"). Spec calls this optional GM flavor. */}
      {isShield && (
        <label className="controls__toggle">
          <input
            type="checkbox"
            checked={shieldDigits}
            onChange={(e) => onShieldDigitsChange(e.target.checked)}
          />
          <span>Numeric suffix</span>
        </label>
      )}

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
