# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

Two top-level pieces:

- `Lootbreaker_AppResources/` — the **authoritative specs**:
  - Guns: `Lootbreaker_GunGeneration_Version0dot10_StepByStep.md` (`.pdf` alongside), `Weapon_PSD.psd` template, source art (`Weapon Art/`, `Icons/`, `Dice/`).
  - Melee: `Melee Weapon Assets/Lootbreaker_MeleeWeaponGeneration_Version0dot10.pdf`, `Melee_Weapon_Card_Root.psd` template, and the 6 melee weapon PNGs in the same folder.
  - Shields: `Shield Assets/Shield_Generation_V_0dot10.pdf` (`.odt` alongside) and `Shield_Base.psd` template. No raw weapon art — the shield card is fully PSD-driven.
  - Spells: `Spell Assets/Spell_Generation_V0_dot_10.pdf` (`.odt` alongside) and two PSDs — `Spell_AOE_Base.psd` (one Damage Section MINOR row for Line/Cone/Cube/Cylinder/Sphere deliveries) and `Spell_Missile_Beam_Base.psd` (Minor/Major/Grave rows for Missile/Beam/Multi-Target Missile deliveries). No raw weapon art — both spell cards are fully PSD-driven.
- `app/` — Vite + React 19 + TypeScript web app that runs all four v0.10 procedures and lets the user switch between them via the category tabs. **All commands below run from `app/`.**

## Common commands (all run from `app/`)

```sh
npm install
npm run prepare-assets       # WebP variants of all weapon art / Icons / Dice → public/{weapons,icons,dice}
npm run extract-psd          # extracts ALL FOUR categories (gun → melee → shield → spell); aliases for extract-psd:{gun,melee,shield,spell}
npm run extract-psd:gun      # Weapon_PSD.psd → public/psd/gun/ + src/generated/gunPsdManifest.json
npm run extract-psd:melee    # Melee_Weapon_Card_Root.psd → public/psd/melee/ + src/generated/meleePsdManifest.json
npm run extract-psd:shield   # Shield_Base.psd → public/psd/shield/ + src/generated/shieldPsdManifest.json
npm run extract-psd:spell    # both spell PSDs (umbrella for the two variants below)
npm run extract-psd:spell:aoe          # Spell_AOE_Base.psd → public/psd/spell/aoe/ + src/generated/spellAoePsdManifest.json
npm run extract-psd:spell:missile-beam # Spell_Missile_Beam_Base.psd → public/psd/spell/missile-beam/ + src/generated/spellMissileBeamPsdManifest.json
npm run dev                  # vite dev server (HMR)
npm run build                # tsc -b && vite build
npm run test                 # vitest, single run
npm run test:watch
npm run lint                 # eslint
npm run inspect-psd          # debug-print a PSD layer tree (defaults to the gun PSD; pass a path to inspect melee/shield)
```

A single test file: `npx vitest run src/generation/procedure.test.ts` (add `-t "name"` to filter by test name).

`prepare-assets` and the extract scripts both read from `../Lootbreaker_AppResources/`; re-run them whenever the source art or PSDs change. **All PSDs must be in RGB color mode** — if `ag-psd` errors, open the PSD in Photopea and convert before retrying.

## Architecture

### Generation pipeline (`src/generation/`)

`procedure.ts → generateWeapon(opts, askChoice)` is a direct, ordered transcription of each spec's procedure. `opts.category` (`'gun' | 'melee' | 'shield' | 'spell'`) dispatches the per-category table set and procedure. **Gun and melee share the same overall shape** (damage card with elements, modules, red text); **shield is structurally different** (no damage dice, no elements, no modules, no red text) and gets its own 7-step flow; **spell** has two further sub-types (Offensive and Support) rolled at Step 0 on a 1d20, each running its own multi-step flow.

- Step 1: **Guns** roll Weapon Type on 1d8 (slot 5 silently re-rolls, slot 8 = Player Choice); **melee** rolls Weapon Type on 2d4 (sum 8 = Player Choice); **shields** skip weapon-type entirely and roll Guild on 2d8 (sum 16 = Player Choice); **spells** roll Sub-Type on 1d20 (1–16 Offensive, 17–19 Support, 20 = Player Choice).
- Steps 2–6: gun/melee share shape (rarity → elements → module chance → guild → red text); shield runs (rarity → capacity → regeneration → guild passive → threshold modifier); spell runs (rarity → delivery type → base damage/healing → guild → damage type or healing type → conditions for offensive only). Shared tables live under `tables/shared/` (rarity, naming pieces); per-category tables under `tables/{gun,melee,shield,spell}/`.
- Final step (Name): **guns** produce `Prefix ABBR-### Suffix`; **melee** does a coin flip between prefix and suffix joined with a per-type base name (Stiletto, Maul, Glaive, …); **shields** roll 1d100 to pick prefix vs suffix and join it with a 1d10 base name (Aegis, Bulwark, …), optionally appending a 1–3 digit numeric suffix when the UI's `shieldDigits` toggle is on; **offensive spells** produce `Prefix [Delivery] of [DamageType]` from a 1d100 prefix (the spec list is byte-identical to the shared `PREFIXES` table, so it's re-exported rather than duplicated) — with the special case that Kinetic damage renames to `Kinetic Prefix [Delivery]`; **support spells** produce `Prefix [Delivery] of [HealingType]` from a 1d20 support-specific prefix list.

