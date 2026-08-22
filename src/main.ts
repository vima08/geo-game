import 'leaflet/dist/leaflet.css';
import L, { type Map as LeafletMap } from 'leaflet';
import './style.css';
import { POIS } from './data/pois';
import { distanceMeters, formatDistance, proximityMessage } from './geo';
import { loadProgress, resetProgress, saveProgress } from './progress';
import type { LocationReading, PointOfInterest, Progress } from './types';

type GpsState = 'idle' | 'acquiring' | 'active' | 'denied' | 'unavailable' | 'timeout' | 'unsupported';
const app = document.querySelector<HTMLDivElement>('#app')!;
let progress: Progress = loadProgress();
let reading: LocationReading | null = null;
let gpsState: GpsState = 'idle';
let selectedId = POIS[0].id;
let watchId: number | null = null;
let map: LeafletMap | null = null;
let poiLayer: L.LayerGroup | null = null;
let playerLayer: L.LayerGroup | null = null;
let tileFailures = 0;
let simulation = new URLSearchParams(location.search).get('dev') === 'true';
let eventPoi: PointOfInterest | null = null;
let answeredCorrectly = false;
let showAtlas = false;
let storageWarning = false;
let staleTimer: number | null = null;

const selectedPoi = () => POIS.find((p) => p.id === selectedId)!;
const isDone = (id: string) => progress.discoveredIds.includes(id);
const rewardSymbol = (name: string) => POIS.find((p) => p.reward.name === name)?.reward.symbol ?? '•';

function render(): void {
  const existingMapElement = map?.getContainer() ?? null;
  existingMapElement?.remove();
  const selected = selectedPoi();
  const sorted = [...POIS].sort((a, b) => reading ? distanceMeters(reading, a) - distanceMeters(reading, b) : a.name.localeCompare(b.name));
  const distance = reading ? distanceMeters(reading, selected) : null;
  const complete = progress.discoveredIds.length === POIS.length;
  app.innerHTML = `
    <div class="shell ${simulation ? 'is-simulating' : ''}">
      ${simulation ? '<div class="sim-banner">SIMULATION MODE · REAL GPS OFF</div>' : ''}
      <header class="topbar"><div><div class="eyebrow">FIELD JOURNAL · BOSTANDYK</div><h1>Bostandyk Trails</h1></div><button class="icon-button" id="menu-button" aria-label="Open settings">•••</button></header>
      <section class="progress-wrap" aria-label="Journey progress"><div class="progress-copy"><span>${progress.discoveredIds.length} of 5 secrets found</span><button class="atlas-mini" id="atlas-button">${progress.rewards.map(rewardSymbol).join(' ') || 'Atlas unopened'}</button></div><div class="progress-track"><span style="width:${progress.discoveredIds.length * 20}%"></span></div></section>
      ${storageWarning ? '<div class="storage-warning">Progress cannot be saved on this device. Check browser storage settings.</div>' : ''}${progress.discoveredIds.length === 0 ? '<div class="first-hint">Walk to a numbered marker. Enter its ring to uncover a sigil.</div>' : ''}
      ${complete ? '<button class="ending-strip" id="ending-button">✦ Atlas complete — read the final page</button>' : ''}
      <main>
        <section class="map-frame" aria-label="Map of Bostandyk points of interest"><div id="map"></div><div class="map-top-status">${gpsStatus()}</div><button class="map-action" id="center-button" ${reading ? '' : 'disabled'}>⌖ <span>Center on me</span></button><div class="map-offline" id="map-offline" hidden>Map tiles unavailable. The trail still works.</div></section>
        <section class="quest-panel">
          <div class="panel-heading"><div><div class="eyebrow">${isDone(selected.id) ? 'DISCOVERED' : 'SELECTED TRAIL'}</div><h2>${selected.shortName}</h2></div><div class="distance-badge">${distance === null ? '—' : formatDistance(distance)}</div></div>
          <p class="description">${selected.description}</p><div class="approach ${distance !== null && distance <= selected.activationRadiusMeters ? 'arrived' : ''}">${selectedStatus(selected, distance)}</div>
          <div class="primary-actions">${primaryAction(selected, distance)}</div><button class="list-toggle" id="list-toggle" aria-expanded="false">All five trails <span>⌄</span></button><div class="poi-list" id="poi-list" hidden>${sorted.map(poiCard).join('')}</div>
        </section>
      </main><footer><span>Location stays on this device.</span><span>Stay aware outdoors.</span></footer>
    </div>
    ${!progress.tutorialSeen ? onboardingHtml() : ''}${eventPoi ? eventHtml(eventPoi) : ''}${showAtlas ? atlasHtml() : ''}
    <dialog id="settings-dialog">${settingsHtml()}</dialog>${simulation ? devPanelHtml(selected, distance) : ''}`;
  bindUi();
  if (existingMapElement && map) { document.querySelector('#map')!.replaceWith(existingMapElement); updateMapLayers(); map.invalidateSize(); }
  else initMap();
}

