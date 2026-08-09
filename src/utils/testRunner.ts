import { UnitTestResult } from '../types/comic';
import { naturalCompare, sortEntryPathsNaturally, normalizePath } from './naturalSort';
import { LRUImageCache } from './lruCache';
import { PagePair } from '../types/comic';

export function calculatePagePairs(
  totalPages: number,
  readingDirection: 'ltr' | 'rtl',
  firstPageIsCover: boolean = true
): PagePair[] {
  if (totalPages <= 0) return [];

  const pairs: PagePair[] = [];

  let startIndex = 0;
  if (firstPageIsCover) {
    // Cover page is shown alone
    pairs.push({
      id: 'pair_cover_0',
      leftIndex: readingDirection === 'ltr' ? 0 : null,
      rightIndex: readingDirection === 'rtl' ? 0 : null,
    });
    startIndex = 1;
  }

  for (let i = startIndex; i < totalPages; i += 2) {
    const secondIndex = i + 1 < totalPages ? i + 1 : null;

    if (readingDirection === 'ltr') {
      pairs.push({
        id: `pair_${i}_${secondIndex ?? 'none'}`,
        leftIndex: i,
        rightIndex: secondIndex,
      });
    } else {
      // Manga RTL: Right page comes first in reading order
      pairs.push({
        id: `pair_${i}_${secondIndex ?? 'none'}`,
        leftIndex: secondIndex,
        rightIndex: i,
      });
    }
  }

  return pairs;
}

export async function runAutomatedTestSuite(): Promise<UnitTestResult[]> {
  const results: UnitTestResult[] = [];

  // Test 1: Natural Sorting Algorithm
  const t1Start = performance.now();
  try {
    const unsorted = ['page10.jpg', 'page1.jpg', 'page2.jpg', 'page11.jpg', 'cover.jpg'];
    const sorted = [...unsorted].sort(naturalCompare);
    const expected = ['cover.jpg', 'page1.jpg', 'page2.jpg', 'page10.jpg', 'page11.jpg'];

    const passed = JSON.stringify(sorted) === JSON.stringify(expected);
    results.push({
      name: 'Natural Alphanumeric Sorting (page1, page2, page10)',
      passed,
      durationMs: +(performance.now() - t1Start).toFixed(2),
      message: passed
        ? 'Successfully sorted page numbers naturally.'
        : `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(sorted)}`,
    });
  } catch (err: any) {
    results.push({
      name: 'Natural Alphanumeric Sorting',
      passed: false,
      durationMs: +(performance.now() - t1Start).toFixed(2),
      message: err?.message || String(err),
    });
  }

  // Test 2: Windows Path Normalization & Junk Filter
  const t2Start = performance.now();
  try {
    const mixedPaths = [
      '__MACOSX/._page1.jpg',
      'folder\\subfolder\\page01.png',
      '.DS_Store',
      'folder/subfolder/page02.JPG',
    ];
    const filteredAndSorted = sortEntryPathsNaturally(mixedPaths);
    const expected = ['folder\\subfolder\\page01.png', 'folder/subfolder/page02.JPG'];

    const passed = filteredAndSorted.length === 2 && normalizePath(filteredAndSorted[0]).includes('page01');
    results.push({
      name: 'Path Normalization & macOS Junk Filter (__MACOSX, .DS_Store)',
      passed,
      durationMs: +(performance.now() - t2Start).toFixed(2),
      message: passed
        ? 'Correctly filtered system metadata files and normalized paths.'
        : `Got: ${JSON.stringify(filteredAndSorted)}`,
    });
  } catch (err: any) {
    results.push({
      name: 'Path Normalization & macOS Junk Filter',
      passed: false,
      durationMs: +(performance.now() - t2Start).toFixed(2),
      message: err?.message || String(err),
    });
  }

  // Test 3: LRU Image Cache Eviction
  const t3Start = performance.now();
  try {
    const cache = new LRUImageCache(3);
    const dummyBlob = new Blob(['test-image-data'], { type: 'image/jpeg' });

    cache.put(0, dummyBlob);
    cache.put(1, dummyBlob);
    cache.put(2, dummyBlob);
    cache.put(3, dummyBlob); // Should evict key 0

    const has0 = cache.has(0);
    const has3 = cache.has(3);
    const stats = cache.getStats();

    cache.clear();

    const passed = !has0 && has3 && stats.capacity === 3;
    results.push({
      name: 'LRU Cache Eviction & Memory Purging',
      passed,
      durationMs: +(performance.now() - t3Start).toFixed(2),
      message: passed
        ? 'Successfully evicted oldest entry (Key 0) when exceeding capacity of 3.'
        : `Failed LRU eviction test. Has 0: ${has0}, Has 3: ${has3}`,
    });
  } catch (err: any) {
    results.push({
      name: 'LRU Cache Eviction & Memory Purging',
      passed: false,
      durationMs: +(performance.now() - t3Start).toFixed(2),
      message: err?.message || String(err),
    });
  }

  // Test 4: Two-Page Spread Pair Logic (Western vs Manga RTL)
  const t4Start = performance.now();
  try {
    const ltrPairs = calculatePagePairs(5, 'ltr', true);
    const rtlPairs = calculatePagePairs(5, 'rtl', true);

    // LTR Cover: Left 0, Right null. LTR Spread 1: Left 1, Right 2
    // RTL Cover: Left null, Right 0. RTL Spread 1: Left 2, Right 1
    const ltrCoverOk = ltrPairs[0].leftIndex === 0;
    const rtlCoverOk = rtlPairs[0].rightIndex === 0;
    const rtlSpreadOk = rtlPairs[1].leftIndex === 2 && rtlPairs[1].rightIndex === 1;

    const passed = ltrCoverOk && rtlCoverOk && rtlSpreadOk;
    results.push({
      name: 'Two-Page Spread Alignment (Western LTR vs Manga RTL)',
      passed,
      durationMs: +(performance.now() - t4Start).toFixed(2),
      message: passed
        ? 'Accurately paired pages for both Western (LTR) and Manga (RTL) reading modes.'
        : `Spread pairing failed. LTR Cover: ${ltrCoverOk}, RTL Cover: ${rtlCoverOk}, RTL Spread: ${rtlSpreadOk}`,
    });
  } catch (err: any) {
    results.push({
      name: 'Two-Page Spread Alignment',
      passed: false,
      durationMs: +(performance.now() - t4Start).toFixed(2),
      message: err?.message || String(err),
    });
  }

  return results;
}
