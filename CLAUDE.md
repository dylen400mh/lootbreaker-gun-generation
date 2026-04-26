# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

Two top-level pieces:

- `Lootbreaker_AppResources/` — the **authoritative spec** (`Lootbreaker_GunGeneration_Version0dot10_StepByStep.md`, with the original `.pdf` alongside it), `Weapon_PSD.psd` template, and source art (`Weapon Art/`, `Icons/`, `Dice/`).
- `app/` — Vite + React 19 + TypeScript web app that runs the v0.10 procedure. **All commands below run from `app/`.**

Nothing is committed yet — `main` has no commits and the entire tree is untracked. The remote is `git@github.com:dylen400mh/lootbreaker-gun-generation.git`.

## Common commands (all run from `app/`)

```sh
npm install
npm run prepare-assets   # WebP variants of Weapon Art / Icons / Dice → public/{weapons,icons,dice}
npm run extract-psd      # per-layer PNGs + manifest from Weapon_PSD.psd → public/psd/ + src/generated/psdManifest.json
npm run dev              # vite dev server (HMR)
npm run build            # tsc -b && vite build
npm run test             # vitest, single run
npm run test:watch
npm run lint             # eslint
npm run inspect-psd      # debug-print the PSD layer tree
```

A single test file: `npx vitest run src/generation/procedure.test.ts` (add `-t "name"` to filter by test name).

`prepare-assets` and `extract-psd` both read from `../Lootbreaker_AppResources/`; re-run them whenever the source art or PSD changes. **`extract-psd` requires the PSD to be in RGB color mode** — if `ag-psd` errors, open the PSD in Photopea and convert before retrying.

## Architecture

### Generation pipeline (`src/generation/`)

`procedure.ts → generateWeapon(opts, askChoice)` is a direct, ordered transcription of the spec's 7 steps: weapon type (1d8) → guild (1d12) → rarity (2d6 cross-table) → element (d100 banded by rarity) → module (chance% then 1d6) → red text (toggle, d100) → name. The `tables/` files are verbatim spec data — when the spec changes, those files change; logic lives only in `procedure.ts` and its helpers (`damage.ts`, `cardLayout.ts`).

**Player-choice steps go through an `askChoice` callback** rather than throwing or guessing. The UI binds it via `useChoiceModal()` (a promise-resolving modal); tests pass `autoChoice()` for deterministic runs. Two existing choice points (weapon-type roll = 8, element rolls in player-choice bands) follow this pattern — any new choice step should extend it rather than route around it.

RNG is a seeded `mulberry32` so a given seed reproduces a weapon. Seeds default to `Math.random()` but `GenerateOptions.seed` lets tests pin them.

### Card rendering (`src/components/`, `src/assets/`)

The card is **PSD-driven**: `extract-psd.mjs` walks every leaf layer of `Weapon_PSD.psd`, writes each as a transparent PNG, and emits a manifest of layer id, bounds, parent path, and a `semantic` tag (e.g. `{kind: 'die', row: 'minor', column: 1, sides: 6}`, `{kind: 'rarityText', rarity: 'Epic'}`). `WeaponCard.tsx` looks up layers by `kind` via `findByKind`/`allByKind` and toggles which to render based on the rolled weapon. Dynamic text (name, guild, stats, red text) sits on top as HTML through `PsdOverlay`, positioned against the PSD's recorded coordinates.

The manifest is written **twice** — `public/psd/manifest.json` for runtime asset lookup and `src/generated/psdManifest.json` because Vite does not bundle JSON from `public/`. Don't edit either by hand; re-run `extract-psd`.

If you change the PSD's layer names or grouping, check `deriveSemantic()` in `scripts/extract-psd.mjs` — semantic tagging hard-codes group-name patterns (`Damage Section MINOR/MAJOR/GRAVE`, `Rarities`, `Dice Column N`, etc.) and the leaf order within `Dice_Column1` / `DamageIcons_Column1` groups.

### Asset pipeline (`scripts/optimize-assets.mjs`)

Maps a small set of source filenames to clean slugs and emits responsive WebP variants for weapons (3 widths), single-size WebPs for element icons, and trimmed/inverted PNGs for dice (line art reads better as PNG at small sizes). Slug constants in `src/assets/manifest.ts` must agree with this script's output.

## v1 deviations from the spec

These are intentional and live in code/tables, not in the spec — keep them in sync if you touch the relevant tables:

- **Scout Rifle is dropped.** d8 slot 5 silently re-rolls (`procedure.ts` loop).
- **Launcher → Plasma Caster.** Same stats and tables; only label and asset slug differ.
- **Noctra modules trimmed from 7 to 6** (the unreachable "Deadly Rounds" was removed).
- The `Element` type only includes the 8 elements the gun procedure actually rolls; `Gold`, `Slashing`, `Luminite`, `Kinetic` icons exist as art but are not part of generation.

## Working in this repo

- Treat the spec (`.md` preferred over `.pdf` for reading) as source of truth. If its rules conflict with the code, the spec wins and the code is the bug.
- Preserve odd source filenames as-is: `IC_FIre.png` (sic), `eightgramsoffat0X...NoBackground.png`. The slug maps in `optimize-assets.mjs` depend on them; renaming requires a coordinated edit.
- Asset files in `Lootbreaker_AppResources/` are large binaries — avoid committing edits unless explicitly asked.
- `dist/`, `node_modules/`, and `app/src/generated/psdManifest.json` are build outputs; regenerate rather than hand-edit.