function gpsStatus(): string {
  if (reading && gpsState === 'active' && !isStale()) return `<span class="gps-dot"></span>${reading.source === 'simulated' ? 'Simulated' : 'GPS'} · ±${Math.round(reading.accuracy)} m`;
  if (reading) return `Last fix · ${gpsState === 'active' ? 'position is stale' : gpsStateLabel()}`;
  if (simulation) return 'Simulation ready · choose a position';
  return gpsStateLabel();
}
function gpsStateLabel(): string { const labels: Record<GpsState, string> = { idle: 'GPS not started', acquiring: 'Finding your position…', active: 'GPS active', denied: 'Permission denied · retry in settings', unavailable: 'GPS unavailable · retry', timeout: 'GPS timed out · retry', unsupported: 'Geolocation unsupported' }; return labels[gpsState]; }
function isStale(): boolean { return reading?.source === 'real' && Date.now() - reading.timestamp > 60_000; }
function canUnlock(): boolean { return Boolean(reading && gpsState === 'active' && !isStale()); }
function selectedStatus(poi: PointOfInterest, distance: number | null): string {
  if (isDone(poi.id)) return `<span>✓</span><div><strong>${poi.reward.name} collected</strong><small>Reopen this memory any time.</small></div>`;
  if (distance === null) return simulation ? `<span>⚙</span><div><strong>Choose a simulated position</strong><small>Open Developer controls below to begin.</small></div>` : `<span>⌖</span><div><strong>Turn on location to begin</strong><small>We only read it while the game is open.</small></div>`;
  if (!canUnlock()) return `<span>!</span><div><strong>Location signal lost</strong><small>Your last fix is kept for distance only. Retry GPS before unlocking.</small></div>`;
  if (!isDone(poi.id) && distance <= poi.activationRadiusMeters && reading!.accuracy > poi.activationRadiusMeters) return `<span>≈</span><div><strong>GPS uncertain — stay nearby</strong><small>Accuracy is ±${Math.round(reading!.accuracy)} m. Let the signal settle before unlocking.</small></div>`;
  return `<span>${distance <= poi.activationRadiusMeters ? '✦' : '→'}</span><div><strong>${proximityMessage(distance, poi.activationRadiusMeters)}</strong><small>Discovery radius: ${poi.activationRadiusMeters} m${reading!.accuracy > 50 ? ' · GPS signal is weak' : ''}</small></div>`;
}
function primaryAction(poi: PointOfInterest, distance: number | null): string {
  if (isDone(poi.id)) return '<button class="primary" id="open-event">Open discovered memory</button>';
  if (distance === null) return simulation ? '<button class="primary" id="dev-open">Open developer controls</button>' : `<button class="primary" id="gps-button">${gpsState === 'acquiring' ? 'Finding position…' : 'Enable my location'}</button>`;
  if (!canUnlock()) return '<button class="primary" id="gps-button">Retry location</button>';
  if (distance <= poi.activationRadiusMeters && reading!.accuracy > poi.activationRadiusMeters) return '<button class="primary" disabled>Waiting for a clearer GPS fix…</button>';
  if (distance <= poi.activationRadiusMeters) return '<button class="primary discovery-ready" id="discover-button">Discover this place ✦</button>';
  return '<button class="primary" id="map-focus">Frame me and this place</button>';
}
function poiCard(poi: PointOfInterest): string {
  const distance = reading ? formatDistance(distanceMeters(reading, poi)) : 'GPS needed';
  return `<button class="poi-card ${poi.id === selectedId ? 'selected' : ''}" data-poi="${poi.id}"><span class="poi-symbol">${isDone(poi.id) ? poi.reward.symbol : '?'}</span><span><strong>${poi.shortName}</strong><small>${isDone(poi.id) ? poi.reward.name : distance}</small></span><span class="chevron">›</span></button>`;
}
function onboardingHtml(): string { return `<div class="modal-layer"><section class="onboarding" role="dialog" aria-modal="true"><div class="compass-mark">✦</div><div class="eyebrow">A WALKING ADVENTURE IN ALMATY</div><h2>Five secrets are hidden around Bostandyk.</h2><p>Visit real public places to recover the five sigils of a forgotten city atlas.</p><div class="promise"><span>⌖</span><div><strong>Your location stays private</strong><small>No account. No history upload. Progress is saved only in this browser.</small></div></div><div class="safety">Look up around traffic. Use crossings, stay in public areas, and stop walking before using your phone.</div><button class="primary" id="start-button">Start exploring</button><small class="permission-note">Your browser will ask for location next.</small></section></div>`; }
function eventHtml(poi: PointOfInterest): string {
  const done = progress.completedEventIds.includes(poi.id);
  const complete = progress.discoveredIds.length === POIS.length;
  const next = nextIncomplete();
  return `<div class="modal-layer"><section class="event-card" role="dialog" aria-modal="true"><button class="close" id="close-event" aria-label="Close">×</button><div class="reward-icon">${done || answeredCorrectly ? poi.reward.symbol : '?'}</div><div class="eyebrow">${done ? 'ATLAS MEMORY' : 'YOU REACHED THIS PLACE'}</div><h2>${poi.shortName}</h2>${done || answeredCorrectly ? `<div class="reward-name">${poi.reward.name} collected</div><p>${poi.event.success}</p>${complete ? '<div class="final-message"><strong>Five sigils. One living city.</strong><br>Your recovered atlas is ready to open.</div>' : '<p class="next-hint">A new blank page waits.</p>'}<button class="primary" id="continue-button">${complete ? 'Open completed atlas' : `Next: ${next?.shortName ?? 'choose a trail'}`}</button>` : `<p>${poi.event.prompt}</p><div class="choices">${poi.event.choices.map((c, i) => `<button data-choice="${i}">${c}</button>`).join('')}</div><div id="answer-feedback" role="status"></div>`}</section></div>`;
}
function atlasHtml(): string {
  const complete = progress.discoveredIds.length === POIS.length;
  return `<div class="modal-layer"><section class="event-card atlas-card" role="dialog" aria-modal="true"><button class="close" id="close-atlas" aria-label="Close">×</button><div class="reward-icon">${complete ? '✦' : '⌖'}</div><div class="eyebrow">THE RECOVERED ATLAS · ${progress.discoveredIds.length}/5</div><h2>${complete ? 'Bostandyk, remembered' : 'Your collected sigils'}</h2><p>${complete ? 'Leaf, pattern, friendship, stone, and sky reveal the secret: a city is not its map, but the lives and paths that connect its places.' : 'Each visited place restores one mark. The locked pages are still waiting outdoors.'}</p><div class="atlas-list">${POIS.map(p => `<div class="atlas-entry ${isDone(p.id) ? '' : 'locked'}"><span>${isDone(p.id) ? p.reward.symbol : '·'}</span><div><strong>${isDone(p.id) ? p.reward.name : 'Undiscovered sigil'}</strong><small>${isDone(p.id) ? p.shortName : 'Visit its numbered marker'}</small></div></div>`).join('')}</div><button class="primary" id="atlas-done">${complete ? 'Close the atlas' : 'Continue exploring'}</button></section></div>`;
}
function settingsHtml(): string { return `<div class="dialog-head"><div><div class="eyebrow">FIELD KIT</div><h2>Settings & privacy</h2></div><button id="close-settings" class="close" aria-label="Close">×</button></div><p><strong>Private by design.</strong> Coordinates stay in this browser. There is no account, location upload, analytics, or telemetry. Progress uses local storage.</p><p>GPS is read only while open; browsers do not provide reliable background tracking.</p><button id="retry-gps" class="secondary">Retry GPS</button><a class="secondary link-button" href="${simulation ? location.pathname : `${location.pathname}?dev=true`}">${simulation ? 'Exit Simulation Mode' : 'Open Simulation Mode'}</a><button id="reset-button" class="danger">Reset all progress</button>`; }
function devPanelHtml(selected: PointOfInterest, distance: number | null): string { return `<details class="dev-panel"><summary>Developer controls <span>⌃</span></summary><div class="dev-body"><label>Simulated target<select id="dev-poi">${POIS.map(p => `<option value="${p.id}" ${p.id === selected.id ? 'selected' : ''}>${p.shortName}</option>`).join('')}</select></label><div class="dev-grid"><button data-sim="near">Near (80 m)</button><button data-sim="arrive">Inside radius</button><button data-sim="poor">Poor accuracy</button><button data-sim="discover">Trigger discovery</button></div><dl><dt>Source</dt><dd>simulated</dd><dt>Latitude</dt><dd>${reading?.latitude.toFixed(6) ?? '—'}</dd><dt>Longitude</dt><dd>${reading?.longitude.toFixed(6) ?? '—'}</dd><dt>Accuracy</dt><dd>${reading ? `±${reading.accuracy} m` : '—'}</dd><dt>Selected / distance</dt><dd>${selected.id} / ${distance === null ? '—' : `${distance.toFixed(1)} m`}</dd><dt>Activation radius</dt><dd>${selected.activationRadiusMeters} m</dd></dl><button id="dev-reset" class="danger">Reset progress</button></div></details>`; }

