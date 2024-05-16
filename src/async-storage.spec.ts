import { EppoAsyncStorage, STORAGE_KEY } from './async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('EppoAsyncStorage', () => {
  let storage: EppoAsyncStorage;

  beforeEach(() => {
    storage = new EppoAsyncStorage();
    AsyncStorage.setItem = jest.fn();
    AsyncStorage.getItem = jest.fn();
  });

  describe('setEntries', () => {
    it('should set entries and update AsyncStorage', async () => {
      expect(storage.isInitialized()).toBe(false);

      const entries = { key1: 'newvalue1', key2: 'newvalue2' };
      await storage.setEntries(entries);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(entries)
      );
      expect(storage.get('key1')).toBe('newvalue1');
      expect(storage.get('key2')).toBe('newvalue2');
      expect(storage.isInitialized()).toBe(true);
    });
  });

  describe('getKeys', () => {
    it('should return all keys in the cache', async () => {
      const entries = { key1: 'value1', key2: 'value2', key3: 'value3' };
      await storage.setEntries(entries);

      const keys = storage.getKeys();
      expect(keys).toEqual(['key1', 'key2', 'key3']);
    });
  });
});
