import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ReadingDirection } from '../types/comic';

interface ScrubberBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
  readingDirection: ReadingDirection;
  pageBlobs?: (string | null)[];
  isWebtoon?: boolean;
  scrollRatio?: number;
  onScrollRatioChange?: (ratio: number) => void;
}

export const ScrubberBar: React.FC<ScrubberBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  readingDirection,
  isWebtoon = false,
  scrollRatio = 0,
  onScrollRatioChange,
}) => {
  const [hoverPage, setHoverPage] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState<number>(scrollRatio);
  const [dragPage, setDragPage] = useState<number>(currentPage);

  // Sync drag states when not dragging
  useEffect(() => {
    if (!isDragging) {
      setDragPage(currentPage);
      setDragRatio(scrollRatio);
    }
  }, [currentPage, scrollRatio, isDragging]);

  if (totalPages <= 0) return null;

  const currentRatio = isDragging ? dragRatio : scrollRatio;
  const displayPage = isDragging ? dragPage : currentPage;

  const progressPercent = isWebtoon
    ? Math.max(0, Math.min(100, currentRatio * 100))
    : totalPages > 1
    ? (displayPage / (totalPages - 1)) * 100
    : 0;

  const handleSliderInput = (rawVal: number) => {
    if (isWebtoon && onScrollRatioChange) {
      const ratio = Math.max(0, Math.min(1, rawVal / 1000));
      setDragRatio(ratio);
      const estPage = Math.min(totalPages - 1, Math.floor(ratio * totalPages));
      setDragPage(estPage);
      setHoverPage(estPage);
      onScrollRatioChange(ratio);
    } else {
      const clamped = Math.max(0, Math.min(totalPages - 1, rawVal));
      setDragPage(clamped);
      setHoverPage(clamped);
      onPageChange(clamped);
    }
  };

  const sliderMax = isWebtoon ? 1000 : totalPages - 1;
  const sliderValue = isWebtoon
    ? Math.round((isDragging ? dragRatio : scrollRatio) * 1000)
    : displayPage;

  return (
    <div className="w-full max-w-xl shrink-0 min-w-[280px] bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 shadow-2xl flex flex-col space-y-2 text-white select-none pointer-events-auto">
      {/* Top Header Controls & Page Counter */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-200 px-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
            title="First Page"
            className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            title="Previous Page"
            className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Active Page Indicator */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-blue-400 text-xs sm:text-sm whitespace-nowrap">
            Page <span className="text-white font-bold">{displayPage + 1}</span>{' '}
            <span className="text-slate-500">/</span> {totalPages}
          </span>
          {hoverPage !== null && hoverPage !== displayPage && (
            <span className="text-yellow-400 font-medium text-xs bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded">
              Seek: {hoverPage + 1}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            title="Next Page"
            className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            title="Last Page"
            className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>

      {/* Ultra-Smooth Scrubber Range Input Slider */}
      <div className="relative flex items-center w-full min-w-0 py-1 group">
        {/* Track Background */}
        <div className="absolute left-0 right-0 h-2 bg-slate-800 rounded-lg overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-75 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={sliderMax}
          value={sliderValue}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => handleSliderInput(parseFloat(e.target.value))}
          onInput={(e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            handleSliderInput(val);
          }}
          onMouseLeave={() => {
            setHoverPage(null);
            setIsDragging(false);
          }}
          className="relative z-10 w-full min-w-0 h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-blue-400 focus:outline-none opacity-90 group-hover:opacity-100"
        />
      </div>

      {/* Filmstrip Quick Dot Indicators */}
      <div className="flex items-center justify-between px-1 pt-0.5 overflow-hidden">
        {Array.from({ length: Math.min(24, totalPages) }).map((_, idx) => {
          const step = Math.max(1, Math.floor(totalPages / 24));
          const targetPage = Math.min(totalPages - 1, idx * step);
          const isCurrent =
            displayPage >= targetPage &&
            displayPage < Math.min(totalPages, targetPage + step);

          return (
            <button
              key={idx}
              onClick={() => onPageChange(targetPage)}
              onMouseEnter={() => setHoverPage(targetPage)}
              onMouseLeave={() => setHoverPage(null)}
              title={`Jump to Page ${targetPage + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                isCurrent
                  ? 'w-4 bg-blue-400 shadow-sm shadow-blue-400/50'
                  : 'w-1.5 bg-slate-700 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
