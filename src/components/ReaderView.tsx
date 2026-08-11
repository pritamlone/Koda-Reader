import React, { useState, useEffect, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import {
  ComicBook,
  ReaderSettings,
  DiagnosticStats,
  SpreadMode,
} from '../types/comic';
import { PageImageView } from './PageImageView';
import { ScrubberBar } from './ScrubberBar';
import { DebugHud } from './DebugHud';
import { CBZParser } from '../utils/cbzParser';
import { LRUImageCache } from '../utils/lruCache';
import { calculatePagePairs } from '../utils/testRunner';
import { Upload, ChevronLeft, ChevronRight, BookOpen, Play, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReaderViewProps {
  currentComic: ComicBook | null;
  zipInstance: JSZip | null;
  settings: ReaderSettings;
  currentPageIndex: number;
  onPageChange: (newIndex: number) => void;
  onOpenFile: () => void;
  onOpenFolder?: () => void;
  isLoadingComic: boolean;
  isControlsVisible?: boolean;
  onToggleControls?: () => void;
  onTriggerActivity?: () => void;
  onHoverControlsChange?: (hovering: boolean) => void;
  onLoadNextComic?: () => void;
  nextComicTitle?: string;
  hasNextComic?: boolean;
  onLoadPrevComic?: () => void;
  prevComicTitle?: string;
  hasPrevComic?: boolean;
  chapterNumber?: number;
  totalChapters?: number;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  currentComic,
  zipInstance,
  settings,
  currentPageIndex,
  onPageChange,
  onOpenFile,
  onOpenFolder,
  isLoadingComic,
  isControlsVisible = true,
  onToggleControls,
  onTriggerActivity,
  onHoverControlsChange,
  onLoadNextComic,
  nextComicTitle,
  hasNextComic = false,
  onLoadPrevComic,
  prevComicTitle,
  hasPrevComic = false,
  chapterNumber,
  totalChapters,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const webtoonScrollRef = useRef<HTMLDivElement>(null);
  const internalScrollTargetRef = useRef<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);

  const isWebtoon = settings.layoutMode === 'webtoon';

  const webtoonEndBannerRef = useRef<HTMLDivElement>(null);
  const [isWebtoonEndVisible, setIsWebtoonEndVisible] = useState<boolean>(false);

  // Floating Toast Overlay for New Chapter
  const [showChapterToast, setShowChapterToast] = useState<boolean>(false);

  useEffect(() => {
    if (currentComic) {
      setShowChapterToast(true);
      const timer = setTimeout(() => {
        setShowChapterToast(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentComic?.id, chapterNumber]);

  useEffect(() => {
    if (!isWebtoon || !webtoonEndBannerRef.current) {
      setIsWebtoonEndVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsWebtoonEndVisible(entry.isIntersecting);
        }
      },
      {
        root: webtoonScrollRef.current,
        threshold: 0.1,
      }
    );

    observer.observe(webtoonEndBannerRef.current);
    return () => observer.disconnect();
  }, [isWebtoon, currentComic?.id]);

  const isEndReached = currentComic
    ? isWebtoon
      ? isWebtoonEndVisible
      : currentPageIndex >= currentComic.totalPages - 1
    : false;

  // Initialize LRU Image Cache
  const lruCacheRef = useRef<LRUImageCache>(new LRUImageCache(settings.lruCacheCapacity));
  const [cachedUrls, setCachedUrls] = useState<Record<number, string>>({});
  const [diagnosticStats, setDiagnosticStats] = useState<DiagnosticStats>({
    cacheHitCount: 0,
    cacheMissCount: 0,
    cachedPageIndices: [],
    estimatedMemoryMb: 0,
    lastExtractionTimeMs: 0,
    activeBlobUrlsCount: 0,
  });

  // Track container width for responsive spread threshold calculation
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync LRU capacity when settings change
  useEffect(() => {
    lruCacheRef.current.setCapacity(settings.lruCacheCapacity);
  }, [settings.lruCacheCapacity]);

  // Determine Layout Mode and Spread Mode
  const activeSpreadMode: SpreadMode =
    settings.spreadMode ||
    (settings.doublePageSpread ? 'spread' : settings.autoSpreadOnWideScreen ? 'auto' : 'single');

  // Double-page spread is active ONLY if in Paged mode AND either explicitly set to spread or auto-spread condition is met
  const isSpreadActive =
    !isWebtoon &&
    (activeSpreadMode === 'spread' ||
      (activeSpreadMode === 'auto' && containerWidth >= settings.spreadThresholdPx));

  // Scroll to active page in Webtoon continuous mode ONLY when currentPageIndex is changed externally
  useEffect(() => {
    if (isWebtoon && webtoonScrollRef.current) {
      if (internalScrollTargetRef.current === currentPageIndex) {
        // Change originated from user scrolling manually; reset ref and preserve fluid scroll position
        internalScrollTargetRef.current = null;
        return;
      }

      const pageEl = document.getElementById(`webtoon-page-${currentPageIndex}`);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPageIndex, isWebtoon]);

  // Efficient IntersectionObserver for Webtoon mode scroll page detection
  useEffect(() => {
    if (!isWebtoon || !currentComic || !webtoonScrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry && bestEntry.target) {
          const pageIndexAttr = bestEntry.target.getAttribute('data-page-index');
          if (pageIndexAttr !== null) {
            const pageIdx = parseInt(pageIndexAttr, 10);
            if (!isNaN(pageIdx) && pageIdx !== currentPageIndex) {
              internalScrollTargetRef.current = pageIdx;
              onPageChange(pageIdx);
            }
          }
        }
      },
      {
        root: webtoonScrollRef.current,
        rootMargin: '-10% 0px -60% 0px',
        threshold: [0, 0.2, 0.5, 0.8],
      }
    );

    const pageElements = webtoonScrollRef.current.querySelectorAll('[data-page-index]');
    pageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [isWebtoon, currentComic?.id, currentComic?.totalPages, currentPageIndex, onPageChange]);

  // Calculate spreads array for paged mode
  const pagePairs = useMemo(() => {
    if (!currentComic) return [];
    return calculatePagePairs(
      currentComic.totalPages,
      settings.readingDirection,
      settings.firstPageIsCover
    );
  }, [currentComic?.totalPages, settings.readingDirection, settings.firstPageIsCover]);

  // Find active spread pair for current page index
  const activePair = useMemo(() => {
    if (!isSpreadActive || pagePairs.length === 0) return null;
    return (
      pagePairs.find(
        (p) => p.leftIndex === currentPageIndex || p.rightIndex === currentPageIndex
      ) || pagePairs[0]
    );
  }, [isSpreadActive, pagePairs, currentPageIndex]);

  // Sliding window page extraction effect
  useEffect(() => {
    if (!currentComic || !zipInstance) return;

    let isCancelled = false;
    const lru = lruCacheRef.current;

    // Window set: current page -3 to +10 pages for Webtoon continuous scroll, ±3 for Paged
    const windowIndices = new Set<number>();
    if (isWebtoon) {
      for (let delta = -3; delta <= 10; delta++) {
        const idx = currentPageIndex + delta;
        if (idx >= 0 && idx < currentComic.totalPages) {
          windowIndices.add(idx);
        }
      }
    } else {
      for (let delta = -3; delta <= 3; delta++) {
        const idx = currentPageIndex + delta;
        if (idx >= 0 && idx < currentComic.totalPages) {
          windowIndices.add(idx);
        }
      }
    }

    // Evict pages outside sliding window
    lru.evictExcept(windowIndices);

    // Extract pages asynchronously
    const loadWindowPages = async () => {
      const startTime = performance.now();

      for (const idx of Array.from(windowIndices)) {
        if (isCancelled) break;

        if (!lru.has(idx)) {
          try {
            const entry = currentComic.entries[idx];
            if (entry) {
              const blob = await CBZParser.extractPageBlob(zipInstance, entry.entryPath);
              if (!isCancelled) {
                lru.put(idx, blob);
              }
            }
          } catch (err) {
            console.error(`Failed to extract page ${idx}:`, err);
          }
        }
      }

      if (!isCancelled) {
        // Collect URLs for active rendered state
        const updatedUrls: Record<number, string> = {};
        for (const idx of Array.from(windowIndices)) {
          const url = lru.getBlobUrl(idx);
          if (url) updatedUrls[idx] = url;
        }
        setCachedUrls(updatedUrls);

        const stats = lru.getStats();
        setDiagnosticStats({
          cacheHitCount: stats.hitCount,
          cacheMissCount: stats.missCount,
          cachedPageIndices: stats.cachedPageIndices,
          estimatedMemoryMb: stats.estimatedMemoryMb,
          lastExtractionTimeMs: +(performance.now() - startTime).toFixed(1),
          activeBlobUrlsCount: Object.keys(updatedUrls).length,
        });
      }
    };

    loadWindowPages();

    return () => {
      isCancelled = true;
    };
  }, [currentComic?.id, currentPageIndex, zipInstance, isWebtoon]);

  // Theme canvas background colors
  const themeBgClass =
    settings.theme === 'light'
      ? 'bg-slate-100 text-slate-900'
      : settings.theme === 'sepia'
      ? 'bg-[#f4ecd8] text-[#433422]'
      : settings.theme === 'oled'
      ? 'bg-black text-slate-100'
      : 'bg-slate-950 text-slate-100';

  if (isLoadingComic) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center space-y-4 ${themeBgClass}`}>
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm font-mono text-slate-400">
          Unzipping archive and analyzing pages...
        </span>
      </div>
    );
  }

  if (!currentComic) {
    return (
      <div
        ref={containerRef}
        className={`flex-1 flex flex-col items-center justify-center p-8 select-none ${themeBgClass}`}
      >
        <div className="max-w-md text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-2xl">
            <Upload size={38} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Drop a CBZ or ZIP Comic File
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open any comic archive (.cbz, .zip) or select an entire folder. All upcoming episodes in the directory will automatically load for continuous reading.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-1">
            <button
              onClick={onOpenFile}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xl transition-all"
            >
              Open File (Cmd+O)
            </button>
            {onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
              >
                Open Folder
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={onToggleControls || onTriggerActivity}
      className={`relative flex-1 flex flex-col items-center justify-center overflow-hidden select-none ${themeBgClass}`}
    >
      {/* Bottom Hover Sensing Hotspot (Reveal UI when hovering bottom edge) */}
      <div
        onMouseEnter={() => {
          if (onHoverControlsChange) onHoverControlsChange(true);
          if (onTriggerActivity) onTriggerActivity();
        }}
        onMouseLeave={() => {
          if (onHoverControlsChange) onHoverControlsChange(false);
        }}
        className="absolute bottom-0 left-0 right-0 h-4 z-40 pointer-events-auto"
      />

      {/* Diagnostic HUD */}
      {settings.showDebugHud && (
        <DebugHud
          stats={diagnosticStats}
          totalPageCount={currentComic.totalPages}
          currentPageIndex={currentPageIndex}
        />
      )}

      {/* Floating Chapter Toast Indicator Badge */}
      {showChapterToast && currentComic && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
          <div className="px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-md">
            <BookOpen size={14} className="text-emerald-400" />
            <span>
              {chapterNumber && totalChapters && totalChapters > 0
                ? `Chapter ${chapterNumber} of ${totalChapters}`
                : 'Chapter'}{' '}
              : <span className="text-white font-bold">{currentComic.title}</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div className={`w-full h-full flex flex-col items-center justify-center ${isWebtoon ? 'p-0' : 'p-1 sm:p-2'} overflow-hidden relative`}>
        {isWebtoon ? (
          /* Webtoon Vertical Continuous Scroll Mode (0 gap seamless panels) */
          <div
            ref={webtoonScrollRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden py-0 px-0 flex flex-col items-center bg-black/95 space-y-0 text-[0px] leading-[0] select-none transform-gpu"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              className="w-full flex flex-col items-center space-y-0 p-0 m-0 border-0 outline-none text-[0px] leading-[0]"
              style={{
                width: '100%',
                maxWidth: settings.webtoonWidth === '100%' ? '100%' : settings.webtoonWidth || '760px',
              }}
            >
              {/* Previous Chapter Top Banner in Webtoon Mode */}
              {hasPrevComic && onLoadPrevComic && (
                <div className="w-full text-xs text-slate-200 py-3 px-4 flex justify-center bg-slate-900/60 border-b border-slate-800/80 leading-normal">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadPrevComic();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-2 shadow-md"
                  >
                    <ChevronLeft size={14} className="text-emerald-400" />
                    <span>Previous Chapter: {prevComicTitle}</span>
                  </button>
                </div>
              )}

              {currentComic.entries.map((entry, idx) => (
                <div
                  key={idx}
                  id={`webtoon-page-${idx}`}
                  data-page-index={idx}
                  className="w-full p-0 m-0 border-0 outline-none flex flex-col items-center justify-center text-[0px] leading-[0] align-bottom select-none transform-gpu"
                >
                  <PageImageView
                    blobUrl={cachedUrls[idx]}
                    pageIndex={idx}
                    totalPages={currentComic.totalPages}
                    fileName={entry.fileName}
                    fitMode="fit-width"
                    isWebtoon={true}
                  />
                </div>
              ))}

              {/* End of Webtoon Stream Continuous Reading Banner */}
              <div ref={webtoonEndBannerRef} className="w-full text-base leading-normal text-slate-200 py-8 px-4">
                <div className="w-full max-w-lg mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center space-y-4 backdrop-blur-md">
                  <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} />
                    <span>Completed {currentComic.title}</span>
                  </div>

                  {hasNextComic ? (
                    <div className="space-y-3 pt-1">
                      <p className="text-slate-300 text-xs font-medium">
                        Next Chapter: <span className="text-emerald-400 font-bold">{nextComicTitle}</span>
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onLoadNextComic) onLoadNextComic();
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Play size={14} />
                        <span>Read Next Chapter →</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs py-2">
                      🎉 You have completed all chapters in this folder!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isSpreadActive && activePair ? (
          /* Double-Page Spread View */
          <div className="flex items-center justify-center w-full h-full space-x-2">
            {activePair.leftIndex !== null ? (
              <PageImageView
                blobUrl={cachedUrls[activePair.leftIndex]}
                pageIndex={activePair.leftIndex}
                totalPages={currentComic.totalPages}
                fitMode={settings.fitMode}
              />
            ) : (
              <div className="flex-1 h-full bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                <span className="text-xs text-slate-600 font-mono">Blank Margin</span>
              </div>
            )}

            {activePair.rightIndex !== null ? (
              <PageImageView
                blobUrl={cachedUrls[activePair.rightIndex]}
                pageIndex={activePair.rightIndex}
                totalPages={currentComic.totalPages}
                fitMode={settings.fitMode}
              />
            ) : (
              <div className="flex-1 h-full bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                <span className="text-xs text-slate-600 font-mono">Blank Margin</span>
              </div>
            )}
          </div>
        ) : (
          /* Single Page View */
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <PageImageView
              blobUrl={cachedUrls[currentPageIndex]}
              pageIndex={currentPageIndex}
              totalPages={currentComic.totalPages}
              fileName={currentComic.entries[currentPageIndex]?.fileName}
              fitMode={settings.fitMode}
            />

            {/* Paged Mode End of Chapter Floating Continuous Card */}
            {isEndReached && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl text-center space-y-2 z-30 backdrop-blur-md">
                <div className="flex items-center justify-center space-x-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>End of Chapter</span>
                </div>
                <h3 className="text-slate-100 font-bold text-sm truncate">
                  {currentComic.title}
                </h3>

                {hasNextComic ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-300 font-medium truncate pr-2">
                      Next: <span className="text-emerald-400 font-bold">{nextComicTitle}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLoadNextComic) onLoadNextComic();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 shadow-md"
                    >
                      <span>Next Chapter →</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs py-1">
                    🎉 End of Series in this directory
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Scrubber Bar with Smooth Auto-Hide */}
      {settings.showScrubber && (
        <div
          onMouseEnter={() => {
            if (onHoverControlsChange) onHoverControlsChange(true);
            if (onTriggerActivity) onTriggerActivity();
          }}
          onMouseLeave={() => {
            if (onHoverControlsChange) onHoverControlsChange(false);
            if (onTriggerActivity) onTriggerActivity();
          }}
          className={`absolute bottom-4 left-0 right-0 z-30 flex justify-center pointer-events-none transition-all duration-300 ease-in-out ${
            isControlsVisible || !settings.autoHideUI
              ? 'translate-y-0 opacity-100'
              : 'translate-y-16 opacity-0'
          }`}
        >
          <ScrubberBar
            currentPage={currentPageIndex}
            totalPages={currentComic.totalPages}
            onPageChange={onPageChange}
            readingDirection={settings.readingDirection}
          />
        </div>
      )}
    </div>
  );
};
