import { describe, expect, it } from 'vitest';
import { EMPTY_PROGRESS, STORAGE_KEY, loadProgress, resetProgress, saveProgress } from './progress';
import { ADVENTURES, ORSK_OLD_TOWN_POIS } from './data/pois';

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

  it('adds a complete Orsk atlas without losing existing Almaty progress or rewards', () => {
    const s = new MemoryStorage();
    const legacy = [ADVENTURES[0].pois[0], ADVENTURES[1].pois[0]];
    s.setItem(STORAGE_KEY, JSON.stringify({ tutorialSeen: true, discoveredIds: legacy.map(p => p.id), completedEventIds: legacy.map(p => p.id), rewards: legacy.map(p => p.reward.name) }));
    const progress = loadProgress(s);
    for (const poi of ORSK_OLD_TOWN_POIS) {
      progress.discoveredIds.push(poi.id);
      progress.completedEventIds.push(poi.id);
      progress.rewards.push(poi.reward.name);
    }
    expect(saveProgress(progress, s)).toBe(true);
    const restored = loadProgress(s);
    expect(restored).toEqual(progress);
    expect(ADVENTURES.map(a => a.pois.filter(p => restored.discoveredIds.includes(p.id)).length)).toEqual([1, 1, 5]);
    expect(restored.rewards).toHaveLength(7);
    expect(restored.tutorialSeen).toBe(true);
  });
});