function bindUi(): void {
  document.querySelector('#start-button')?.addEventListener('click', () => { progress.tutorialSeen = true; persistProgress(); render(); startGps(); });
  document.querySelector('#gps-button')?.addEventListener('click', startGps);
  document.querySelector('#dev-open')?.addEventListener('click', () => { const panel = document.querySelector<HTMLDetailsElement>('.dev-panel'); if (panel) panel.open = true; });
  document.querySelector('#center-button')?.addEventListener('click', centerOnReading);
  document.querySelector('#map-focus')?.addEventListener('click', () => focusSelected(true));
  document.querySelector('#discover-button')?.addEventListener('click', () => openEvent(selectedPoi()));
  document.querySelector('#open-event')?.addEventListener('click', () => openEvent(selectedPoi()));
  document.querySelector('#ending-button')?.addEventListener('click', openAtlas);
  document.querySelector('#atlas-button')?.addEventListener('click', openAtlas);
  document.querySelector('#list-toggle')?.addEventListener('click', (e) => { const b = e.currentTarget as HTMLButtonElement; const list = document.querySelector<HTMLElement>('#poi-list')!; list.hidden = !list.hidden; b.setAttribute('aria-expanded', String(!list.hidden)); });
  document.querySelectorAll<HTMLElement>('[data-poi]').forEach(el => el.addEventListener('click', () => { selectedId = el.dataset.poi!; render(); setTimeout(() => { focusSelected(false); document.querySelector('.quest-panel')?.scrollIntoView({ block: 'start' }); }, 0); }));
  const dialog = document.querySelector<HTMLDialogElement>('#settings-dialog')!;
  document.querySelector('#menu-button')?.addEventListener('click', () => dialog.showModal());
  document.querySelector('#close-settings')?.addEventListener('click', () => dialog.close());
  document.querySelector('#retry-gps')?.addEventListener('click', () => { dialog.close(); startGps(); });
  document.querySelector('#reset-button')?.addEventListener('click', () => { if (confirm('Erase all discoveries and restart?')) { resetAll(); dialog.close(); } });
  document.querySelector('#close-event')?.addEventListener('click', closeEvent); document.querySelector('#continue-button')?.addEventListener('click', continueJourney);
  document.querySelector('#close-atlas')?.addEventListener('click', closeAtlas); document.querySelector('#atlas-done')?.addEventListener('click', closeAtlas);
  document.querySelectorAll<HTMLElement>('[data-choice]').forEach(el => el.addEventListener('click', () => answer(Number(el.dataset.choice))));
  document.querySelector('#dev-poi')?.addEventListener('change', e => { selectedId = (e.target as HTMLSelectElement).value; render(); });
  document.querySelectorAll<HTMLElement>('[data-sim]').forEach(el => el.addEventListener('click', () => simulate(el.dataset.sim!)));
  document.querySelector('#dev-reset')?.addEventListener('click', resetAll);
}

