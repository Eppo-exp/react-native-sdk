export class EppoAsyncStorage {
  private store = {};

  public get<T>(key: string): T {
    return this.store[key];
  }

  public setEntries<T>(entries: Record<string, T>) {
    Object.entries(entries).forEach(([key, val]) => {
      this.store[key] = val;
    });
  }
}