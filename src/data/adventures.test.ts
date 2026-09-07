import { describe, expect, it } from 'vitest';
import { ADVENTURES, getAdventure, ORSK_OLD_TOWN_POIS } from './pois';
import { distanceMeters } from '../geo';

describe('adventure data', () => {
  it('contains three five-location adventures with globally unique IDs', () => {
    expect(ADVENTURES).toHaveLength(3);
    expect(new Set(ADVENTURES.map(a => a.id)).size).toBe(3);
    const all = ADVENTURES.flatMap(adventure => adventure.pois);
    expect(all).toHaveLength(15);
    expect(new Set(all.map(poi => poi.id)).size).toBe(15);
    expect(new Set(all.map(poi => poi.reward.name)).size).toBe(15);
    for (const adventure of ADVENTURES) {
      expect(adventure.pois).toHaveLength(5);
      expect(adventure.defaultZoom).toBeGreaterThan(0);
      for (const poi of adventure.pois) {
        expect(Number.isFinite(poi.latitude)).toBe(true);
        expect(Number.isFinite(poi.longitude)).toBe(true);
        expect(Math.abs(poi.latitude)).toBeLessThanOrEqual(90);
        expect(Math.abs(poi.longitude)).toBeLessThanOrEqual(180);
        for (const text of [poi.id, poi.name, poi.shortName, poi.description, poi.reward.name, poi.reward.symbol, poi.event.prompt, poi.event.success]) expect(text.trim()).not.toBe('');
        expect(poi.activationRadiusMeters).toBeGreaterThanOrEqual(20);
        expect(poi.activationRadiusMeters).toBeLessThanOrEqual(50);
        expect(poi.event.choices[poi.event.correctChoice]).toBeTruthy();
      }
    }
  });

  it('restores each saved adventure, including Orsk, without changing the legacy default', () => {
    for (const adventure of ADVENTURES) expect(getAdventure(adventure.id)).toBe(adventure);
    expect(getAdventure(null).id).toBe('bostandyk');
    expect(getAdventure('unknown-route').id).toBe('bostandyk');
  });

  it('keeps Orsk points in a compact Old Town area with separate activation circles', () => {
    for (const poi of ORSK_OLD_TOWN_POIS) {
      expect(poi.latitude).toBeGreaterThan(51.204);
      expect(poi.latitude).toBeLessThan(51.213);
      expect(poi.longitude).toBeGreaterThan(58.551);
      expect(poi.longitude).toBeLessThan(58.567);
      for (const other of ORSK_OLD_TOWN_POIS.filter(p => p.id !== poi.id)) {
        const distance = distanceMeters(poi, other);
        expect(distance).toBeLessThan(1000);
        expect(distance).toBeGreaterThan(poi.activationRadiusMeters + other.activationRadiusMeters);
      }
    }
  });
});