`Weapon` is a discriminated union `GunWeapon | MeleeWeapon | ShieldWeapon | SpellWeapon` keyed on `category` (`types.ts`); `SpellWeapon` is itself `OffensiveSpellWeapon | SupportSpellWeapon` keyed on `subType`. Gun and melee share a `DamageWeaponCommon` interface; shield and spell do not. `GuildName = DamageGuildName | ShieldOnlyGuildName` — the 12 d12 damage guilds are shared by gun/melee/offensive-spell; `Fortis` and `Ressurecta` appear in both the shield 2d8 guild table and the support-spell 1d6 guild table.

The `tables/` files are verbatim spec data — when a spec changes, those files change; logic lives only in `procedure.ts` and its helpers (`damage.ts`, `cardLayout.ts`).

**Player-choice steps go through an `askChoice` callback** rather than throwing or guessing. The UI binds it via `useChoiceModal()` (a promise-resolving modal); tests pass `autoChoice()` for deterministic runs. Existing choice points — weapon-type roll = 8 (gun/melee), element rolls in player-choice bands (gun/melee), shield guild = 16, spell sub-type = 20, spell delivery type = 20, spell damage type in 22–24 — all follow this pattern; any new choice step should extend it rather than route around it.

RNG is a seeded `mulberry32` so a given seed reproduces a weapon. Seeds default to `Math.random()` but `GenerateOptions.seed` lets tests pin them.

### Card rendering (`src/components/`, `src/assets/`)

The card is **PSD-driven**: `extract-psd.mjs --category <gun|melee|shield|spell>` walks every leaf layer of the chosen PSD, writes each as a transparent PNG into `public/psd/<category>/layers/`, and emits a manifest of layer id, bounds, parent path, and a `semantic` tag (e.g. `{kind: 'die', row: 'minor', column: 1, sides: 6}`, `{kind: 'rarityText', rarity: 'Epic'}`, `{kind: 'thresholdTable'}`). Spells ship **two PSDs per category** (AOE vs Missile/Beam) — the extractor accepts `--variant <aoe|missile-beam>` and emits to `public/psd/spell/<variant>/layers/` + `src/generated/spell<Variant>PsdManifest.json`. `WeaponCard.tsx` looks up layers by `kind` via `findByKind(manifestKey, kind)` / `allByKind(manifestKey, kind)` where `ManifestKey = 'gun' | 'melee' | 'shield' | 'spell-aoe' | 'spell-missile-beam'`. Gun and melee share a `DamageWeaponCard` renderer; shield has a dedicated `ShieldCard` (no damage rows; three stat tables — Threshold / Capacity / Regeneration — plus an optional threshold modifier); spell has `SpellCard` which dispatches to `OffensiveSpellCard` (renders dice rows on the manifest picked by `spellManifestKey(deliveryType)`) or `SupportSpellCard` (no dice rows, healing + VP cost + bonus overlays). Dynamic text (name, guild, stats, red text, shield stats, spell MP cost / conditions / healing) sits on top as HTML through `PsdOverlay`, positioned against the PSD's recorded coordinates.

Each PSD's manifest is written **twice** — `public/psd/<category>[/<variant>]/manifest.json` for runtime asset lookup and `src/generated/<key>PsdManifest.json` because Vite does not bundle JSON from `public/`. Don't edit either by hand; re-run the matching `extract-psd:*` script.

