# Lootbreaker — Gun Generator (web)

A web app that runs the Lootbreaker v0.10 gun-generation procedure: tier → weapon type → guild → rarity → element → module → red text → name. Mobile-first, single-roll MVP.

The spec lives at `../Lootbreaker_AppResources/Lootbreaker_GunGeneration_Version0dot10_StepByStep.md` and is the source of truth — the tables under `src/generation/tables/` are transcriptions of it.

## Setup

```sh
npm install
npm run prepare-assets   # generate WebP variants from ../Lootbreaker_AppResources/
npm run extract-psd      # extract every PSD layer to public/psd/layers/ + a manifest
```

- `prepare-assets` reads from `../Lootbreaker_AppResources/{Weapon Art,Icons,Dice}` and writes to `public/{weapons,icons,dice}`.
- `extract-psd` reads `../Lootbreaker_AppResources/Weapon_PSD.psd` (must be **RGB color mode** — convert in Photopea if needed) and writes a transparent PNG per layer plus a JSON manifest of bounds, parent groups, and semantic metadata. The card composes the right layers per rolled weapon.

Re-run either command whenever the underlying source art changes. The card's visual output is driven entirely by the PSD layer set; if you change the PSD, run `extract-psd` and the app picks it up.

## Develop

```sh
npm run dev          # vite dev server with HMR
npm run test         # vitest, run once
npm run test:watch   # vitest, watch mode
npm run build        # type-check + production build to dist/
npm run preview      # preview the production build
```

## Layout

```
src/
├── generation/
│   ├── tables/          # spec tables, one file per step (verbatim)
│   ├── types.ts         # Tier, WeaponType, Rarity, Element, Weapon, ...
│   ├── rng.ts           # mulberry32 PRNG + d/rollN helpers
│   ├── procedure.ts     # generateWeapon(opts, askChoice) — the 7-step walk
│   └── *.test.ts        # vitest specs
├── components/
│   ├── Controls.tsx     # tier radios + red-text toggle + Roll button
│   ├── ChoiceModal.tsx  # promise-resolving modal for player-choice steps
│   ├── WeaponDisplay.tsx# canvas compositor (base art + element icons)
│   └── WeaponStats.tsx  # rarity-tinted stat block
├── assets/
│   └── manifest.ts      # WeaponType → /weapons/<slug>-<width>.webp; Element → /icons/<slug>.webp
├── App.tsx
└── main.tsx
```

## v1 deviations from the spec

- **Scout Rifle is dropped.** d8 slot 5 silently re-rolls.
- **Launcher → Plasma Caster.** Same stats and tables; the label and asset slug differ.
- **Noctra modules** trimmed from 7 to 6 (the unreachable "Deadly Rounds" was removed).

## Adding a player-choice step

`generateWeapon` takes an `askChoice` callback. The UI binds it via `useChoiceModal()` so any future step that needs a player decision becomes a `await askChoice({ title, options })` call inside `procedure.ts`. The two existing choice points (weapon-type roll = 8, element roll = 97-100) follow this pattern.
