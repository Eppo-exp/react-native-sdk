import type {
  Flag,
  Variation,
  VariationType,
} from '@eppo/js-client-sdk-common';
import { EppoAsyncStorage, STORAGE_KEY } from './async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('EppoAsyncStorage', () => {
  let storage: EppoAsyncStorage;

  beforeEach(() => {
    storage = new EppoAsyncStorage();
    AsyncStorage.setItem = jest.fn();
    AsyncStorage.getItem = jest.fn();
  });

  const buildFlag = (key: string, variationValues: string[]): Flag => {
    const variations: Record<string, Variation> = {};
    variationValues.forEach((variationValue) => {
      variations[variationValue] = {
        key: variationValue,
        value: variationValue,
      };
    });
    return {
      key,
      enabled: true,
      variationType: 'STRING' as VariationType,
      variations,
      allocations: [],
      totalShards: 1,
    };
  };

  describe('setEntries', () => {
    it('should set entries and update AsyncStorage', async () => {
      expect(storage.isInitialized()).toBe(false);

      const flag1 = buildFlag('flag-key1', ['control-1', 'experiment-1']);
      const flag2 = buildFlag('flag-key2', ['control-2', 'experiment-2']);
      const entries = { key1: flag1, key2: flag2 };
      await storage.setEntries(entries);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(entries)
      );
      expect(storage.get('key1')).toEqual(flag1);
      expect(storage.get('key2')).toEqual(flag2);
      expect(storage.isInitialized()).toBe(true);
    });
  });

  describe('getKeys', () => {
    it('should return all keys in the cache', async () => {
      const flag1 = buildFlag('flag-key1', ['control-1', 'experiment-1']);
      const flag2 = buildFlag('flag-key2', ['control-2', 'experiment-2']);
      const flag3 = buildFlag('flag-key3', ['control-3', 'experiment-3']);
      const entries = { key1: flag1, key2: flag2, key3: flag3 };
      await storage.setEntries(entries);

      const keys = storage.getKeys();
      expect(keys).toEqual(['key1', 'key2', 'key3']);
    });
  });
});
