# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

Two top-level pieces:

- `Lootbreaker_AppResources/` — the **authoritative specs**:
  - Guns: `Lootbreaker_GunGeneration_Version0dot10_StepByStep.md` (`.pdf` alongside), `Weapon_PSD.psd` template, source art (`Weapon Art/`, `Icons/`, `Dice/`).
  - Melee: `Melee Weapon Assets/Lootbreaker_MeleeWeaponGeneration_Version0dot10.pdf`, `Melee_Weapon_Card_Root.psd` template, and the 6 melee weapon PNGs in the same folder.
  - Shields: `Shield Assets/Shield_Generation_V_0dot10.pdf` (`.odt` alongside) and `Shield_Base.psd` template. No raw weapon art — the shield card is fully PSD-driven.
- `app/` — Vite + React 19 + TypeScript web app that runs all three v0.10 procedures and lets the user switch between them via the category tabs. **All commands below run from `app/`.**

## Common commands (all run from `app/`)

```sh
npm install
npm run prepare-assets       # WebP variants of all weapon art / Icons / Dice → public/{weapons,icons,dice}
npm run extract-psd          # extracts ALL THREE PSDs (gun → melee → shield); aliases for extract-psd:{gun,melee,shield}
npm run extract-psd:gun      # Weapon_PSD.psd → public/psd/gun/ + src/generated/gunPsdManifest.json
npm run extract-psd:melee    # Melee_Weapon_Card_Root.psd → public/psd/melee/ + src/generated/meleePsdManifest.json
npm run extract-psd:shield   # Shield_Base.psd → public/psd/shield/ + src/generated/shieldPsdManifest.json
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

`procedure.ts → generateWeapon(opts, askChoice)` is a direct, ordered transcription of each spec's 7 steps. `opts.category` (`'gun' | 'melee' | 'shield'`) dispatches the per-category table set and procedure. **Gun and melee share the same overall shape** (damage card with elements, modules, red text); **shield is structurally different** (no damage dice, no elements, no modules, no red text) and gets its own 7-step flow.

- Step 1: **Guns** roll Weapon Type on 1d8 (slot 5 silently re-rolls, slot 8 = Player Choice); **melee** rolls Weapon Type on 2d4 (sum 8 = Player Choice); **shields** skip weapon-type entirely and roll Guild on 2d8 (sum 16 = Player Choice).
- Steps 2–6: gun/melee share shape (rarity → elements → module chance → guild → red text); shield runs (rarity → capacity → regeneration → guild passive → threshold modifier). Shared tables live under `tables/shared/` (rarity, naming pieces); per-category tables under `tables/{gun,melee,shield}/` (guilds plus category-specific tables: modules + red text for gun/melee; capacity, regeneration, thresholds, thresholdModifier for shield).
- Step 7 (Name): **guns** produce `Prefix ABBR-### Suffix`; **melee** does a coin flip between prefix and suffix joined with a per-type base name (Stiletto, Maul, Glaive, …); **shields** roll 1d100 to pick prefix vs suffix and join it with a 1d10 base name (Aegis, Bulwark, …), optionally appending a 1–3 digit numeric suffix when the UI's `shieldDigits` toggle is on.

`Weapon` is a discriminated union `GunWeapon | MeleeWeapon | ShieldWeapon` keyed on `category` (`types.ts`). Gun and melee share a `DamageWeaponCommon` interface; shield does not. `GuildName = DamageGuildName | ShieldOnlyGuildName` — the 12 d12 damage guilds are shared by gun/melee; `Fortis` and `Ressurecta` are shield-only, gated to the shield tab in the UI.

The `tables/` files are verbatim spec data — when a spec changes, those files change; logic lives only in `procedure.ts` and its helpers (`damage.ts`, `cardLayout.ts`).

**Player-choice steps go through an `askChoice` callback** rather than throwing or guessing. The UI binds it via `useChoiceModal()` (a promise-resolving modal); tests pass `autoChoice()` for deterministic runs. Two existing choice points (weapon-type roll = 8, element rolls in player-choice bands) follow this pattern — any new choice step should extend it rather than route around it.

