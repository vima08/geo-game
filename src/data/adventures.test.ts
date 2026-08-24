import { describe, expect, it } from 'vitest';
import { ADVENTURES } from './pois';

describe('adventure data', () => {
  it('contains two five-location adventures with globally unique IDs', () => {
    expect(ADVENTURES).toHaveLength(2);
    const all = ADVENTURES.flatMap(adventure => adventure.pois);
    expect(all).toHaveLength(10);
    expect(new Set(all.map(poi => poi.id)).size).toBe(10);
    for (const adventure of ADVENTURES) {
      expect(adventure.pois).toHaveLength(5);
      expect(adventure.defaultZoom).toBeGreaterThan(0);
      for (const poi of adventure.pois) {
        expect(Number.isFinite(poi.latitude)).toBe(true);
        expect(Number.isFinite(poi.longitude)).toBe(true);
        expect(poi.activationRadiusMeters).toBeGreaterThanOrEqual(20);
        expect(poi.activationRadiusMeters).toBeLessThanOrEqual(50);
        expect(poi.event.choices[poi.event.correctChoice]).toBeTruthy();
      }
    }
  });
});
