import type { LocationReading, PointOfInterest } from './types';

const EARTH_RADIUS_M = 6_371_000;
const radians = (degrees: number) => degrees * Math.PI / 180;

export function distanceMeters(a: Pick<LocationReading, 'latitude' | 'longitude'>, b: Pick<PointOfInterest, 'latitude' | 'longitude'>): number {
  const deltaLat = radians(b.latitude - a.latitude);
  const deltaLon = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function isWithinActivation(reading: LocationReading, poi: PointOfInterest): boolean {
  return distanceMeters(reading, poi) <= poi.activationRadiusMeters;
}

export function proximityMessage(distance: number, radius: number): string {
  if (distance <= radius) return 'You’ve arrived — unlock this secret';
  if (distance <= Math.max(radius * 2, 100)) return `Almost there — ${formatDistance(distance)}`;
  return `${formatDistance(distance)} away`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(0, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}
