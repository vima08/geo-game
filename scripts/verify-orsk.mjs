import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

// Run after a production build. Chrome must be installed, or set BROWSER_PATH.
const base = process.env.PAGES_BASE || '/';
const server = await preview({ configFile: false, base, preview: { host: '127.0.0.1', port: 4175, strictPort: true } });
const url = `http://127.0.0.1:4175${base}`;
const screenshots = '.gauntlet/screenshots';
await mkdir(screenshots, { recursive: true });
let browser;
const errors = [];
const key = 'bostandyk-trails-progress-v1';
const route = [
  ['orsk-shevchenko-garden', 1], ['orsk-pushkin-monument', 2],
  ['orsk-khmelnitsky-square', 0], ['orsk-old-town-museum', 1], ['orsk-kirilov-monument', 0],
];

try {
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : { channel: 'chrome' }) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ru-RU', isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    window.gpsCalls = 0;
    for (const method of ['getCurrentPosition', 'watchPosition']) {
      const original = navigator.geolocation[method].bind(navigator.geolocation);
      navigator.geolocation[method] = (...args) => { window.gpsCalls++; return original(...args); };
    }
  });
  const page = await context.newPage();
  let checkingOnline = true;
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (checkingOnline && msg.type() === 'error') errors.push(msg.text()); });
  const snap = name => page.screenshot({ path: `${screenshots}/orsk-${name}.png`, fullPage: true, animations: 'disabled' });
  const textIncludes = async (selector, text) => assert.ok((await page.locator(selector).innerText()).includes(text), `${selector} should contain ${text}`);
  const devOpen = async open => {
    if (await page.locator('.dev-panel').evaluate(el => el.open) !== open) {
      await page.locator('.dev-panel summary').click();
      // Native details emits toggle asynchronously; let its state handler run.
      await page.waitForTimeout(100);
    }
  };
  await page.goto(`${url}?dev=true`, { waitUntil: 'networkidle' });
  await snap('01-onboarding');
  await page.locator('#start-button').click();
  assert.equal(await page.evaluate(() => window.gpsCalls), 0, 'simulation must never start real GPS');

  // An existing player's exact old storage shape, with one discovery per Almaty route.
  await page.evaluate(storageKey => {
    localStorage.setItem(storageKey, JSON.stringify({ discoveredIds: ['botanical-garden', 'gold-lermontov-theatre'], completedEventIds: ['botanical-garden', 'gold-lermontov-theatre'], rewards: ['Leaf Sigil', 'Word Sigil'], tutorialSeen: true }));
    localStorage.setItem('almaty-trails-active-adventure-v1', 'golden-square');
  }, key);
  await page.reload({ waitUntil: 'networkidle' });
  await textIncludes('.progress-copy', '1 из 5');
  await page.locator('#route-button').click();
  assert.equal(await page.locator('[data-adventure]').count(), 3);
  await page.locator('[data-adventure="orsk-old-town"]').click();
  assert.ok(await page.locator('#settings-dialog').evaluate(el => el.open));
  await snap('02-route-choice');
  await page.locator('#close-settings').click();
  await textIncludes('h1', 'Тайны Старого Орска');
  await textIncludes('.topbar .eyebrow', 'ОРСКА');
  await textIncludes('.progress-copy', '0 из 5');
  assert.equal(await page.locator('.map-marker').count(), 5);
  assert.equal(await page.locator('#dev-poi option').count(), 5);
  assert.equal(await page.locator('.map-frame').getAttribute('aria-label'), 'Карта приключения: Тайны Старого Орска');
  await snap('03-main');
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Russian overflow at ${width}px`);
    const menu = await page.locator('#menu-button').boundingBox();
    assert.ok(menu.width >= 44 && menu.height >= 44, `menu touch target at ${width}px`);
    const zoom = await page.locator('.leaflet-control-zoom').boundingBox();
    for (const marker of await page.locator('.map-marker').all()) {
      const pin = await marker.boundingBox();
      assert.ok(pin.x + pin.width <= zoom.x || pin.x >= zoom.x + zoom.width || pin.y + pin.height <= zoom.y || pin.y >= zoom.y + zoom.height, `map controls cover a pin at ${width}px`);
    }
    await snap(`03-main-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });

  await devOpen(true);
  await page.locator('[data-sim="near"]').click();
  await devOpen(false);
  await textIncludes('.approach', 'Почти на месте');
  assert.equal(await page.locator('#discover-button').count(), 0);
  await snap('04-approaching');
  await devOpen(true);
  await page.locator('[data-sim="poor"]').click();
  await snap('05-developer');
  await devOpen(false);
  await textIncludes('.approach', 'Неточный GPS');
  assert.ok(await page.locator('.primary-actions button').isDisabled());

  for (let i = 0; i < route.length; i++) {
    const [id, answer] = route[i];
    await devOpen(true);
    await page.locator('#dev-poi').selectOption(id);
    await page.locator('[data-sim="arrive"]').click();
    await devOpen(false);
    await page.locator('#discover-button').click();
    if (i === 0) {
      await snap('06-riddle');
      await page.locator('[data-choice="0"]').click();
      await textIncludes('#answer-feedback', 'Не совсем');
      await textIncludes('.progress-copy', '0 из 5');
    }
    await page.locator(`[data-choice="${answer}"]`).click();
    await textIncludes('.progress-copy', `${i + 1} из 5`);
    if (i === 0) await snap('07-discovery');
    await page.locator('#continue-button').click();
  }
  await textIncludes('.atlas-card h2', 'Старый Орск, прочитанный заново');
  assert.equal(await page.locator('.atlas-entry:not(.locked)').count(), 5);
  await snap('08-completed-atlas');
  await page.locator('#atlas-done').click();
  await page.locator('#list-toggle').click();
  await snap('09-all-points');
  await page.locator('[data-poi="orsk-kirilov-monument"]').click();
  await page.locator('#open-event').click();
  await textIncludes('.reward-name', 'Символ Горизонта');
  await page.locator('#close-event').click();

  await page.locator('#route-button').click();
  for (const id of ['bostandyk', 'golden-square']) {
    await page.locator(`[data-adventure="${id}"]`).click();
    await textIncludes('.progress-copy', '1 из 5');
    assert.equal(await page.locator('.map-marker').count(), 5);
  }
  await page.locator('[data-adventure="orsk-old-town"]').click();
  await page.locator('[data-lang="en"]').click();
  await page.locator('#close-settings').click();
  await textIncludes('h1', 'Old Orsk Secrets');
  await textIncludes('.approach', 'Garden Sigil');
  await page.reload({ waitUntil: 'networkidle' });
  await textIncludes('h1', 'Old Orsk Secrets');
  await textIncludes('.progress-copy', '5 of 5');
  assert.equal(await page.locator('#start-button').count(), 0);
  const saved = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
  assert.equal(saved.discoveredIds.length, 7);
  assert.equal(saved.completedEventIds.length, 7);
  assert.equal(saved.rewards.length, 7, 'reopening must not duplicate rewards');
  assert.ok(saved.rewards.includes('Leaf Sigil') && saved.rewards.includes('Word Sigil'));
  assert.equal(await page.evaluate(() => window.gpsCalls), 0);
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]').href;
    return { url: link, body: await (await fetch(link)).json(), scope: (await navigator.serviceWorker.ready).scope };
  });
  assert.equal(manifest.scope, url);
  assert.equal(new URL(manifest.body.start_url, manifest.url).href, url);
  assert.equal(manifest.body.display, 'standalone');
  for (const icon of manifest.body.icons) assert.ok((await context.request.get(new URL(icon.src, manifest.url).href)).ok());
  assert.deepEqual(errors, [], 'online application and console errors');

  checkingOnline = false; // Offline tile network failures are expected.
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await textIncludes('h1', 'Old Orsk Secrets');
  await textIncludes('.progress-copy', '5 of 5');
  await page.locator('#route-button').click();
  await page.locator('[data-adventure="bostandyk"]').click();
  await page.locator('[data-adventure="orsk-old-town"]').click();
  await page.locator('#close-settings').click();
  await devOpen(true);
  await page.locator('[data-sim="discover"]').click();
  await textIncludes('.reward-name', 'Garden Sigil');
  await page.locator('#close-event').click();
  await context.setOffline(false);
  await devOpen(false);
  await page.locator('#menu-button').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#reset-button').click();
  await textIncludes('.progress-copy', '0 of 5');
  assert.equal(await page.evaluate(storageKey => localStorage.getItem(storageKey), key), null);
  await page.reload({ waitUntil: 'networkidle' });
  assert.ok(await page.locator('#start-button').isVisible());
  console.log('PASS: Orsk 5/5, RU/EN, legacy saves, separate routes, reload, reset, offline and subpath PWA');

  // Exercise the actual browser Geolocation API with a controlled device position.
  const real = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ru-RU', permissions: ['geolocation'], geolocation: { latitude: 51.207074, longitude: 58.555753, accuracy: 8 } });
  await real.addInitScript(() => localStorage.setItem('almaty-trails-active-adventure-v1', 'orsk-old-town'));
  const gps = await real.newPage();
  gps.on('pageerror', error => errors.push(error.message));
  await gps.goto(url, { waitUntil: 'networkidle' });
  await gps.locator('#start-button').click();
  await gps.waitForFunction(() => document.querySelector('#discover-button') !== null);
  assert.equal(await gps.locator('.sim-banner').count(), 0);
  await gps.locator('#menu-button').click();
  for (let i = 0; i < 3; i++) {
    await real.setGeolocation({ latitude: 51.207074 + i * 0.000001, longitude: 58.555753, accuracy: 9 + i });
    await gps.waitForFunction(n => document.querySelector('.map-top-status')?.textContent.includes(`±${n} m`), 9 + i);
    assert.ok(await gps.locator('#settings-dialog').evaluate(el => el.open), 'GPS updates must not close Field Kit');
  }
  await gps.locator('#close-settings').click();
  await gps.locator('#list-toggle').click();
  await real.setGeolocation({ latitude: 51.20708, longitude: 58.555753, accuracy: 12 });
  await gps.waitForFunction(() => document.querySelector('.map-top-status')?.textContent.includes('±12 m'));
  assert.ok(await gps.locator('#poi-list').isVisible(), 'GPS updates must not collapse the POI list');
  await gps.screenshot({ path: `${screenshots}/orsk-10-gps-list.png`, fullPage: true });
  await real.setGeolocation({ latitude: 51.20708, longitude: 58.555753, accuracy: 120 });
  await gps.waitForFunction(() => document.querySelector('.primary-actions button')?.disabled);
  assert.deepEqual(errors, []);
  console.log('PASS: browser geolocation, poor accuracy, Field Kit and All five trails stay open on GPS updates');
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
