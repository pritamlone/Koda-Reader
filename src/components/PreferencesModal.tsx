import React from 'react';
import { Settings, X, Sliders, Moon, Sun, Monitor, HardDrive, BookOpen, Rows, Columns, Square, Maximize } from 'lucide-react';
import { ReaderSettings, ReaderTheme, PageFitMode, ReaderLayoutMode, SpreadMode } from '../types/comic';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const activeSpreadMode: SpreadMode =
    settings.spreadMode || (settings.doublePageSpread ? 'spread' : settings.autoSpreadOnWideScreen ? 'auto' : 'single');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Reader Preferences</h3>
              <p className="text-[11px] text-slate-400">
                Customize layout mode, page spread, caching & themes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs max-h-[65vh] overflow-y-auto">
          {/* Reader Layout Mode: Paged vs Webtoon */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Reader Layout Mode</span>
              <span className="text-[10px] text-blue-400 font-mono uppercase">
                {settings.layoutMode || 'paged'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ layoutMode: 'paged' })}
                className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 transition-all text-left ${
                  (settings.layoutMode || 'paged') === 'paged'
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <BookOpen size={16} className="text-blue-400" />
                  <span>Paged Mode</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  Standard book flip with single or double-page spreads
                </p>
              </button>

              <button
                onClick={() => onUpdateSettings({ layoutMode: 'webtoon' })}
                className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 transition-all text-left ${
                  settings.layoutMode === 'webtoon'
                    ? 'bg-emerald-600/25 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <Rows size={16} className="text-emerald-400" />
                  <span>Webtoon Scroll</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  Continuous vertical scroll for webcomics & manhwa
                </p>
              </button>
            </div>
          </div>

          {/* Webtoon Container Width Scrollbar (Webtoon Mode) */}
          {settings.layoutMode === 'webtoon' && (() => {
            const isFullWidth = settings.webtoonWidth === '100%';
            const numericPx = isFullWidth ? 1400 : parseInt(settings.webtoonWidth || '500', 10) || 500;

            return (
              <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/80">
                <div className="flex items-center justify-between font-semibold text-slate-200 text-xs">
                  <span className="flex items-center space-x-1.5">
                    <Maximize size={14} className="text-emerald-400" />
                    <span>Webtoon Strip Width</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-xs">
                    {isFullWidth || numericPx >= 1380 ? '100% (Full Width)' : `${numericPx} px`}
                  </span>
                </div>

                {/* Preset Width Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '500px (Default)', val: '500px' },
                    { label: '680px', val: '680px' },
                    { label: '900px', val: '900px' },
                    { label: 'Full', val: '100%' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => onUpdateSettings({ webtoonWidth: preset.val })}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        settings.webtoonWidth === preset.val || (preset.val === '500px' && (!settings.webtoonWidth || settings.webtoonWidth === '500px'))
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Refined Interactive Range Scrollbar */}
                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min={380}
                    max={1400}
                    step={20}
                    value={numericPx}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateSettings({ webtoonWidth: val >= 1380 ? '100%' : `${val}px` });
                    }}
                    className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
                    <span>380px</span>
                    <span>500px (Def)</span>
                    <span>800px</span>
                    <span>1100px</span>
                    <span>Full Width</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Uninterrupted Reading & Continuous Queue Toggles */}
          <div className="space-y-2 pt-1">
            <label className="block font-semibold text-slate-300">
              Uninterrupted Reading & Auto-Play
            </label>

            {/* Auto-Hide UI Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <div>
                <span className="font-semibold text-slate-200 text-xs">
                  Auto-Hide UI Controls (Zen Mode)
                </span>
                <p className="text-[10px] text-slate-400">
                  Automatically hides window chrome and toolbars after 3s of inactivity or scrolling
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoHideUI}
                onChange={(e) => onUpdateSettings({ autoHideUI: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Continuous Series Reading Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <div>
                <span className="font-semibold text-slate-200 text-xs">
                  Continuous Series Reading (Auto Next Chapter)
                </span>
                <p className="text-[10px] text-slate-400">
                  Like folder video playback: automatically loads & queues the next comic when reaching the end
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoNextComic}
                onChange={(e) => onUpdateSettings({ autoNextComic: e.target.checked })}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Page Spread Options (Paged Mode only) */}
          {settings.layoutMode !== 'webtoon' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Page Display & Spread Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'single', label: 'Single Page', icon: Square },
                  { id: 'spread', label: 'Two Spread', icon: Columns },
                  { id: 'auto', label: 'Auto Spread', icon: Maximize },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = activeSpreadMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onUpdateSettings({ spreadMode: item.id as SpreadMode })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1 font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <IconComp size={16} />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Canvas Theme Selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Canvas Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['dark', 'sepia', 'light', 'oled'] as ReaderTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => onUpdateSettings({ theme: thm })}
                  className={`p-2 rounded-xl border text-center font-medium capitalize transition-all ${
                    settings.theme === thm
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>
          </div>

          {/* Spread Threshold Slider (if Auto Spread is active) */}
          {activeSpreadMode === 'auto' && (
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Auto Double-Page Spread Threshold</span>
                <span className="text-blue-400 font-mono">
                  {settings.spreadThresholdPx} px
                </span>
              </div>
              <input
                type="range"
                min={800}
                max={1800}
                step={50}
                value={settings.spreadThresholdPx}
                onChange={(e) =>
                  onUpdateSettings({ spreadThresholdPx: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Automatically switches to two-page spread when container width exceeds this threshold.
              </p>
            </div>
          )}

          {/* LRU Capacity */}
          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>LRU Memory Cache Capacity</span>
              <span className="text-purple-400 font-mono">
                {settings.lruCacheCapacity} Pages
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={settings.lruCacheCapacity}
              onChange={(e) =>
                onUpdateSettings({ lruCacheCapacity: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Keeps decoded image blobs in memory for instant paging. Unused pages are revoked.
            </p>
          </div>

          {/* Diagnostic HUD Checkbox */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div>
              <span className="font-semibold text-slate-200">
                Show Diagnostic Memory HUD
              </span>
              <p className="text-[10px] text-slate-400">
                Displays live LRU cache size, memory MBs, and extraction times
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showDebugHud}
              onChange={(e) => onUpdateSettings({ showDebugHud: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
