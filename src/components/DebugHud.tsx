import React from 'react';
import { Cpu, HardDrive, Layers, Clock, Zap } from 'lucide-react';
import { DiagnosticStats } from '../types/comic';

interface DebugHudProps {
  stats: DiagnosticStats;
  totalPageCount: number;
  currentPageIndex: number;
}

export const DebugHud: React.FC<DebugHudProps> = ({
  stats,
  totalPageCount,
  currentPageIndex,
}) => {
  return (
    <div className="absolute top-16 left-4 z-20 bg-slate-950/85 backdrop-blur-xl border border-white/15 rounded-xl p-3 shadow-2xl text-[11px] font-mono text-slate-300 w-64 space-y-2 select-none animate-in fade-in duration-150">
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-bold text-blue-400">
        <span className="flex items-center space-x-1.5">
          <Cpu size={14} />
          <span>LRU Diagnostic HUD</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[9px] uppercase">
          Live
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">LRU Cached Pages:</span>
          <span className="font-bold text-white">
            {stats.cachedPageIndices.length} / {totalPageCount}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Est. RAM Memory:</span>
          <span className="font-bold text-emerald-400">
            {stats.estimatedMemoryMb} MB
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Extraction Speed:</span>
          <span className="font-bold text-yellow-400">
            {stats.lastExtractionTimeMs} ms
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Hit / Miss Ratio:</span>
          <span className="font-bold text-purple-300">
            {stats.cacheHitCount}H / {stats.missCount}M
          </span>
        </div>
      </div>

      <div className="pt-1 border-t border-white/10 text-[10px] text-slate-500 flex flex-wrap gap-1">
        <span>Window Keys:</span>
        <span className="text-slate-300">
          [{stats.cachedPageIndices.join(', ')}]
        </span>
      </div>
    </div>
  );
};
