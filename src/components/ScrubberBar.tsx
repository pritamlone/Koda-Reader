import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReadingDirection } from '../types/comic';

interface ScrubberBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
  readingDirection: ReadingDirection;
  pageBlobs?: (string | null)[];
}

export const ScrubberBar: React.FC<ScrubberBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  readingDirection,
  pageBlobs = [],
}) => {
  const [hoverPage, setHoverPage] = useState<number | null>(null);

  if (totalPages <= 0) return null;

  return (
    <div className="w-full max-w-xl shrink-0 min-w-[280px] bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl flex flex-col space-y-2 text-white select-none pointer-events-auto">
      {/* Top Header Label */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-200 px-1">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="font-semibold text-blue-400 text-xs sm:text-sm whitespace-nowrap">
          Page {currentPage + 1} <span className="text-slate-500">/</span> {totalPages}
          {hoverPage !== null && hoverPage !== currentPage && (
            <span className="ml-2 text-yellow-400 font-normal text-xs">
              (Preview: {hoverPage + 1})
            </span>
          )}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Scrubber Range Input Slider */}
      <div className="relative flex items-center w-full min-w-0 py-0.5">
        <input
          type="range"
          min={0}
          max={totalPages - 1}
          value={currentPage}
          onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
          onInput={(e) => setHoverPage(parseInt((e.target as HTMLInputElement).value, 10))}
          onMouseLeave={() => setHoverPage(null)}
          className="w-full min-w-0 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        />
      </div>

      {/* Filmstrip Quick Dot Indicators */}
      <div className="flex items-center justify-between px-1 pt-0.5 overflow-hidden">
        {Array.from({ length: Math.min(24, totalPages) }).map((_, idx) => {
          const step = Math.max(1, Math.floor(totalPages / 24));
          const targetPage = Math.min(totalPages - 1, idx * step);
          const isCurrent =
            currentPage >= targetPage &&
            currentPage < Math.min(totalPages, targetPage + step);

          return (
            <button
              key={idx}
              onClick={() => onPageChange(targetPage)}
              title={`Jump to Page ${targetPage + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                isCurrent
                  ? 'w-4 bg-blue-500 shadow-sm shadow-blue-500/50'
                  : 'w-1.5 bg-slate-700 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
