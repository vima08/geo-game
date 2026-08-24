import 'leaflet/dist/leaflet.css';
import L, { type Map as LeafletMap } from 'leaflet';
import './style.css';
import { POIS } from './data/pois';
import { distanceMeters, formatDistance } from './geo';
import { loadLanguage, poiText, saveLanguage, t, type Language } from './i18n';
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
let language: Language = loadLanguage();
let settingsOpen = false;
let trailListOpen = false;
let devPanelOpen = false;

const selectedPoi = () => POIS.find((p) => p.id === selectedId)!;
const isDone = (id: string) => progress.discoveredIds.includes(id);
const rewardSymbol = (name: string) => POIS.find((p) => p.reward.name === name)?.reward.symbol ?? '•';
const tr = (key: Parameters<typeof t>[1], values?: Record<string, string | number>) => t(language, key, values);
const pt = (poi: PointOfInterest) => poiText(poi, language);

function render(): void {
  const existingMapElement = map?.getContainer() ?? null;
  existingMapElement?.remove();
  const selected = selectedPoi();
  const sorted = [...POIS].sort((a, b) => reading ? distanceMeters(reading, a) - distanceMeters(reading, b) : a.name.localeCompare(b.name));
  const distance = reading ? distanceMeters(reading, selected) : null;
  const complete = progress.discoveredIds.length === POIS.length;
  document.documentElement.lang = language;
  app.innerHTML = `
    <div class="shell ${simulation ? 'is-simulating' : ''}">
      ${simulation ? `<div class="sim-banner">${tr('simulationBanner')}</div>` : ''}
      <header class="topbar"><div><div class="eyebrow">${tr('journal')}</div><h1>${tr('title')}</h1></div><button class="icon-button" id="menu-button" aria-label="${tr('openSettings')}">•••</button></header>
      <section class="progress-wrap" aria-label="${tr('secretsFound', { n: progress.discoveredIds.length })}"><div class="progress-copy"><span>${tr('secretsFound', { n: progress.discoveredIds.length })}</span><button class="atlas-mini" id="atlas-button">${progress.rewards.map(rewardSymbol).join(' ') || tr('atlasUnopened')}</button></div><div class="progress-track"><span style="width:${progress.discoveredIds.length * 20}%"></span></div></section>
      ${storageWarning ? `<div class="storage-warning">${tr('saveError')}</div>` : ''}${progress.discoveredIds.length === 0 ? `<div class="first-hint">${tr('firstHint')}</div>` : ''}
      ${complete ? `<button class="ending-strip" id="ending-button">${tr('atlasComplete')}</button>` : ''}
      <main>
        <section class="map-frame" aria-label="${tr('mapLabel')}"><div id="map"></div><div class="map-top-status">${gpsStatus()}</div><button class="map-action" id="center-button" ${reading ? '' : 'disabled'}>⌖ <span>${tr('center')}</span></button><div class="map-offline" id="map-offline" hidden>${tr('mapOffline')}</div></section>
        <section class="quest-panel">
          <div class="panel-heading"><div><div class="eyebrow">${isDone(selected.id) ? tr('discovered') : tr('selectedTrail')}</div><h2>${pt(selected).shortName}</h2></div><div class="distance-badge">${distance === null ? '—' : formatDistance(distance)}</div></div>
          <p class="description">${pt(selected).description}</p><div class="approach ${distance !== null && distance <= selected.activationRadiusMeters ? 'arrived' : ''}">${selectedStatus(selected, distance)}</div>
          <div class="primary-actions">${primaryAction(selected, distance)}</div><button class="list-toggle" id="list-toggle" aria-expanded="${trailListOpen}">${tr('allTrails')} <span>⌄</span></button><div class="poi-list" id="poi-list" ${trailListOpen ? '' : 'hidden'}>${sorted.map(poiCard).join('')}</div>
        </section>
      </main><footer><span>${tr('privacyFooter')}</span><span>${tr('safetyFooter')}</span></footer>
    </div>
    ${!progress.tutorialSeen ? onboardingHtml() : ''}${eventPoi ? eventHtml(eventPoi) : ''}${showAtlas ? atlasHtml() : ''}
    <dialog id="settings-dialog">${settingsHtml()}</dialog>${simulation ? devPanelHtml(selected, distance) : ''}`;
  bindUi();
  if (existingMapElement && map) { document.querySelector('#map')!.replaceWith(existingMapElement); updateMapLayers(); map.invalidateSize(); }
  else initMap();
  const dialog = document.querySelector<HTMLDialogElement>('#settings-dialog');
  if (settingsOpen && dialog && !dialog.open) dialog.showModal();
}

