export type ReadingDirection = 'ltr' | 'rtl'; // LTR = Western, RTL = Manga

export type PageFitMode = 'fit-screen' | 'fit-width' | 'fit-height' | 'original';

export type ReaderTheme = 'dark' | 'light' | 'sepia' | 'oled';

export type ReaderLayoutMode = 'paged' | 'webtoon'; // 'paged' vs 'webtoon' continuous vertical scroll

export type WebtoonWidth = string; // E.g. '760px', '950px', '100%'

export type SpreadMode = 'single' | 'spread' | 'auto'; // Single page, Two-page spread, or Auto based on screen width

export interface ComicPageEntry {
  index: number;
  entryPath: String;
  fileName: string;
  blobUrl?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface ComicBook {
  id: string;
  fileName: string;
  title: string;
  totalPages: number;
  entries: ComicPageEntry[];
  lastReadPage: number;
  readingDirection: ReadingDirection;
  fileSize: number;
  createdAt: number;
  fileHandle?: File;
  rawZipBuffer?: ArrayBuffer;
}

export interface PagePair {
  id: string;
  leftIndex: number | null;
  rightIndex: number | null;
}

export interface ReaderSettings {
  layoutMode: ReaderLayoutMode;
  spreadMode: SpreadMode;
  webtoonWidth: WebtoonWidth;
  autoHideUI: boolean;
  autoNextComic: boolean;
  doublePageSpread: boolean;
  autoSpreadOnWideScreen: boolean;
  spreadThresholdPx: number;
  readingDirection: ReadingDirection;
  fitMode: PageFitMode;
  theme: ReaderTheme;
  lruCacheCapacity: number;
  firstPageIsCover: boolean;
  showScrubber: boolean;
  showDebugHud: boolean;
  smoothPageTransitions: boolean;
}

export interface RecentComicItem {
  id: string;
  fileName: string;
  title: string;
  totalPages: number;
  lastReadPage: number;
  lastOpenedAt: number;
  coverBlobUrl?: string;
  fileSize: number;
  readingDirection: ReadingDirection;
}

export interface DiagnosticStats {
  cacheHitCount: number;
  cacheMissCount: number;
  cachedPageIndices: number[];
  estimatedMemoryMb: number;
  lastExtractionTimeMs: number;
  activeBlobUrlsCount: number;
}

export interface UnitTestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  message?: string;
}