function startGps(): void {
  if (simulation) return;
  if (!navigator.geolocation) { gpsState = 'unsupported'; render(); return; }
  stopGps(); gpsState = 'acquiring'; render();
  const options = { enableHighAccuracy: true, timeout: 12_000, maximumAge: 10_000 };
  navigator.geolocation.getCurrentPosition(usePosition, geoError, options);
  watchId = navigator.geolocation.watchPosition(usePosition, geoError, options);
}
function usePosition(position: GeolocationPosition): void {
  const { latitude, longitude, accuracy } = position.coords;
  if (![latitude, longitude, accuracy].every(Number.isFinite)) { gpsState = 'unavailable'; render(); return; }
  reading = { latitude, longitude, accuracy, source: 'real', timestamp: position.timestamp }; gpsState = 'active';
  if (staleTimer !== null) window.clearTimeout(staleTimer);
  staleTimer = window.setTimeout(render, 60_500);
  render();
}
function geoError(error: GeolocationPositionError): void { gpsState = error.code === 1 ? 'denied' : error.code === 3 ? 'timeout' : 'unavailable'; render(); }
function stopGps(): void { if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId); watchId = null; }
function simulate(kind: string): void {
  stopGps(); const poi = selectedPoi(); const meters = kind === 'near' ? 80 : kind === 'poor' ? 20 : 5;
  reading = { latitude: poi.latitude + meters / 111_320, longitude: poi.longitude, accuracy: kind === 'poor' ? 120 : 8, source: 'simulated', timestamp: Date.now() }; gpsState = 'active'; render();
  if (kind === 'discover') openEvent(poi);
}
function openEvent(poi: PointOfInterest): void { eventPoi = poi; answeredCorrectly = progress.completedEventIds.includes(poi.id); render(); }
function closeEvent(): void { eventPoi = null; answeredCorrectly = false; render(); }
function nextIncomplete(): PointOfInterest | undefined { const undone = POIS.filter(p => !isDone(p.id)); return reading ? undone.sort((a, b) => distanceMeters(reading!, a) - distanceMeters(reading!, b))[0] : undone[0]; }
function continueJourney(): void { if (progress.discoveredIds.length === POIS.length) { eventPoi = null; answeredCorrectly = false; showAtlas = true; render(); return; } const next = nextIncomplete(); eventPoi = null; answeredCorrectly = false; if (next) selectedId = next.id; render(); setTimeout(() => focusSelected(false), 0); }
function openAtlas(): void { showAtlas = true; eventPoi = null; render(); }
function closeAtlas(): void { showAtlas = false; render(); }
function answer(index: number): void {
  if (!eventPoi) return;
  if (index !== eventPoi.event.correctChoice) { document.querySelector('#answer-feedback')!.textContent = 'Not quite. Look at the place, then try again.'; return; }
  answeredCorrectly = true; progress.discoveredIds = [...new Set([...progress.discoveredIds, eventPoi.id])]; progress.completedEventIds = [...new Set([...progress.completedEventIds, eventPoi.id])]; progress.rewards = [...new Set([...progress.rewards, eventPoi.reward.name])]; persistProgress(); render();
}
function persistProgress(): void { storageWarning = !saveProgress(progress); }
function resetAll(): void { resetProgress(); progress = loadProgress(); eventPoi = null; answeredCorrectly = false; showAtlas = false; render(); }

