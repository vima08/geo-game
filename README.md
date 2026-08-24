# Almaty Trails

A mobile-first, installable geolocation exploration game with two independent five-location adventures in Almaty: **Bostandyk Trails** and **Golden Square Echoes**. Players visit public landmarks, solve small location-specific clues, and complete a separate atlas for each route. There is no backend, account, analytics, or API key.

The interface is available in English and Russian. Russian is selected automatically when the browser language starts with `ru`; the player can switch languages at any time in **Field Kit / Полевой набор**, and the choice persists locally.

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints. Browser geolocation requires a secure context; `localhost` is allowed during development, while phone testing should use HTTPS.

## Production build and preview

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

The output is in `dist/`. To reproduce the GitHub Pages subpath locally, build with `PAGES_BASE=/geo-game/` (PowerShell: `$env:PAGES_BASE='/geo-game/'; npm run build`). The default base is `/` for local/custom-domain builds.

## Developer simulation mode

Add `?dev=true` to the app URL, for example:

```text
http://localhost:5173/?dev=true
```

The magenta banner makes simulated location unmistakable and real GPS is stopped. Open **Developer controls** at the bottom to:

- select any POI;
- place the player 80 m away, inside the radius, or inside with ±120 m accuracy;
- trigger its discovery event directly;
- inspect coordinates, accuracy, selected POI, distance, radius, and source;
- reset all locally stored progress.

Choose an adventure from Field Kit, then choose a target, press **Inside radius** (or **Trigger discovery**), answer its clue, and repeat for all five. Each adventure has independent 0/5 progress and a distinct ending. Exit using Settings → **Exit Simulation Mode**; the normal page reacquires real GPS.

## Verified locations

All activation points are on public pedestrian areas. Players should follow current signs, opening conditions, and safe crossings.

### Bostandyk Trails

1. **Main Botanical Garden — South Entrance** (`43.215431, 76.920564`, 40 m). The entrance coordinate and Bostandyk location are documented in [Wikimedia Commons metadata](https://commons.wikimedia.org/wiki/File:Almaty_Botanical_Garden_entrance.jpg); the garden identity is also recorded by [Wikidata](https://www.wikidata.org/wiki/Q4062764). Activation is at the entrance and does not require paid entry.
2. **Atakent — Main Pavilion** (`43.223061, 76.906389`, 45 m). Coordinates are recorded by [Wikidata](https://www.wikidata.org/wiki/Q22668435), with address information on the [official Atakent site](https://www.akr.kz/contacts.html).
3. **Dostyk Park** (`43.225833, 76.926944`, 45 m). The reconstructed public neighborhood park is described by the [Almaty Regional Communications Service](https://rsk.almaty.kz/ru/news/3461).
4. **Kanysh Satpayev Monument** (`43.236438, 76.928495`, 30 m). The outdoor monument, coordinates, and Bostandyk location are listed by [2GIS](https://2gis.kz/almaty/geo/9430107504508945/tab/reviews).
5. **Independence Monument — Republic Square** (`43.238568, 76.945400`, 40 m). The monument is documented in the [Kazakhstan cultural heritage city guide](https://cultural.kz/slider/images/221-en.pdf), with coordinates corroborated by [2GIS](https://2gis.kz/almaty/directions/points/%7C76.945377%2C43.238598%3B9430107504508932).

First President Park was deliberately not included because reconstruction was announced in August 2026; the prototype avoids directing players toward a possible work zone.

### Golden Square Echoes

The Golden Square is an informal historic neighbourhood whose commonly cited core is bounded by Zheltoksan, Abai, Kunaev and Kabanbay Batyr/Bogenbai Batyr streets. The five points form a compact walk through that core and its boundary streets. No event requires buying a ticket or entering a building.

1. **Lermontov National Drama Theatre** (`43.243180, 76.944080`, 35 m). The theatre identity and OpenStreetMap coordinates are documented by [Mapcarta](https://mapcarta.com/W51267943). Activation is on the public forecourt.
2. **Golovizin House — Street Viewpoint** (`43.244520, 76.948390`, 30 m). The nationally significant Art Nouveau building and coordinates are documented in the [Kazakhstan cultural heritage city guide](https://cultural.kz/slider/images/221-en.pdf). It is currently a state residence, so the game explicitly uses the public sidewalk viewpoint and never asks players to enter.
3. **Abay Opera and Ballet Theatre — Main Square** (`43.248890, 76.945830`, 45 m). Coordinates and municipal ownership are recorded by [DBpedia/Wikidata-derived data](https://dbpedia.org/page/Abay_Opera_House), while the official address is documented by [Visit Almaty](https://visitalmaty.kz/wp-content/themes/visitwp/media/putevoditel_po_Almaty.pdf). Activation is on the open square.
4. **Nedelka Fountain** (`43.249167, 76.943889`, 35 m). The public fountain’s address, history and GPS coordinates are documented by [WildTicket Asia](https://wildticketasia.com/1995-nedelka-fountain-week.html).
5. **Kunaev House Museum — Exterior** (`43.252720, 76.948460`, 35 m). The museum and coordinates are documented by [Mapcarta/OpenStreetMap](https://mapcarta.com/N4832577988) and its address by the [museum excursion reference](https://silkadv.com/en/content/apartment-museum-da-kunaev). Activation is outside; museum opening hours and admission do not affect gameplay.

## GitHub Pages deployment

The included `.github/workflows/deploy-pages.yml` tests, type-checks, builds, and deploys on every push to `main`.

1. Commit and push all files, including `package-lock.json`, to the `main` branch.
2. On GitHub open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push to `main` or run **Deploy to GitHub Pages** manually in Actions.
5. The workflow sets `PAGES_BASE` from the repository name, so a repository named `geo-game` builds for `/geo-game/`. For a different manual hosting subpath, set `PAGES_BASE` to `/your-repository/` before `npm run build`.
6. Open the HTTPS Pages URL on a phone. On iOS use Safari → Share → **Add to Home Screen**. On Android use the browser menu → **Install app** or **Add to Home screen**.

The manifest, icons, service worker registration, and cached app shell use relative/base-aware paths and therefore work beneath a repository subpath.

## Offline, privacy, and browser limitations

- The service worker caches the built app shell. After an initial successful online load, the journal, POIs, simulation, and saved progress remain usable offline.
- OpenStreetMap tiles are network-provided and are not promised offline. Tile failure shows a message without disabling gameplay.
- Browser geolocation is used only while the page is open. Mobile browsers do **not** provide dependable background GPS to a static PWA; reopen the game when approaching a landmark.
- Coordinates and progress remain on the device. The app makes no location uploads and includes no telemetry.
- iOS/Android permission behavior varies. If permission is denied permanently, re-enable it in browser/site settings and use **Retry GPS**.
- GPS accuracy fluctuates near buildings. The game shows reported accuracy but keeps the landmark radius honest rather than silently enlarging it.

## Project structure

- `src/data/pois.ts` — the complete data-driven route, rewards, and events
- `src/geo.ts` — Haversine distance, activation, and distance formatting
- `src/progress.ts` — defensive, versioned-key localStorage persistence
- `src/main.ts` — UI state, geolocation lifecycle, simulation, Leaflet map, gameplay
- `public/sw.js` / `public/manifest.webmanifest` — PWA and offline app shell
- `src/**/*.test.ts` — distance, activation, persistence, and POI validation tests

Map data © OpenStreetMap contributors.
