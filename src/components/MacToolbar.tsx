import React from 'react';
import {
  Sidebar as SidebarIcon,
  Columns,
  Square,
  BookOpen,
  FolderOpen,
  Settings,
  Package,
  Activity,
  Maximize,
  HelpCircle,
  Sun,
  Moon,
  Compass,
  Rows,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ReaderSettings, ReadingDirection, ReaderLayoutMode, SpreadMode, WebtoonWidth } from '../types/comic';

interface MacToolbarProps {
  title: string;
  subTitle?: string;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  onOpenFile: () => void;
  onToggleSidebar: () => void;
  onOpenPackager: () => void;
  onOpenTests: () => void;
  onOpenPreferences: () => void;
  onOpenShortcuts: () => void;
  sidebarOpen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isControlsVisible?: boolean;
  onToggleControlsVisible?: () => void;
}

export const MacToolbar: React.FC<MacToolbarProps> = ({
  title,
  subTitle,
  settings,
  onUpdateSettings,
  onOpenFile,
  onToggleSidebar,
  onOpenPackager,
  onOpenTests,
  onOpenPreferences,
  onOpenShortcuts,
  sidebarOpen,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const activeSpreadMode: SpreadMode =
    settings.spreadMode || (settings.doublePageSpread ? 'spread' : settings.autoSpreadOnWideScreen ? 'auto' : 'single');

  return (
    <header className="h-12 border-b border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-3 select-none z-30 shrink-0 text-slate-200">
      {/* Left: Window Traffic Lights & Sidebar Toggle */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 group pr-1">
          <button
            onClick={onToggleFullscreen}
            title="Close / Toggle Fullscreen"
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-[8px] text-red-950 font-bold opacity-90 group-hover:opacity-100"
          >
            ✕
          </button>
          <button
            onClick={onToggleSidebar}
            title="Minimize / Toggle Sidebar"
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center text-[8px] text-yellow-950 font-bold opacity-90 group-hover:opacity-100"
          >
            −
          </button>
          <button
            onClick={onToggleFullscreen}
            title="Maximize / Fullscreen"
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center text-[8px] text-green-950 font-bold opacity-90 group-hover:opacity-100"
          >
            ⤢
          </button>
        </div>

        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all ${
            sidebarOpen ? 'bg-white/10 text-white' : ''
          }`}
          title="Toggle Sidebar (Cmd+\)"
        >
          <SidebarIcon size={16} />
        </button>

        <button
          onClick={onOpenFile}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-sm"
          title="Open CBZ / ZIP File (Cmd+O)"
        >
          <FolderOpen size={14} />
          <span>Open CBZ</span>
        </button>
      </div>

      {/* Middle: Title Bar */}
      <div className="flex flex-col items-center justify-center text-center max-w-md px-2 truncate">
        <span className="text-xs font-semibold tracking-wide text-slate-100 truncate">
          {title}
        </span>
        {subTitle && (
          <span className="text-[10px] text-slate-400 truncate -mt-0.5">
            {subTitle}
          </span>
        )}
      </div>

      {/* Right: Quick Settings & Toolbar Controls */}
      <div className="flex items-center space-x-1">
        {/* Layout Mode Toggle (Paged vs Webtoon) */}
        <button
          onClick={() =>
            onUpdateSettings({
              layoutMode: settings.layoutMode === 'webtoon' ? 'paged' : 'webtoon',
            })
          }
          className={`px-2 py-1 rounded-md text-xs font-medium border transition-all flex items-center space-x-1 ${
            settings.layoutMode === 'webtoon'
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle Reader Layout Mode (Paged vs Webtoon Vertical Continuous Scroll)"
        >
          {settings.layoutMode === 'webtoon' ? <Rows size={14} /> : <BookOpen size={14} />}
          <span className="hidden sm:inline text-[11px]">
            {settings.layoutMode === 'webtoon' ? 'Webtoon' : 'Paged'}
          </span>
        </button>

        {/* Spread Mode Toggle (Only in Paged Mode) */}
        {settings.layoutMode !== 'webtoon' && (
          <button
            onClick={() => {
              const currentMode = settings.spreadMode || (settings.doublePageSpread ? 'spread' : settings.autoSpreadOnWideScreen ? 'auto' : 'single');
              const nextMode: SpreadMode =
                currentMode === 'single' ? 'spread' : currentMode === 'spread' ? 'auto' : 'single';
              onUpdateSettings({ spreadMode: nextMode });
            }}
            className={`p-1.5 rounded-md text-xs flex items-center space-x-1 transition-all ${
              activeSpreadMode === 'spread'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                : activeSpreadMode === 'auto'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={`Spread Mode: ${activeSpreadMode.toUpperCase()} (Click to toggle Single / Spread / Auto)`}
          >
            {activeSpreadMode === 'spread' ? (
              <Columns size={16} />
            ) : activeSpreadMode === 'auto' ? (
              <Maximize size={16} />
            ) : (
              <Square size={16} />
            )}
            <span className="hidden md:inline text-[11px] font-medium capitalize">
              {activeSpreadMode === 'auto' ? 'Auto Spread' : activeSpreadMode}
            </span>
          </button>
        )}

        {/* Manga RTL / Western LTR Toggle */}
        <button
          onClick={() => {
            const nextDir: ReadingDirection =
              settings.readingDirection === 'ltr' ? 'rtl' : 'ltr';
            onUpdateSettings({ readingDirection: nextDir });
          }}
          className={`px-2 py-1 rounded-md text-xs font-medium border transition-all flex items-center space-x-1 ${
            settings.readingDirection === 'rtl'
              ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle Reading Direction (Manga RTL vs Western LTR)"
        >
          <BookOpen size={14} />
          <span className="text-[11px]">
            {settings.readingDirection === 'rtl' ? 'Manga (RTL)' : 'LTR'}
          </span>
        </button>

        {/* Theme quick selector */}
        <button
          onClick={() => {
            const themes: ReaderSettings['theme'][] = ['dark', 'sepia', 'light', 'oled'];
            const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
            onUpdateSettings({ theme: themes[nextIdx] });
          }}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title={`Theme: ${settings.theme.toUpperCase()} (Click to toggle)`}
        >
          {settings.theme === 'light' ? (
            <Sun size={16} />
          ) : settings.theme === 'sepia' ? (
            <Compass size={16} />
          ) : (
            <Moon size={16} />
          )}
        </button>

        {/* Zen Mode / Auto-Hide UI Toggle Button */}
        <button
          onClick={() => {
            onUpdateSettings({ autoHideUI: !settings.autoHideUI });
          }}
          className={`px-2 py-1 rounded-md text-xs font-medium border transition-all flex items-center space-x-1 ${
            settings.autoHideUI
              ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title={settings.autoHideUI ? 'Auto-Hide UI: ON (Zen Mode - Controls hide while reading)' : 'Auto-Hide UI: OFF (Controls stay fixed)'}
        >
          {settings.autoHideUI ? <EyeOff size={14} className="text-emerald-400" /> : <Eye size={14} />}
          <span className="hidden lg:inline text-[11px]">
            {settings.autoHideUI ? 'Zen Mode' : 'Fixed UI'}
          </span>
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Packager Modal */}
        <button
          onClick={onOpenPackager}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Package Images to CBZ"
        >
          <Package size={16} />
        </button>

        {/* Tests Modal */}
        <button
          onClick={onOpenTests}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Automated Test Suite"
        >
          <Activity size={16} />
        </button>

        {/* Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={16} />
        </button>

        {/* Preferences / Settings */}
        <button
          onClick={onOpenPreferences}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Preferences (Cmd+,)"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
