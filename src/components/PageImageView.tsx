import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { PageFitMode } from '../types/comic';

interface PageImageViewProps {
  blobUrl?: string;
  pageIndex: number;
  totalPages: number;
  fileName?: string;
  fitMode: PageFitMode;
  onPageClick?: () => void;
  isLoading?: boolean;
  isWebtoon?: boolean;
}

export const PageImageView: React.FC<PageImageViewProps> = ({
  blobUrl,
  pageIndex,
  totalPages,
  fileName,
  fitMode,
  onPageClick,
  isLoading = false,
  isWebtoon = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom on page change
  useEffect(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [pageIndex, blobUrl]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoomLevel(2.2);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Webtoon continuous scroll mode (0 gap, no margins/padding/rounded corners/shadows)
  if (isWebtoon) {
    return (
      <div className="w-full block p-0 m-0 border-0 outline-none text-[0px] leading-[0] align-bottom select-none">
        {isLoading || !blobUrl ? (
          <div className="w-full min-h-[220px] flex items-center justify-center bg-slate-900/50 text-slate-500 py-8 border-0">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mr-2" />
            <span className="text-xs font-mono text-slate-400">Page {pageIndex + 1}</span>
          </div>
        ) : (
          <img
            src={blobUrl}
            alt={fileName || `Page ${pageIndex + 1}`}
            draggable={false}
            decoding="async"
            loading="eager"
            className="w-full h-auto block p-0 m-0 border-0 outline-none rounded-none shadow-none align-bottom text-[0px] leading-[0] transform-gpu object-cover"
          />
        )}
      </div>
    );
  }

  const fitClass =
    fitMode === 'fit-width'
      ? 'w-full max-w-full h-auto object-contain shadow-2xl rounded-sm'
      : fitMode === 'fit-height'
      ? 'h-[88vh] sm:h-[92vh] w-auto max-w-full object-contain shadow-2xl rounded-sm'
      : fitMode === 'original'
      ? 'max-w-none max-h-none shadow-2xl rounded-sm'
      : 'max-h-[88vh] sm:max-h-[92vh] max-w-full w-auto h-auto object-contain shadow-2xl rounded-sm';

  return (
    <div
      ref={containerRef}
      onClick={onPageClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative flex items-center justify-center w-full h-full overflow-hidden select-none transition-colors ${
        zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Zoom controls floating badge if zoomed */}
      {zoomLevel > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs text-white shadow-xl">
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.min(3.5, z + 0.4));
            }}
            className="p-1 hover:text-blue-400"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.max(1, z - 0.4));
            }}
            className="p-1 hover:text-blue-400"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1 hover:text-blue-400"
            title="Reset Zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      {isLoading || !blobUrl ? (
        <div className="flex flex-col items-center justify-center space-y-3 p-8 text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs font-mono">
            Decoding Page {pageIndex + 1} of {totalPages}...
          </span>
        </div>
      ) : (
        <img
          src={blobUrl}
          alt={fileName || `Page ${pageIndex + 1}`}
          draggable={false}
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${
              pan.y / zoomLevel
            }px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className={`${fitClass} shadow-2xl rounded-sm`}
        />
      )}
    </div>
  );
};
