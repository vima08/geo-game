import { describe, expect, it } from 'vitest';
import { distanceMeters, formatDistance, isWithinActivation } from './geo';
import type { LocationReading, PointOfInterest } from './types';

const poi: PointOfInterest = { id: 'x', name: 'X', shortName: 'X', description: 'x', latitude: 43, longitude: 77, activationRadiusMeters: 40, reward: { name: 'R', symbol: 'R' }, event: { prompt: '?', choices: ['a'], correctChoice: 0, success: 'yes' } };
const reading = (latitude: number): LocationReading => ({ latitude, longitude: 77, accuracy: 10, source: 'real', timestamp: 1 });

describe('geographic distance', () => {
  it('is zero for the same coordinate', () => expect(distanceMeters(reading(43), poi)).toBe(0));
  it('matches a known one-degree latitude distance', () => expect(distanceMeters(reading(42), poi)).toBeCloseTo(111_195, -1));
  it('is symmetric', () => expect(distanceMeters(reading(42.9), poi)).toBeCloseTo(distanceMeters(poi as never, reading(42.9) as never), 8));
  it('formats human distances', () => { expect(formatDistance(124)).toBe('120 m'); expect(formatDistance(650)).toBe('650 m'); expect(formatDistance(1800)).toBe('1.8 km'); });
});

describe('activation', () => {
  it('accepts points inside and rejects outside', () => { expect(isWithinActivation(reading(43.0002), poi)).toBe(true); expect(isWithinActivation(reading(43.0005), poi)).toBe(false); });
  it('includes the radius boundary', () => { const exact = { ...poi, activationRadiusMeters: distanceMeters(reading(43.0002), poi) }; expect(isWithinActivation(reading(43.0002), exact)).toBe(true); });
});
