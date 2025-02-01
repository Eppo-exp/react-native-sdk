import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageAssignmentShim implements Map<string, string> {
  private readonly storageKey: string;
  private cache: Map<string, string>;

  public constructor(storageKeySuffix: string) {
    const keySuffix = storageKeySuffix ? `-${storageKeySuffix}` : '';
    this.storageKey = `eppo-assignment${keySuffix}`;
    this.cache = new Map();
    this.initCache();
  }

  private async initCache(): Promise<void> {
    const stored = await AsyncStorage.getItem(this.storageKey);
    this.cache = stored ? new Map(JSON.parse(stored)) : new Map();
  }

  private async persistCache(): Promise<void> {
    await AsyncStorage.setItem(
      this.storageKey,
      JSON.stringify(Array.from(this.cache.entries()))
    );
  }

  clear(): void {
    this.cache.clear();
    AsyncStorage.removeItem(this.storageKey).catch(console.error);
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.persistCache().catch(console.error);
    return result;
  }

  forEach(
    callbackfn: (value: string, key: string, map: Map<string, string>) => void,
    thisArg?: any
  ): void {
    this.cache.forEach(callbackfn, thisArg);
  }

  get size(): number {
    return this.cache.size;
  }

  entries(): IterableIterator<[string, string]> {
    return this.cache.entries();
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  values(): IterableIterator<string> {
    return this.cache.values();
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.cache[Symbol.iterator]();
  }

  get [Symbol.toStringTag](): string {
    return this.cache[Symbol.toStringTag];
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): this {
    this.cache.set(key, value);
    this.persistCache().catch(console.error);
    return this;
  }
}
