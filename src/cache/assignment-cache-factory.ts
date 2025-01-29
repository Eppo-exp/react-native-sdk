// import { AssignmentCache } from '@eppo/js-client-sdk-common';

// import { hasWindowLocalStorage } from '../configuration-factory';

// import SimpleAssignmentCache from './simple-assignment-cache';
// import HybridAssignmentCache from './hybrid-assignment-cache';
// import { AsyncStorageAssignmentCache } from './async-storage-assignment-cache';

// export function assignmentCacheFactory({
//   forceMemoryOnly = false,
//   storageKeySuffix,
// }: {
//   forceMemoryOnly?: boolean;
//   storageKeySuffix: string;
// }): AssignmentCache {
//   const simpleCache = new SimpleAssignmentCache();

//   if (forceMemoryOnly) {
//     return simpleCache;
//   }
//   if (hasWindowLocalStorage()) {
//     const localStorageCache = new AsyncStorageAssignmentCache(storageKeySuffix);
//     return new HybridAssignmentCache(simpleCache, localStorageCache);
//   } else {
//     return simpleCache;
//   }
// }
