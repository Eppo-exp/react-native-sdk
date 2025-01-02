import type {
  IAsyncStore,
  IConfigurationStore,
  ISyncStore,
} from '@eppo/js-client-sdk-common';
import {
  type Environment,
  type Flag,
  FormatEnum,
  type ObfuscatedFlag,
} from '@eppo/js-client-sdk-common/dist/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bump this version number when we make breaking changes to the cache.
export const STORAGE_KEY = '@eppo/sdk-cache-ufc';

class AsyncStorageStore<T> implements ISyncStore<T> {
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

  entries(): Record<string, T> {
    return this.cache;
  }

  public setEntries(entries: Record<string, T>): void {
    for (var key in entries) {
      this.cache[key] = entries[key];
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    this._isInitialized = true;
  }
}

export class EppoAsyncStorage
  implements IConfigurationStore<Flag | ObfuscatedFlag>
{
  servingStore: ISyncStore<Flag | ObfuscatedFlag>;
  persistentStore: IAsyncStore<Flag | ObfuscatedFlag> | null;
  private initialized: boolean;
  private environment: Environment | null = null;
  private configFetchedAt: string | null = null;
  private configPublishedAt: string | null = null;
  private format: FormatEnum | null = null;

  constructor() {
    this.servingStore = new AsyncStorageStore<Flag | ObfuscatedFlag>();
    this.persistentStore = null;
    this.initialized = false;
    this.configFetchedAt = '';
    this.configPublishedAt = '';
    this.format = FormatEnum.CLIENT;
  }

  init(): Promise<void> {
    this.initialized = true;
    return Promise.resolve();
  }

  get(key: string): Flag | ObfuscatedFlag | null {
    return this.servingStore.get(key);
  }

  getKeys(): string[] {
    return this.servingStore.getKeys();
  }

  async isExpired(): Promise<boolean> {
    return true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  entries(): Record<string, Flag | ObfuscatedFlag> {
    return this.servingStore.entries();
  }

  async setEntries(
    entries: Record<string, Flag | ObfuscatedFlag>
  ): Promise<boolean> {
    this.servingStore.setEntries(entries);
    this.initialized = true;
    return true;
  }

  getEnvironment(): Environment | null {
    return this.environment;
  }

  setEnvironment(environment: Environment): void {
    this.environment = environment;
  }

  public getConfigFetchedAt(): string | null {
    return this.configFetchedAt;
  }

  public setConfigFetchedAt(configFetchedAt: string): void {
    this.configFetchedAt = configFetchedAt;
  }

  public getConfigPublishedAt(): string | null {
    return this.configPublishedAt;
  }

  public setConfigPublishedAt(configPublishedAt: string): void {
    this.configPublishedAt = configPublishedAt;
  }

  getFormat(): FormatEnum | null {
    return this.format;
  }

  setFormat(format: FormatEnum): void {
    this.format = format;
  }
}