RNG is a seeded `mulberry32` so a given seed reproduces a weapon. Seeds default to `Math.random()` but `GenerateOptions.seed` lets tests pin them.

### Card rendering (`src/components/`, `src/assets/`)

The card is **PSD-driven**: `extract-psd.mjs --category <gun|melee|shield>` walks every leaf layer of the chosen PSD, writes each as a transparent PNG into `public/psd/<category>/layers/`, and emits a manifest of layer id, bounds, parent path, and a `semantic` tag (e.g. `{kind: 'die', row: 'minor', column: 1, sides: 6}`, `{kind: 'rarityText', rarity: 'Epic'}`, `{kind: 'thresholdTable'}`). `WeaponCard.tsx` looks up layers by `kind` via `findByKind(category, kind)` / `allByKind(category, kind)` and toggles which to render. Gun and melee share a `GunMeleeCard` renderer; shield has a dedicated `ShieldCard` renderer (no damage rows; three stat tables — Threshold / Capacity / Regeneration — plus an optional threshold modifier). Dynamic text (name, guild, stats, red text, shield stats) sits on top as HTML through `PsdOverlay`, positioned against the PSD's recorded coordinates.

Each PSD's manifest is written **twice** — `public/psd/<category>/manifest.json` for runtime asset lookup and `src/generated/<category>PsdManifest.json` because Vite does not bundle JSON from `public/`. Don't edit either by hand; re-run the matching `extract-psd:*` script.

If you change a PSD's layer names or grouping, check `deriveSemantic()` in `scripts/extract-psd.mjs` — semantic tagging hard-codes group-name patterns (`Damage Section MINOR/MAJOR/GRAVE`, `Rarities`, `Dice Column N`, `Threshold Table`, `Regen Table`, `Capacity Table`, `Spell_DefaultBox`, etc.) and the leaf order within `Dice_Column1` / `DamageIcons_Column1` groups. The gun and melee PSDs share the same structure (root groups `Gun` vs `Melee Weapon`); the shield PSD diverges (root group `Shield`, no damage section or dice columns, adds shield-specific stat tables and a `Spell_DefaultBox` frame whose placeholder "Tier 1 Shield / Guild / Effects" glyphs are masked out during extraction so the live overlay can sit on the underlying gray header bar). The extractor also honors `vectorStroke` (inside / center / outside alignment) so PSD-defined strokes — used by the shield card's framed sub-boxes — paint at extract time.

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

**Mythic rarity is skipped during PSD extraction** for both melee and shield. Both PSDs ship a `Mythic Rarity Setting` group, but no spec table ever produces Mythic, so `SKIP_NAMES` in `extract-psd.mjs` drops the group to avoid shipping unused layer PNGs.

## Working in this repo

- Treat the spec (`.md` preferred over `.pdf` for reading) as source of truth. If its rules conflict with the code, the spec wins and the code is the bug.
- **Spec fidelity:** Text content sourced from the spec PDFs — guild passive descriptions, module names and effect text, red-text titles and effects, weapon-type specials, name tables, prefix/suffix lists — must be transcribed **exactly** as written. Do not reword, paraphrase, shorten, normalize capitalization, expand or contract abbreviations, or "fix" grammar/typos. If the spec contains an apparent error, transcribe it as-is and surface the discrepancy to the user rather than silently correcting it. This applies to every cell in every table file under `src/generation/tables/`.
- Preserve odd source filenames as-is: `IC_FIre.png` (sic), `eightgramsoffat0X...NoBackground.png`. The slug maps in `optimize-assets.mjs` depend on them; renaming requires a coordinated edit.
- Asset files in `Lootbreaker_AppResources/` are large binaries — avoid committing edits unless explicitly asked.
- `dist/`, `node_modules/`, and `app/src/generated/{gun,melee,shield}PsdManifest.json` are build outputs; regenerate rather than hand-edit.
