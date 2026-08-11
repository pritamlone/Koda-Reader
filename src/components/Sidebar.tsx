import React from 'react';
import {
  BookOpen,
  Clock,
  Package,
  Activity,
  FileCheck,
  FolderOpen,
  Layers,
  HardDrive,
  Trash2,
  FolderTree,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';
import { RecentComicItem, ComicBook } from '../types/comic';
import { DirectoryComicItem } from '../utils/directoryReader';

interface SidebarProps {
  currentComic: ComicBook | null;
  recentComics: RecentComicItem[];
  directoryItems: DirectoryComicItem[];
  activeDirectoryIndex: number;
  onSelectDirectoryItem: (item: DirectoryComicItem, index: number) => void;
  onSelectRecent: (item: RecentComicItem) => void;
  onClearRecent: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onOpenPackager: () => void;
  onOpenTests: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentComic,
  recentComics,
  directoryItems,
  activeDirectoryIndex,
  onSelectDirectoryItem,
  onSelectRecent,
  onClearRecent,
  onOpenFile,
  onOpenFolder,
  onOpenPackager,
  onOpenTests,
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
            Koda Reader
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenFile}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium text-xs transition-all"
              title="Open CBZ / ZIP Archive"
            >
              <FolderOpen size={15} />
              <span className="truncate">Open File</span>
            </button>

            <button
              onClick={onOpenFolder}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium text-xs transition-all"
              title="Open Entire Series Directory Folder"
            >
              <FolderTree size={15} />
              <span className="truncate">Open Folder</span>
            </button>
          </div>

          <button
            onClick={onOpenPackager}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs transition-all"
          >
            <Package size={16} className="text-purple-400" />
            <span>Package Images to CBZ</span>
          </button>
        </div>

        {/* Directory Series / Continuous Playlist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            <div className="flex items-center space-x-1.5">
              <FolderTree size={14} className="text-emerald-400" />
              <span>Folder Playlist</span>
            </div>
            {directoryItems.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                {directoryItems.length} {directoryItems.length === 1 ? 'file' : 'files'}
              </span>
            )}
          </div>

          {directoryItems.length === 0 ? (
            <div className="p-3 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs leading-relaxed">
              Open a CBZ file or folder to automatically load and read all series episodes continuously.
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {directoryItems.map((item, idx) => {
                const isActive = idx === activeDirectoryIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectDirectoryItem(item, idx)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-medium'
                        : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-1">
                      {isActive ? (
                        <PlayCircle size={14} className="shrink-0 text-emerald-400 animate-pulse" />
                      ) : (
                        <span className="text-[10px] font-mono shrink-0 w-4 text-slate-500 group-hover:text-slate-300">
                          {idx + 1}.
                        </span>
                      )}
                      <span className="truncate text-xs">{item.fileName}</span>
                    </div>
                    {isActive && (
                      <CheckCircle2 size={13} className="shrink-0 text-emerald-400 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
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

