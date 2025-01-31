import { AsyncStorageAssignmentCache } from '../cache/async-storage-assignment-cache';
import HybridAssignmentCache from '../cache/hybrid-assignment-cache';
import SimpleAssignmentCache from '../cache/simple-assignment-cache';

describe('HybridStorageAssignmentCache', () => {
  let asyncStorageCache: AsyncStorageAssignmentCache;
  let simpleCache: SimpleAssignmentCache;
  let hybridCache: HybridAssignmentCache;

  beforeEach(() => {
    asyncStorageCache = new AsyncStorageAssignmentCache('test');
    simpleCache = new SimpleAssignmentCache();
    hybridCache = new HybridAssignmentCache(simpleCache, asyncStorageCache);
  });

  it('has should return false if cache is empty', async () => {
    const cacheKey = {
      subjectKey: 'subject-1',
      flagKey: 'flag-1',
      allocationKey: 'allocation-1',
      variationKey: 'control',
    };
    await hybridCache.init();
    expect(hybridCache.has(cacheKey)).toBeFalsy();
  });

  it('has should return true if cache key is present', async () => {
    const cacheKey = {
      subjectKey: 'subject-1',
      flagKey: 'flag-1',
      allocationKey: 'allocation-1',
      variationKey: 'control',
    };
    await hybridCache.init();
    expect(hybridCache.has(cacheKey)).toBeFalsy();
    expect(simpleCache.has(cacheKey)).toBeFalsy();
    hybridCache.set(cacheKey);
    expect(hybridCache.has(cacheKey)).toBeTruthy();
    expect(simpleCache.has(cacheKey)).toBeTruthy();
  });

  it('should populate asyncStorageCache from simpleCache', async () => {
    const key1 = {
      subjectKey: 'subject-1',
      flagKey: 'flag-1',
      allocationKey: 'allocation-1',
      variationKey: 'control',
    };
    const key2 = {
      subjectKey: 'subject-2',
      flagKey: 'flag-2',
      allocationKey: 'allocation-2',
      variationKey: 'control',
    };
    expect(simpleCache.has(key1)).toBeFalsy();
    asyncStorageCache.set(key1);
    asyncStorageCache.set(key2);
    await hybridCache.init();
    expect(simpleCache.has(key1)).toBeTruthy();
    expect(simpleCache.has(key2)).toBeTruthy();
    expect(simpleCache.has({ ...key1, allocationKey: 'foo' })).toBeFalsy();
  });

  it('should handle variation changes for same subject, flag, and allocation', async () => {
    const baseKey = {
      subjectKey: 'subject-1',
      flagKey: 'flag-1',
      allocationKey: 'allocation-1',
    };

    const originalAssignment = {
      ...baseKey,
      variationKey: 'control',
    };

    const newAssignment = {
      ...baseKey,
      variationKey: 'treatment',
    };

    await hybridCache.init();
    hybridCache.set(originalAssignment);
    expect(hybridCache.has(originalAssignment)).toBeTruthy();

    hybridCache.set(newAssignment);

    expect(hybridCache.has(originalAssignment)).toBeFalsy();
    expect(hybridCache.has(newAssignment)).toBeTruthy();
  });
});
