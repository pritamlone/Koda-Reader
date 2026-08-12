/**
 * Least Recently Used (LRU) Memory Cache for Image Blob URLs
 * Automatically revokes object URLs when evicted to free browser RAM.
 */

interface CacheEntry<V> {
  key: number;
  value: V;
  blobUrl: string;
  estimatedSizeBytes: number;
}

export class LRUImageCache {
  private capacity: number;
  private cache = new Map<number, CacheEntry<Blob>>();
  private hitCount = 0;
  private missCount = 0;

  constructor(capacity = 100) {
    this.capacity = Math.max(1, capacity);
  }

  public setCapacity(newCapacity: number): void {
    this.capacity = Math.max(1, newCapacity);
    this.evictToCapacity();
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public get(key: number): { blob: Blob; url: string } | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    this.hitCount++;
    // Move to end to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, entry);

    return { blob: entry.value, url: entry.blobUrl };
  }

  public put(key: number, blob: Blob): string {
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      URL.revokeObjectURL(existing.blobUrl);
      this.cache.delete(key);
    }

    const blobUrl = URL.createObjectURL(blob);
    const entry: CacheEntry<Blob> = {
      key,
      value: blob,
      blobUrl,
      estimatedSizeBytes: blob.size || 500000,
    };

    this.cache.set(key, entry);
    this.evictToCapacity();

    return blobUrl;
  }

  public has(key: number): boolean {
    return this.cache.has(key);
  }

  public getBlobUrl(key: number): string | null {
    const entry = this.cache.get(key);
    return entry ? entry.blobUrl : null;
  }

  public evictExcept(keepKeys: Set<number>): void {
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (!keepKeys.has(key)) {
        URL.revokeObjectURL(entry.blobUrl);
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    for (const entry of this.cache.values()) {
      URL.revokeObjectURL(entry.blobUrl);
    }
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  private evictToCapacity(): void {
    while (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        const entry = this.cache.get(oldestKey);
        if (entry) {
          URL.revokeObjectURL(entry.blobUrl);
        }
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  public getStats() {
    let totalBytes = 0;
    const cachedKeys: number[] = [];

    for (const [key, entry] of this.cache.entries()) {
      cachedKeys.push(key);
      totalBytes += entry.estimatedSizeBytes;
    }

    return {
      size: this.cache.size,
      capacity: this.capacity,
      cachedPageIndices: cachedKeys.sort((a, b) => a - b),
      estimatedMemoryMb: +(totalBytes / (1024 * 1024)).toFixed(2),
      hitCount: this.hitCount,
      missCount: this.missCount,
    };
  }
}
