import { describe, expect, it } from 'vitest';
import { EMPTY_PROGRESS, STORAGE_KEY, loadProgress, resetProgress, saveProgress } from './progress';

class MemoryStorage {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}
describe('progress storage', () => {
  it('round trips and deduplicates progress', () => { const s = new MemoryStorage(); saveProgress({ tutorialSeen: true, discoveredIds: ['a', 'a'], completedEventIds: ['a'], rewards: ['R'] }, s); expect(loadProgress(s).discoveredIds).toEqual(['a']); });
  it('falls back from corrupt data', () => { const s = new MemoryStorage(); s.setItem(STORAGE_KEY, '{oops'); expect(loadProgress(s)).toEqual(EMPTY_PROGRESS); });
  it('fills missing legacy properties', () => { const s = new MemoryStorage(); s.setItem(STORAGE_KEY, '{"tutorialSeen":true}'); expect(loadProgress(s)).toEqual({ ...EMPTY_PROGRESS, tutorialSeen: true }); });
  it('removes only its own key', () => { const s = new MemoryStorage(); s.setItem(STORAGE_KEY, '{}'); s.setItem('other', 'safe'); resetProgress(s); expect(s.getItem(STORAGE_KEY)).toBeNull(); expect(s.getItem('other')).toBe('safe'); });
});
