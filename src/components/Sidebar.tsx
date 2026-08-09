import React from 'react';
import {
  BookOpen,
  Clock,
  Sparkles,
  Package,
  Activity,
  FileCheck,
  FolderOpen,
  Layers,
  ChevronRight,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { RecentComicItem, ComicBook } from '../types/comic';
import { SAMPLE_PRESETS } from '../utils/sampleComicGenerator';

interface SidebarProps {
  currentComic: ComicBook | null;
  recentComics: RecentComicItem[];
  onSelectRecent: (item: RecentComicItem) => void;
  onClearRecent: () => void;
  onLoadSample: (presetId: string) => void;
  onOpenFile: () => void;
  onOpenPackager: () => void;
  onOpenTests: () => void;
  isGeneratingSample: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentComic,
  recentComics,
  onSelectRecent,
  onClearRecent,
  onLoadSample,
  onOpenFile,
  onOpenPackager,
  onOpenTests,
  isGeneratingSample,
}) => {
  return (
    <aside className="w-72 bg-slate-900/95 border-r border-white/10 flex flex-col h-full shrink-0 select-none text-slate-300 z-20">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <BookOpen size={16} />
          </div>
          <span className="font-bold text-sm text-white tracking-wide">
            CBZ Reader Studio
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-1.5">
          <button
            onClick={onOpenFile}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium text-xs transition-all"
          >
            <FolderOpen size={16} />
            <span>Open CBZ File...</span>
          </button>

          <button
            onClick={onOpenPackager}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs transition-all"
          >
            <Package size={16} className="text-purple-400" />
            <span>Package Images to CBZ</span>
          </button>
        </div>

        {/* Built-in Sample Comics (1-Click Test Presets) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            <Sparkles size={14} className="text-yellow-400" />
            <span>Sample Comics Presets</span>
          </div>

          <div className="space-y-1.5">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                disabled={isGeneratingSample}
                onClick={() => onLoadSample(preset.id)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 line-clamp-1">
                    {preset.title}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">
                    {preset.genre}
                  </span>
                  <span>{preset.pageCount} Pages</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Reading History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            <div className="flex items-center space-x-1.5">
              <Clock size={14} className="text-blue-400" />
              <span>Recent Library</span>
            </div>
            {recentComics.length > 0 && (
              <button
                onClick={onClearRecent}
                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors flex items-center space-x-1"
                title="Clear Recent History"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {recentComics.length === 0 ? (
            <div className="p-3 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
              No recent files yet. Open or drag a .cbz file to begin.
            </div>
          ) : (
            <div className="space-y-1">
              {recentComics.map((item) => {
                const isActive = currentComic?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectRecent(item)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-medium'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium">{item.title}</div>
                      <div className="text-[10px] text-slate-500">
                        Page {item.lastReadPage + 1} of {item.totalPages}
                      </div>
                    </div>
                    <Layers size={14} className="shrink-0 text-slate-500" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Developer Diagnostics / Test Runner */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Diagnostics & QA
          </div>
          <button
            onClick={onOpenTests}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/50 transition-all"
          >
            <div className="flex items-center space-x-2">
              <Activity size={14} className="text-emerald-400" />
              <span>Run Automated Tests</span>
            </div>
            <FileCheck size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between bg-slate-950/40">
        <span className="flex items-center space-x-1">
          <HardDrive size={12} />
          <span>macOS Sonoma Engine</span>
        </span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
};
