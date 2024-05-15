import type { IConfigurationStore } from '@eppo/js-client-sdk-common';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bump this version number when we make breaking changes to the cache.
const STORAGE_KEY = '@eppo/sdk-cache-ufc';

export class EppoAsyncStorage implements IConfigurationStore {
  private cache: { [key: string]: any } = {};
  private _isInitialized = false;

  public async init() {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data !== null) {
      this.cache = JSON.parse(data);
    }
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public get(key: string) {
    return this.cache[key];
  }

  public getKeys(): string[] {
    return Object.keys(this.cache);
  }

  public setEntries<T>(entries: Record<string, T>): void {
    for (var key in entries) {
      this.cache[key] = entries[key];
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    this._isInitialized = true;
  }
}
