import { describe, expect, it } from 'vitest';
import { POIS } from './pois';

describe('POI data', () => {
  it('contains exactly five valid, unique Bostandyk locations', () => {
    expect(POIS).toHaveLength(5); expect(new Set(POIS.map((p) => p.id)).size).toBe(5);
    for (const p of POIS) {
      expect(p.id.trim()).not.toBe(''); expect(p.name.trim()).not.toBe('');
      expect(p.latitude).toBeGreaterThanOrEqual(-90); expect(p.latitude).toBeLessThanOrEqual(90);
      expect(p.longitude).toBeGreaterThanOrEqual(-180); expect(p.longitude).toBeLessThanOrEqual(180);
      expect(p.activationRadiusMeters).toBeGreaterThan(0); expect(p.activationRadiusMeters).toBeLessThanOrEqual(50);
      expect(p.event.prompt.trim()).not.toBe(''); expect(p.event.choices.length).toBeGreaterThan(1);
      expect(p.event.correctChoice).toBeLessThan(p.event.choices.length); expect(p.reward.name.trim()).not.toBe('');
    }
  });
});