function gpsStatus(): string {
  if (reading && gpsState === 'active' && !isStale()) return `<span class="gps-dot"></span>${reading.source === 'simulated' ? tr('simulated') : 'GPS'} · ±${Math.round(reading.accuracy)} m`;
  if (reading) return `${tr('lastFix')} · ${gpsState === 'active' ? tr('stale') : gpsStateLabel()}`;
  if (simulation) return tr('simulationReady');
  return gpsStateLabel();
}
function gpsStateLabel(): string { const labels: Record<GpsState, Parameters<typeof t>[1]> = { idle: 'gpsNotStarted', acquiring: 'finding', active: 'gpsActive', denied: 'permissionDenied', unavailable: 'gpsUnavailable', timeout: 'gpsTimeout', unsupported: 'gpsUnsupported' }; return tr(labels[gpsState]); }
function isStale(): boolean { return reading?.source === 'real' && Date.now() - reading.timestamp > 60_000; }
function canUnlock(): boolean { return Boolean(reading && gpsState === 'active' && !isStale()); }
function proximity(distance: number, radius: number): string { if (distance <= radius) return tr('arrived'); if (distance <= Math.max(radius * 2, 100)) return tr('almost', { distance: formatDistance(distance) }); return tr('away', { distance: formatDistance(distance) }); }
function selectedStatus(poi: PointOfInterest, distance: number | null): string {
  if (isDone(poi.id)) return `<span>✓</span><div><strong>${pt(poi).reward} ${tr('collected')}</strong><small>${tr('reopen')}</small></div>`;
  if (distance === null) return simulation ? `<span>⚙</span><div><strong>${tr('chooseSim')}</strong><small>${tr('openDevBelow')}</small></div>` : `<span>⌖</span><div><strong>${tr('turnOn')}</strong><small>${tr('locationWhileOpen')}</small></div>`;
  if (!canUnlock()) return `<span>!</span><div><strong>${tr('signalLost')}</strong><small>${tr('lastFixDistance')}</small></div>`;
  if (distance <= poi.activationRadiusMeters && reading!.accuracy > poi.activationRadiusMeters) return `<span>≈</span><div><strong>${tr('gpsUncertain')}</strong><small>${tr('settle', { n: Math.round(reading!.accuracy) })}</small></div>`;
  return `<span>${distance <= poi.activationRadiusMeters ? '✦' : '→'}</span><div><strong>${proximity(distance, poi.activationRadiusMeters)}</strong><small>${tr('radius', { n: poi.activationRadiusMeters })}${reading!.accuracy > 50 ? tr('weak') : ''}</small></div>`;
}
function primaryAction(poi: PointOfInterest, distance: number | null): string {
  if (isDone(poi.id)) return `<button class="primary" id="open-event">${tr('openMemory')}</button>`;
  if (distance === null) return simulation ? `<button class="primary" id="dev-open">${tr('openDev')}</button>` : `<button class="primary" id="gps-button">${gpsState === 'acquiring' ? tr('finding') : tr('enableLocation')}</button>`;
  if (!canUnlock()) return `<button class="primary" id="gps-button">${tr('retryLocation')}</button>`;
  if (distance <= poi.activationRadiusMeters && reading!.accuracy > poi.activationRadiusMeters) return `<button class="primary" disabled>${tr('waitingGps')}</button>`;
  if (distance <= poi.activationRadiusMeters) return `<button class="primary discovery-ready" id="discover-button">${tr('discoverPlace')}</button>`;
  return `<button class="primary" id="map-focus">${tr('frame')}</button>`;
}
function poiCard(poi: PointOfInterest): string {
  const distance = reading ? formatDistance(distanceMeters(reading, poi)) : tr('gpsNeeded');
  return `<button class="poi-card ${poi.id === selectedId ? 'selected' : ''}" data-poi="${poi.id}"><span class="poi-symbol">${isDone(poi.id) ? poi.reward.symbol : '?'}</span><span><strong>${pt(poi).shortName}</strong><small>${isDone(poi.id) ? pt(poi).reward : distance}</small></span><span class="chevron">›</span></button>`;
}
function onboardingHtml(): string { return `<div class="modal-layer"><section class="onboarding" role="dialog" aria-modal="true"><div class="compass-mark">✦</div><div class="eyebrow">${tr('onboardingEyebrow')}</div><h2>${tr('onboardingTitle')}</h2><p>${tr('onboardingBody')}</p><div class="promise"><span>⌖</span><div><strong>${tr('privateTitle')}</strong><small>${tr('privateBody')}</small></div></div><div class="safety">${tr('safety')}</div><button class="primary" id="start-button">${tr('start')}</button><small class="permission-note">${tr('permissionNext')}</small></section></div>`; }
function eventHtml(poi: PointOfInterest): string {
  const done = progress.completedEventIds.includes(poi.id);
  const complete = progress.discoveredIds.length === POIS.length;
  const next = nextIncomplete();
  const copy = pt(poi);
  return `<div class="modal-layer"><section class="event-card" role="dialog" aria-modal="true"><button class="close" id="close-event" aria-label="${tr('close')}">×</button><div class="reward-icon">${done || answeredCorrectly ? poi.reward.symbol : '?'}</div><div class="eyebrow">${done ? tr('memory') : tr('reached')}</div><h2>${copy.shortName}</h2>${done || answeredCorrectly ? `<div class="reward-name">${copy.reward} ${tr('collected')}</div><p>${copy.success}</p>${complete ? `<div class="final-message"><strong>${tr('fiveSigils')}</strong><br>${tr('atlasReady')}</div>` : `<p class="next-hint">${tr('blankPage')}</p>`}<button class="primary" id="continue-button">${complete ? tr('openCompleted') : tr('next', { name: next ? pt(next).shortName : tr('allTrails') })}</button>` : `<p>${copy.prompt}</p><div class="choices">${copy.choices.map((c, i) => `<button data-choice="${i}">${c}</button>`).join('')}</div><div id="answer-feedback" role="status"></div>`}</section></div>`;
}
function atlasHtml(): string {
  const complete = progress.discoveredIds.length === POIS.length;
  return `<div class="modal-layer"><section class="event-card atlas-card" role="dialog" aria-modal="true"><button class="close" id="close-atlas" aria-label="${tr('close')}">×</button><div class="reward-icon">${complete ? '✦' : '⌖'}</div><div class="eyebrow">${tr('recoveredAtlas')} · ${progress.discoveredIds.length}/5</div><h2>${complete ? tr('remembered') : tr('collectedSigils')}</h2><p>${complete ? tr('ending') : tr('atlasPartial')}</p><div class="atlas-list">${POIS.map(p => `<div class="atlas-entry ${isDone(p.id) ? '' : 'locked'}"><span>${isDone(p.id) ? p.reward.symbol : '·'}</span><div><strong>${isDone(p.id) ? pt(p).reward : tr('undiscoveredSigil')}</strong><small>${isDone(p.id) ? pt(p).shortName : tr('visitMarker')}</small></div></div>`).join('')}</div><button class="primary" id="atlas-done">${complete ? tr('closeAtlas') : tr('continueExploring')}</button></section></div>`;
}
function settingsHtml(): string { return `<div class="dialog-head"><div><div class="eyebrow">${tr('fieldKit')}</div><h2>${tr('settingsPrivacy')}</h2></div><button id="close-settings" class="close" aria-label="${tr('close')}">×</button></div><p><strong>${tr('privateDesign')}</strong> ${tr('privacyLong')}</p><p>${tr('backgroundGps')}</p><div class="language-setting"><span>${tr('language')}</span><div><button data-lang="ru" class="${language === 'ru' ? 'active' : ''}">Русский</button><button data-lang="en" class="${language === 'en' ? 'active' : ''}">English</button></div></div><button id="retry-gps" class="secondary">${tr('retryGps')}</button><a class="secondary link-button" href="${simulation ? location.pathname : `${location.pathname}?dev=true`}">${simulation ? tr('exitSimulation') : tr('openSimulation')}</a><button id="reset-button" class="danger">${tr('resetAll')}</button>`; }
function devPanelHtml(selected: PointOfInterest, distance: number | null): string { return `<details class="dev-panel" ${devPanelOpen ? 'open' : ''}><summary>${tr('devControls')} <span>⌃</span></summary><div class="dev-body"><label>${tr('simulatedTarget')}<select id="dev-poi">${POIS.map(p => `<option value="${p.id}" ${p.id === selected.id ? 'selected' : ''}>${pt(p).shortName}</option>`).join('')}</select></label><div class="dev-grid"><button data-sim="near">${tr('near')}</button><button data-sim="arrive">${tr('inside')}</button><button data-sim="poor">${tr('poor')}</button><button data-sim="discover">${tr('trigger')}</button></div><dl><dt>${tr('source')}</dt><dd>${tr('simulated').toLowerCase()}</dd><dt>Latitude</dt><dd>${reading?.latitude.toFixed(6) ?? '—'}</dd><dt>Longitude</dt><dd>${reading?.longitude.toFixed(6) ?? '—'}</dd><dt>${tr('accuracy')}</dt><dd>${reading ? `±${reading.accuracy} m` : '—'}</dd><dt>${tr('selectedDistance')}</dt><dd>${selected.id} / ${distance === null ? '—' : `${distance.toFixed(1)} m`}</dd><dt>${tr('activationRadius')}</dt><dd>${selected.activationRadiusMeters} m</dd></dl><button id="dev-reset" class="danger">${tr('resetProgress')}</button></div></details>`; }

