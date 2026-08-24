import { describe, expect, it } from 'vitest';
import { POIS } from './data/pois';
import { poiText, t } from './i18n';

describe('Russian localization', () => {
  it('covers every POI without changing event answer indexes', () => {
    for (const poi of POIS) {
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
});
