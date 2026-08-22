import type { Progress } from './types';

export const STORAGE_KEY = 'bostandyk-trails-progress-v1';
export const EMPTY_PROGRESS: Progress = { discoveredIds: [], rewards: [], completedEventIds: [], tutorialSeen: false };

const normalize = (value: Partial<Progress>): Progress => ({
  discoveredIds: Array.isArray(value.discoveredIds) ? [...new Set(value.discoveredIds.filter((x): x is string => typeof x === 'string'))] : [],
  rewards: Array.isArray(value.rewards) ? [...new Set(value.rewards.filter((x): x is string => typeof x === 'string'))] : [],
  completedEventIds: Array.isArray(value.completedEventIds) ? [...new Set(value.completedEventIds.filter((x): x is string => typeof x === 'string'))] : [],
  tutorialSeen: value.tutorialSeen === true,
});

export function loadProgress(storage: Pick<Storage, 'getItem'> = localStorage): Progress {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw) as Partial<Progress>) : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(progress: Progress, storage: Pick<Storage, 'setItem'> = localStorage): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(normalize(progress))); return true; }
  catch { return false; }
}

export function resetProgress(storage: Pick<Storage, 'removeItem'> = localStorage): void {
  storage.removeItem(STORAGE_KEY);
}
