import { describe, expect, it } from 'vitest';
import { ADVENTURES } from './data/pois';
import { adventureText, poiText, t } from './i18n';

describe('Russian localization', () => {
  it('covers every POI without changing event answer indexes', () => {
    for (const poi of ADVENTURES.flatMap(adventure => adventure.pois)) {
      const copy = poiText(poi, 'ru');
      expect(copy.name.trim()).not.toBe('');
      expect(copy.shortName.trim()).not.toBe('');
      expect(copy.description.trim()).not.toBe('');
      expect(copy.reward.trim()).not.toBe('');
      expect(copy.prompt.trim()).not.toBe('');
      expect(copy.success.trim()).not.toBe('');
      expect(copy.choices).toHaveLength(poi.event.choices.length);
      expect(copy.choices[poi.event.correctChoice]?.trim()).not.toBe('');
    }
  });

  it('interpolates dynamic values in both languages', () => {
    expect(t('en', 'secretsFound', { n: 2 })).toBe('2 of 5 secrets found');
    expect(t('ru', 'secretsFound', { n: 2 })).toBe('Найдено секретов: 2 из 5');
  });

  it('gives every adventure its own localized title, journal and ending', () => {
    for (const lang of ['ru', 'en'] as const) {
      const copies = ADVENTURES.map(a => adventureText(a.id, lang));
      expect(new Set(copies.map(c => c.title)).size).toBe(3);
      expect(new Set(copies.map(c => c.ending)).size).toBe(3);
      for (const copy of copies) for (const value of Object.values(copy)) expect(value.trim()).not.toBe('');
      const orsk = adventureText('orsk-old-town', lang);
      expect(orsk.journal).toMatch(/ОРСК|ORSK/);
      expect(t(lang, 'mapLabel', { name: orsk.title })).toContain(orsk.title);
    }
  });
});
