import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@eppo/sdk-cache';

export interface IConfigurationStore<T> {
  get(key: string): T;
  setEntries(entries: Record<string, T>): void;
}

export class EppoAsyncStorage<T> implements IConfigurationStore<T> {
  private cache: { [key: string]: any } = {};

  public async init() {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data !== null) {
      this.cache = JSON.parse(data);
    }
  }

  public get<T>(key: string): T {
    return this.cache[key];
  }

  public setEntries<T>(entries: Record<string, T>): void {
    for (var key in entries) {
      this.cache[key] = entries[key];
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
  }
}