function initMap(): void {
  const target = document.querySelector<HTMLElement>('#map'); if (!target) return;
  map?.remove(); map = L.map(target, { zoomControl: false }).setView([43.224, 76.924], 13); L.control.zoom({ position: 'topright' }).addTo(map);
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  tiles.on('tileerror', () => { tileFailures++; if (tileFailures > 2) document.querySelector<HTMLElement>('#map-offline')!.hidden = false; });
  updateMapLayers();
}
function updateMapLayers(): void {
  if (!map) return;
  poiLayer?.remove(); playerLayer?.remove(); poiLayer = L.layerGroup().addTo(map); playerLayer = L.layerGroup().addTo(map);
  POIS.forEach((poi, index) => {
    const done = isDone(poi.id); const selected = poi.id === selectedId;
    const icon = L.divIcon({ className: '', html: `<span class="map-marker ${done ? 'done' : ''} ${selected ? 'selected' : ''}"><span>${done ? poi.reward.symbol : index + 1}</span></span>`, iconSize: [46, 50], iconAnchor: [23, 43] });
    L.marker([poi.latitude, poi.longitude], { icon }).addTo(poiLayer!).on('click', () => { selectedId = poi.id; render(); });
    L.circle([poi.latitude, poi.longitude], { radius: poi.activationRadiusMeters, color: done ? '#28735c' : '#d07b36', fillColor: done ? '#49a881' : '#e9a35d', fillOpacity: selected ? .22 : .08, weight: selected ? 2 : 1 }).addTo(poiLayer!);
  });
  if (reading) { L.circle([reading.latitude, reading.longitude], { radius: reading.accuracy, color: '#2879a6', fillColor: '#56a9d4', fillOpacity: .12, weight: 1 }).addTo(playerLayer); L.circleMarker([reading.latitude, reading.longitude], { radius: 9, color: '#fff', weight: 3, fillColor: reading.source === 'simulated' ? '#b54586' : '#1675a1', fillOpacity: 1 }).addTo(playerLayer); }
}
function centerOnReading(): void { if (map && reading) map.flyTo([reading.latitude, reading.longitude], 16); }
function focusSelected(includeUser: boolean): void { if (!map) return; const p = selectedPoi(); if (includeUser && reading) map.fitBounds(L.latLngBounds([[p.latitude, p.longitude], [reading.latitude, reading.longitude]]).pad(.35), { maxZoom: 16 }); else map.flyTo([p.latitude, p.longitude], 16); }

window.addEventListener('beforeunload', stopGps);
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined));
render(); if (progress.tutorialSeen && !simulation) startGps();
