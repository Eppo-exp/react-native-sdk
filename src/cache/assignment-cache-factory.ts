import type { AssignmentCache } from '@eppo/js-client-sdk-common';

import SimpleAssignmentCache from './simple-assignment-cache';
import HybridAssignmentCache from './hybrid-assignment-cache';
import { AsyncStorageAssignmentCache } from './async-storage-assignment-cache';

export function assignmentCacheFactory({
  forceMemoryOnly = false,
  storageKeySuffix,
}: {
  forceMemoryOnly?: boolean;
  storageKeySuffix: string;
}): AssignmentCache {
  const simpleCache = new SimpleAssignmentCache();
  if (forceMemoryOnly) {
    return simpleCache;
  }
  const asyncStorageCache = new AsyncStorageAssignmentCache(storageKeySuffix);
  const hybridAssignmentCache = new HybridAssignmentCache(
    simpleCache,
    asyncStorageCache
  );
  return hybridAssignmentCache;
}
