import { getCompareSubmitState, shouldSubmitCompare } from '@/lib/compare/compareSubmitState';
import { STORAGE_KEYS } from '@/lib/constants';

describe('compareSubmitState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns disabled when compare mode is off', () => {
    localStorage.setItem(STORAGE_KEYS.COMPARE_MODE, JSON.stringify(false));
    localStorage.setItem(STORAGE_KEYS.COMPARE_MODELS, JSON.stringify(['a', 'b']));

    expect(getCompareSubmitState()).toEqual({ enabled: false, models: ['a', 'b'] });
    expect(shouldSubmitCompare()).toBe(false);
  });

  it('returns enabled when compare mode is on with enough models', () => {
    localStorage.setItem(STORAGE_KEYS.COMPARE_MODE, JSON.stringify(true));
    localStorage.setItem(
      STORAGE_KEYS.COMPARE_MODELS,
      JSON.stringify(['openrouter/a', 'openrouter/b', 'openrouter/c'])
    );

    expect(shouldSubmitCompare()).toBe(true);
    expect(getCompareSubmitState().models).toHaveLength(3);
  });

  it('requires at least two models', () => {
    localStorage.setItem(STORAGE_KEYS.COMPARE_MODE, JSON.stringify(true));
    localStorage.setItem(STORAGE_KEYS.COMPARE_MODELS, JSON.stringify(['openrouter/a']));

    expect(shouldSubmitCompare()).toBe(false);
  });
});
