import React, { useState, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import {
  ComicBook,
  ReaderSettings,
  RecentComicItem,
} from './types/comic';
import { MacToolbar } from './components/MacToolbar';
import { Sidebar } from './components/Sidebar';
import { ReaderView } from './components/ReaderView';
import { ComicPackagerModal } from './components/ComicPackagerModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { PreferencesModal } from './components/PreferencesModal';
import { CBZParser } from './utils/cbzParser';
import {
  DirectoryComicItem,
  scanDirectoryForComics,
  loadDirectoryItemBuffer,
} from './utils/directoryReader';

const STORAGE_SETTINGS_KEY = 'cbz_reader_settings_v1';
const STORAGE_RECENTS_KEY = 'cbz_reader_recents_v1';

const DEFAULT_SETTINGS: ReaderSettings = {
  layoutMode: 'paged',
  spreadMode: 'single',
  webtoonWidth: '760px',
  autoHideUI: true,
  autoNextComic: true,
  doublePageSpread: false,
  autoSpreadOnWideScreen: false,
  spreadThresholdPx: 1100,
  readingDirection: 'ltr',
  fitMode: 'fit-screen',
  theme: 'dark',
  lruCacheCapacity: 7,
  firstPageIsCover: true,
  showScrubber: true,
  showDebugHud: false,
  smoothPageTransitions: true,
};

export default function App() {
  const [currentComic, setCurrentComic] = useState<ComicBook | null>(null);
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isLoadingComic, setIsLoadingComic] = useState<boolean>(false);

  // Directory Series Playlist State (Continuous Reading across directory)
  const [directoryItems, setDirectoryItems] = useState<DirectoryComicItem[]>([]);
  const [activeDirectoryIndex, setActiveDirectoryIndex] = useState<number>(-1);

  // Auto-hide UI State (Zen Mode for uninterrupted reading)
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Layout UI State
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [packagerOpen, setPackagerOpen] = useState<boolean>(false);
  const [testsOpen, setTestsOpen] = useState<boolean>(false);
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [preferencesOpen, setPreferencesOpen] = useState<boolean>(false);

  // Preferences & Recent History State
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const layoutMode = parsed.layoutMode || 'paged';
        const spreadMode =
          parsed.spreadMode ||
          (parsed.doublePageSpread ? 'spread' : parsed.autoSpreadOnWideScreen ? 'auto' : 'single');
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          layoutMode,
          spreadMode,
          doublePageSpread: spreadMode === 'spread',
          autoSpreadOnWideScreen: spreadMode === 'auto',
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [recentComics, setRecentComics] = useState<RecentComicItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Settings
  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.spreadMode) {
        updated.doublePageSpread = newSettings.spreadMode === 'spread';
        updated.autoSpreadOnWideScreen = newSettings.spreadMode === 'auto';
      } else if (newSettings.doublePageSpread !== undefined) {
        updated.spreadMode = newSettings.doublePageSpread ? 'spread' : 'single';
        updated.autoSpreadOnWideScreen = false;
      }
      try {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
      return updated;
    });
  };

  // Add or update recent reading item
  const updateRecentHistory = (comic: ComicBook, lastPage: number) => {
    setRecentComics((prev) => {
      const filtered = prev.filter((item) => item.title !== comic.title);
      const newItem: RecentComicItem = {
        id: comic.id,
        fileName: comic.fileName,
        title: comic.title,
        totalPages: comic.totalPages,
        lastReadPage: lastPage,
        lastOpenedAt: Date.now(),
        fileSize: comic.fileSize,
        readingDirection: comic.readingDirection,
      };
      const updated = [newItem, ...filtered].slice(0, 15);
      try {
        localStorage.setItem(STORAGE_RECENTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent comics:', e);
      }
      return updated;
    });
  };

  // Parse and set a comic from an ArrayBuffer or File
  const loadComicBuffer = async (
    buffer: File | ArrayBuffer,
    fileName: string,
    initialPage: number = 0
  ) => {
    setIsLoadingComic(true);
    try {
      const { comic, zipInstance: loadedZip } = await CBZParser.parseCBZFile(
        buffer,
        fileName
      );

      setCurrentComic(comic);
      setZipInstance(loadedZip);
      setCurrentPageIndex(initialPage);

      // Default reading direction if filename hints manga
      if (fileName.toLowerCase().includes('manga') || fileName.toLowerCase().includes('rtl')) {
        handleUpdateSettings({ readingDirection: 'rtl' });
      }

      updateRecentHistory(comic, initialPage);
    } catch (err: any) {
      alert(`Error loading CBZ file: ${err?.message || err}`);
    } finally {
      setIsLoadingComic(false);
    }
  };

  // Select a specific episode item from the directory playlist
  const handleSelectDirectoryItem = useCallback(
    async (item: DirectoryComicItem, index: number) => {
      try {
        setIsLoadingComic(true);
        const { buffer, fileName } = await loadDirectoryItemBuffer(item);
        setActiveDirectoryIndex(index);
        await loadComicBuffer(buffer, fileName, 0);
      } catch (err: any) {
        alert(`Failed to load directory episode: ${err?.message || err}`);
      } finally {
        setIsLoadingComic(false);
      }
    },
    []
  );

  // Load a batch of files or a single file and scan its directory
  const handleOpenFilesOrFolder = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const scannedItems = scanDirectoryForComics(files);
    setDirectoryItems(scannedItems);

    if (scannedItems.length > 0) {
      // Find the index of the primary file if present, else 0
      let initialIdx = 0;
      if (files instanceof FileList && files.length === 1) {
        const targetName = files[0].name;
        const found = scannedItems.findIndex((it) => it.fileName === targetName);
        if (found !== -1) initialIdx = found;
      }
      await handleSelectDirectoryItem(scannedItems[initialIdx], initialIdx);
    }
  };

  // Advance to Next Comic Episode in Directory (Continuous Reading)
  const handleLoadNextComic = useCallback(async () => {
    if (
      activeDirectoryIndex >= 0 &&
      activeDirectoryIndex < directoryItems.length - 1
    ) {
      const nextIdx = activeDirectoryIndex + 1;
      await handleSelectDirectoryItem(directoryItems[nextIdx], nextIdx);
    }
  }, [activeDirectoryIndex, directoryItems, handleSelectDirectoryItem]);

  // Jump back to Previous Comic Episode in Directory
  const handleLoadPrevComic = useCallback(async () => {
    if (activeDirectoryIndex > 0 && directoryItems.length > 0) {
      const prevIdx = activeDirectoryIndex - 1;
      await handleSelectDirectoryItem(directoryItems[prevIdx], prevIdx);
    }
  }, [activeDirectoryIndex, directoryItems, handleSelectDirectoryItem]);

  // Auto-hide controls timer (Zen mode for uninterrupted reading)
  const isHoveringControlsRef = useRef<boolean>(false);
  const isAnyModalOpen = packagerOpen || testsOpen || shortcutsOpen || preferencesOpen;

  const startHideTimer = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (settings.autoHideUI && currentComic && !isHoveringControlsRef.current && !isAnyModalOpen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  }, [settings.autoHideUI, currentComic, isAnyModalOpen]);

  const triggerActivity = useCallback(() => {
    setIsControlsVisible(true);
    startHideTimer();
  }, [startHideTimer]);

  const handleToggleControls = useCallback(() => {
    setIsControlsVisible((prev) => {
      const next = !prev;
      if (next) {
        startHideTimer();
      } else if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      return next;
    });
  }, [startHideTimer]);

  useEffect(() => {
    if (!settings.autoHideUI || isAnyModalOpen || !currentComic) {
      setIsControlsVisible(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    } else {
      startHideTimer();
    }
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [settings.autoHideUI, isAnyModalOpen, currentComic?.id, startHideTimer]);

  // Standard File Picker (Single or Multi-file)
  const handleOpenFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.cbz,.zip,.cbr';
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        await handleOpenFilesOrFolder(files);
      }
    };
    input.click();
  };

  // Folder Picker (Reads entire series folder)
  const handleOpenFolderPicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    (input as any).webkitdirectory = true;
    (input as any).directory = true;
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        await handleOpenFilesOrFolder(files);
      }
    };
    input.click();
  };

  // Page Navigation
  const handlePageChange = useCallback(
    (newIndex: number) => {
      if (!currentComic) return;
      const clamped = Math.max(0, Math.min(currentComic.totalPages - 1, newIndex));
      setCurrentPageIndex(clamped);
      updateRecentHistory(currentComic, clamped);
    },
    [currentComic]
  );

  const nextPage = useCallback(() => {
    if (!currentComic) return;
    const step = settings.doublePageSpread ? 2 : 1;
    handlePageChange(currentPageIndex + step);
  }, [currentComic, settings.doublePageSpread, currentPageIndex, handlePageChange]);

  const prevPage = useCallback(() => {
    if (!currentComic) return;
    const step = settings.doublePageSpread ? 2 : 1;
    handlePageChange(currentPageIndex - step);
  }, [currentComic, settings.doublePageSpread, currentPageIndex, handlePageChange]);

  // Global Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName
        ) ||
        packagerOpen ||
        testsOpen ||
        shortcutsOpen ||
        preferencesOpen
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        prevPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handlePageChange(0);
      } else if (e.key === 'End' && currentComic) {
        e.preventDefault();
        handlePageChange(currentComic.totalPages - 1);
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        handleOpenFilePicker();
      } else if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleUpdateSettings({
          readingDirection: settings.readingDirection === 'ltr' ? 'rtl' : 'ltr',
        });
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleUpdateSettings({
          doublePageSpread: !settings.doublePageSpread,
        });
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nextPage,
    prevPage,
    currentComic,
    settings,
    packagerOpen,
    testsOpen,
    shortcutsOpen,
    preferencesOpen,
    handlePageChange,
  ]);

  // Global Window Drag & Drop Handler
  const handleWindowDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleOpenFilesOrFolder(e.dataTransfer.files);
    }
  };

  const hasNextComic =
    activeDirectoryIndex >= 0 && activeDirectoryIndex < directoryItems.length - 1;
  const hasPrevComic = activeDirectoryIndex > 0 && directoryItems.length > 0;
  const nextComicTitle = hasNextComic
    ? directoryItems[activeDirectoryIndex + 1].fileName
    : undefined;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleWindowDrop}
      className={`w-screen h-screen flex flex-col bg-slate-950 font-sans overflow-hidden select-none ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Top Hover Sensing Hotspot (Reveal UI when hovering top edge in Zen mode) */}
      <div
        onMouseEnter={triggerActivity}
        className="absolute top-0 left-0 right-0 h-3 z-40"
      />

      {/* macOS Sonoma Top Window Chrome Bar with Smooth Auto-Hide */}
      <div
        onMouseEnter={() => {
          isHoveringControlsRef.current = true;
          triggerActivity();
        }}
        onMouseLeave={() => {
          isHoveringControlsRef.current = false;
          triggerActivity();
        }}
        className={`transition-all duration-300 ease-in-out z-30 shrink-0 ${
          isControlsVisible || !settings.autoHideUI || !currentComic
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <MacToolbar
          title={currentComic?.title || 'macOS Native CBZ Reader'}
          subTitle={
            currentComic
              ? `Page ${currentPageIndex + 1} of ${currentComic.totalPages} • ${(
                  currentComic.fileSize /
                  (1024 * 1024)
                ).toFixed(1)} MB`
              : 'Ready to open comic archives'
          }
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenFile={handleOpenFilePicker}
          onOpenFolder={handleOpenFolderPicker}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenPackager={() => setPackagerOpen(true)}
          onOpenTests={() => setTestsOpen(true)}
          onOpenPreferences={() => setPreferencesOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          sidebarOpen={sidebarOpen}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          isControlsVisible={isControlsVisible}
          onToggleControlsVisible={() => setIsControlsVisible((prev) => !prev)}
          hasPrevComic={hasPrevComic}
          hasNextComic={hasNextComic}
          onPrevComic={handleLoadPrevComic}
          onNextComic={handleLoadNextComic}
        />
      </div>

      {/* Main Workspace with Sidebar & Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <Sidebar
            currentComic={currentComic}
            recentComics={recentComics}
            directoryItems={directoryItems}
            activeDirectoryIndex={activeDirectoryIndex}
            onSelectDirectoryItem={handleSelectDirectoryItem}
            onSelectRecent={(item) => {
              // Try to find matching file in directory or prompt
              const foundIdx = directoryItems.findIndex(
                (it) => it.fileName === item.fileName
              );
              if (foundIdx !== -1) {
                handleSelectDirectoryItem(directoryItems[foundIdx], foundIdx);
              } else {
                handleOpenFilePicker();
              }
            }}
            onClearRecent={() => {
              setRecentComics([]);
              localStorage.removeItem(STORAGE_RECENTS_KEY);
            }}
            onOpenFile={handleOpenFilePicker}
            onOpenFolder={handleOpenFolderPicker}
            onOpenPackager={() => setPackagerOpen(true)}
            onOpenTests={() => setTestsOpen(true)}
          />
        )}

        <ReaderView
          currentComic={currentComic}
          zipInstance={zipInstance}
          settings={settings}
          currentPageIndex={currentPageIndex}
          onPageChange={handlePageChange}
          onOpenFile={handleOpenFilePicker}
          onOpenFolder={handleOpenFolderPicker}
          isLoadingComic={isLoadingComic}
          isControlsVisible={isControlsVisible}
          onToggleControls={handleToggleControls}
          onTriggerActivity={triggerActivity}
          onHoverControlsChange={(hovering) => {
            isHoveringControlsRef.current = hovering;
            if (hovering) {
              triggerActivity();
            }
          }}
          onLoadNextComic={handleLoadNextComic}
          nextComicTitle={nextComicTitle}
          hasNextComic={hasNextComic}
        />
      </div>

      {/* Dialog Modals */}
      <ComicPackagerModal
        isOpen={packagerOpen}
        onClose={() => setPackagerOpen(false)}
      />

      <TestRunnerModal
        isOpen={testsOpen}
        onClose={() => setTestsOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <PreferencesModal
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