If you change a PSD's layer names or grouping, check `deriveSemantic()` in `scripts/extract-psd.mjs` — semantic tagging hard-codes group-name patterns (`Damage Section MINOR/MAJOR/GRAVE`, `Rarities`, `Dice Column N`, `Threshold Table`, `Regen Table`, `Capacity Table`, `Spell_DefaultBox`, etc.) and the leaf order within `Dice_Column1` / `DamageIcons_Column1` groups. The gun, melee, and both spell PSDs share the same damage-card structure (root groups `Gun` / `Melee Weapon` / `Spell` / `Spell`); the shield PSD diverges (root group `Shield`, no damage section or dice columns, adds shield-specific stat tables and a `Spell_DefaultBox` frame whose placeholder "Tier 1 Shield / Guild / Effects" glyphs are masked out during extraction so the live overlay can sit on the underlying gray header bar). The AOE spell PSD ships only a `Damage Section MINOR` group (one flat damage row); the Missile/Beam spell PSD ships all three (Minor/Major/Grave). The extractor also honors `vectorStroke` (inside / center / outside alignment) so PSD-defined strokes — used by the shield card's framed sub-boxes — paint at extract time.

### Asset pipeline (`scripts/optimize-assets.mjs`)

Maps a small set of source filenames to clean slugs and emits responsive WebP variants for weapons (3 widths), single-size WebPs for element icons, and trimmed/inverted PNGs for dice (line art reads better as PNG at small sizes). Slug constants in `src/assets/manifest.ts` must agree with this script's output.

## v1 deviations from the spec

These are intentional and live in code/tables, not in the spec — keep them in sync if you touch the relevant tables:

**Guns**
- **Scout Rifle is dropped.** d8 slot 5 silently re-rolls (`procedure.ts` loop).
- **Launcher's asset slug is `plasma-caster`** because the source PNG depicts a plasma-style gun. The user-facing label and `WeaponType` are still `Launcher`; only the on-disk slug differs.
- **Noctra modules trimmed from 7 to 6** (the unreachable "Deadly Rounds" was removed).
- The `Element` type only includes the 8 elements the gun procedure actually rolls; `Gold`, `Slashing`, `Luminite`, `Kinetic` icons exist as art but are not part of generation.

**Melee**
- **Dagger's asset slug is `dagger`** but the source PNG file is `Kunai.png`. The user-facing label and `MeleeType` are `Dagger` per the spec; only the on-disk source filename differs.

**Shields**
- No source weapon art — the shield card is fully PSD-driven (no `optimize-assets.mjs` slugs to keep in sync).

**Spells**
- No source weapon art — both spell cards are fully PSD-driven.
- The delivery-type roll (rolled mid-procedure) picks which of the two PSD manifests the `SpellCard` renders against — `spellManifestKey(deliveryType)` returns `'spell-missile-beam'` for single-target deliveries and `'spell-aoe'` for the AOE shapes.
- Support spells **always render on the Missile/Beam frame** (its taller statistics table fits the healing/range/VP-cost stack better) even when the delivery is Cube — support deliveries skip damage dice entirely, so the three damage rows simply stay empty.
- The condition slot rolls (Step 7) use independent per-slot percent chances from `CONDITION_SLOT_CHANCE[tier][rarity]`. Re-roll inside each slot up to 32 times to avoid duplicates; if every entry in the 15-row 2d8 table is taken, the slot is silently skipped (only matters when a hypothetical extreme run tries to fill 3 slots with no repeats).
- The 1d100 prefix list for offensive spell names is **identical** to the shared gun/melee prefix list, so `tables/spell/naming.ts` re-exports `PREFIXES`. If the spec ever diverges, replace the re-export with an inline list.

**Mythic rarity is skipped during PSD extraction** for melee, shield, and both spell PSDs. All four PSDs ship a `Mythic Rarity Setting` group, but no spec table ever produces Mythic, so `SKIP_NAMES` in `extract-psd.mjs` drops the group to avoid shipping unused layer PNGs.

## Working in this repo

- Treat the spec (`.md` preferred over `.pdf` for reading) as source of truth. If its rules conflict with the code, the spec wins and the code is the bug.
- **Spec fidelity:** Text content sourced from the spec PDFs — guild passive descriptions, module names and effect text, red-text titles and effects, weapon-type specials, name tables, prefix/suffix lists — must be transcribed **exactly** as written. Do not reword, paraphrase, shorten, normalize capitalization, expand or contract abbreviations, or "fix" grammar/typos. If the spec contains an apparent error, transcribe it as-is and surface the discrepancy to the user rather than silently correcting it. This applies to every cell in every table file under `src/generation/tables/`.
- Preserve odd source filenames as-is: `IC_FIre.png` (sic), `eightgramsoffat0X...NoBackground.png`. The slug maps in `optimize-assets.mjs` depend on them; renaming requires a coordinated edit.
- Asset files in `Lootbreaker_AppResources/` are large binaries — avoid committing edits unless explicitly asked.
- `dist/`, `node_modules/`, and `app/src/generated/{gun,melee,shield,spellAoe,spellMissileBeam}PsdManifest.json` are build outputs; regenerate rather than hand-edit.
