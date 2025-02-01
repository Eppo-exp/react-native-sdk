import { AbstractAssignmentCache } from '@eppo/js-client-sdk-common';

import type {
  BulkReadAssignmentCache,
  BulkWriteAssignmentCache,
} from './hybrid-assignment-cache';
import { AsyncStorageAssignmentShim } from './async-storage-assignment-shim';

export class AsyncStorageAssignmentCache
  extends AbstractAssignmentCache<AsyncStorageAssignmentShim>
  implements BulkReadAssignmentCache, BulkWriteAssignmentCache
{
  constructor(storageKeySuffix: string) {
    super(new AsyncStorageAssignmentShim(storageKeySuffix));
  }

  setEntries(entries: [string, string][]): void {
    entries.forEach(([key, value]) => {
      if (key && value) {
        this.delegate.set(key, value);
      }
    });
  }

  getEntries(): Promise<[string, string][]> {
    return Promise.resolve(Array.from(this.entries()));
  }
}
