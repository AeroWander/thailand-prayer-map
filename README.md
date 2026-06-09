# Thailand Campus Crusade for Christ — Campus Prayer Map

A React PWA for Thailand Campus Crusade for Christ, showing university campuses across Thailand on an interactive Leaflet map with province filtering and prayer coverage stats.

## Features

- Interactive map centered on Thailand (OpenStreetMap tiles)
- Campus pins with prayed / not-yet-prayed status
- Province filter dropdown
- Stats bar: total campuses, prayed for, and national goal progress
- 170 Thai universities and higher education institutions with full metadata
- Hardcoded data (no backend yet)
- PWA manifest via `vite-plugin-pwa`

## Data

Institution records include English and Thai names, province, region, type, student population, founding year, coordinates, and website. Source data lives in `scripts/data/` and is compiled into `src/data/campuses.ts`:

```bash
node scripts/generate-campuses.mjs
```

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run preview` — preview production build

## Project structure

```
src/
├── components/     MapView, ProvinceFilter, StatsBar
├── data/           Hardcoded campus list
├── types/          Campus type and national goal constant
└── utils/          Stats and province helpers
```