function bindUi(): void {
  document.querySelector('#start-button')?.addEventListener('click', () => { progress.tutorialSeen = true; persistProgress(); render(); startGps(); });
  document.querySelector('#gps-button')?.addEventListener('click', startGps);
  document.querySelector('#dev-open')?.addEventListener('click', () => { const panel = document.querySelector<HTMLDetailsElement>('.dev-panel'); if (panel) { devPanelOpen = true; panel.open = true; } });
  document.querySelector('#center-button')?.addEventListener('click', centerOnReading);
  document.querySelector('#map-focus')?.addEventListener('click', () => focusSelected(true));
  document.querySelector('#discover-button')?.addEventListener('click', () => openEvent(selectedPoi()));
  document.querySelector('#open-event')?.addEventListener('click', () => openEvent(selectedPoi()));
  document.querySelector('#ending-button')?.addEventListener('click', openAtlas);
  document.querySelector('#atlas-button')?.addEventListener('click', openAtlas);
  document.querySelector('#list-toggle')?.addEventListener('click', (e) => { const b = e.currentTarget as HTMLButtonElement; const list = document.querySelector<HTMLElement>('#poi-list')!; trailListOpen = !trailListOpen; list.hidden = !trailListOpen; b.setAttribute('aria-expanded', String(trailListOpen)); });
  document.querySelectorAll<HTMLElement>('[data-poi]').forEach(el => el.addEventListener('click', () => { selectedId = el.dataset.poi!; trailListOpen = false; render(); setTimeout(() => { focusSelected(false); document.querySelector('.quest-panel')?.scrollIntoView({ block: 'start' }); }, 0); }));
  const dialog = document.querySelector<HTMLDialogElement>('#settings-dialog')!;
  document.querySelector('#menu-button')?.addEventListener('click', () => { settingsOpen = true; dialog.showModal(); });
  document.querySelector('#close-settings')?.addEventListener('click', () => { settingsOpen = false; dialog.close(); });
  dialog.addEventListener('close', () => { settingsOpen = false; });
  document.querySelector('#retry-gps')?.addEventListener('click', () => { settingsOpen = false; dialog.close(); startGps(); });
  document.querySelector('#reset-button')?.addEventListener('click', () => { if (confirm(tr('resetConfirm'))) { settingsOpen = false; resetAll(); dialog.close(); } });
  document.querySelectorAll<HTMLElement>('[data-lang]').forEach(el => el.addEventListener('click', () => { language = el.dataset.lang as Language; saveLanguage(language); settingsOpen = true; render(); }));
  document.querySelector('#close-event')?.addEventListener('click', closeEvent); document.querySelector('#continue-button')?.addEventListener('click', continueJourney);
  document.querySelector('#close-atlas')?.addEventListener('click', closeAtlas); document.querySelector('#atlas-done')?.addEventListener('click', closeAtlas);
  document.querySelectorAll<HTMLElement>('[data-choice]').forEach(el => el.addEventListener('click', () => answer(Number(el.dataset.choice))));
  document.querySelector('#dev-poi')?.addEventListener('change', e => { selectedId = (e.target as HTMLSelectElement).value; render(); });
  document.querySelectorAll<HTMLElement>('[data-sim]').forEach(el => el.addEventListener('click', () => simulate(el.dataset.sim!)));
  document.querySelector('#dev-reset')?.addEventListener('click', resetAll);
  document.querySelector<HTMLDetailsElement>('.dev-panel')?.addEventListener('toggle', e => { devPanelOpen = (e.currentTarget as HTMLDetailsElement).open; });
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
  if (index !== eventPoi.event.correctChoice) { document.querySelector('#answer-feedback')!.textContent = tr('wrong'); return; }
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
