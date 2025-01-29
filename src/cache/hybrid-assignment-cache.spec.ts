// /**
//  * @jest-environment jsdom
//  */

// import { AsyncStorageAssignmentCache } from './async-storage-assignment-cache';
// import HybridAssignmentCache from './hybrid-assignment-cache';
// import SimpleAssignmentCache from './simple-assignment-cache';

// describe('HybridStorageAssignmentCache', () => {
//   const fakeStore: Record<string, string> = {};

//   const get = jest.fn((key?: string) => {
//     return new Promise((resolve) => {
//       if (!key) {
//         resolve(fakeStore);
//       } else {
//         resolve({ [key]: fakeStore[key] });
//       }
//     });
//   }) as jest.Mock;

//   const set = jest.fn((items: { [key: string]: string }) => {
//     return new Promise((resolve) => {
//       Object.assign(fakeStore, items);
//       resolve(undefined);
//     });
//   }) as jest.Mock;

//   const mockChromeStorage = { get, set } as unknown as StorageArea;
//   const asyncStorageCache = new AsyncStorageAssignmentCache(mockChromeStorage);
//   const hybridCache = new HybridAssignmentCache(
//     new SimpleAssignmentCache(),
//     asyncStorageCache
//   );

//   it('has should return false if cache is empty', async () => {
//     const cacheKey = {
//       subjectKey: 'subject-1',
//       flagKey: 'flag-1',
//       allocationKey: 'allocation-1',
//       variationKey: 'control',
//     };
//     await hybridCache.init();
//     expect(hybridCache.has(cacheKey)).toBeFalsy();
//   });

//   it('has should return true if cache key is present', async () => {
//     const cacheKey = {
//       subjectKey: 'subject-1',
//       flagKey: 'flag-1',
//       allocationKey: 'allocation-1',
//       variationKey: 'control',
//     };
//     await hybridCache.init();
//     expect(hybridCache.has(cacheKey)).toBeFalsy();
//     expect(localStorageCache.has(cacheKey)).toBeFalsy();
//     hybridCache.set(cacheKey);
//     expect(hybridCache.has(cacheKey)).toBeTruthy();
//     expect(localStorageCache.has(cacheKey)).toBeTruthy();
//   });

//   it('should populate localStorageCache from chromeStorageCache', async () => {
//     const key1 = {
//       subjectKey: 'subject-1',
//       flagKey: 'flag-1',
//       allocationKey: 'allocation-1',
//       variationKey: 'control',
//     };
//     const key2 = {
//       subjectKey: 'subject-2',
//       flagKey: 'flag-2',
//       allocationKey: 'allocation-2',
//       variationKey: 'control',
//     };
//     expect(localStorageCache.has(key1)).toBeFalsy();
//     chromeStorageCache.set(key1);
//     chromeStorageCache.set(key2);
//     await hybridCache.init();
//     expect(localStorageCache.has(key1)).toBeTruthy();
//     expect(localStorageCache.has(key2)).toBeTruthy();
//     expect(
//       localStorageCache.has({ ...key1, allocationKey: 'foo' })
//     ).toBeFalsy();
//   });
// });
