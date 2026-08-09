import React, { useState } from 'react';
import { Package, X, Upload, Download, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import { packageImagesToCBZ, triggerDownload } from '../utils/cbzPackager';

interface ComicPackagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComicPackagerModal: React.FC<ComicPackagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [archiveName, setArchiveName] = useState('My_Custom_Comic');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPackaging, setIsPackaging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = (Array.from(e.target.files) as File[]).filter((f) =>
        f.type.startsWith('image/')
      );
      setSelectedFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArr = (Array.from(e.dataTransfer.files) as File[]).filter((f) =>
        f.type.startsWith('image/')
      );
      setSelectedFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePackageAndDownload = async () => {
    if (selectedFiles.length === 0) return;

    setIsPackaging(true);
    setStatusMessage('Compressing image pages into CBZ archive...');

    try {
      const { blob, fileName } = await packageImagesToCBZ(selectedFiles, archiveName);
      triggerDownload(blob, fileName);
      setStatusMessage(`Successfully generated and downloaded "${fileName}"!`);
    } catch (err: any) {
      setStatusMessage(`Packaging failed: ${err?.message || err}`);
    } finally {
      setIsPackaging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Package size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                CBZ Archiver & Packager
              </h3>
              <p className="text-[11px] text-slate-400">
                Bundle your image pages (JPG, PNG, WebP) into a standard .cbz file
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Archive Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Comic Archive Name
            </label>
            <input
              type="text"
              value={archiveName}
              onChange={(e) => setArchiveName(e.target.value)}
              placeholder="e.g. My_Custom_Comic"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-xl p-6 text-center bg-slate-800/40 transition-all flex flex-col items-center justify-center cursor-pointer relative"
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload size={28} className="text-purple-400 mb-2" />
            <span className="text-xs font-medium text-slate-200">
              Drag & drop image pages here, or click to browse
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Files will be sorted naturally by file name (e.g., 01.jpg, 02.jpg)
            </span>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Selected Pages ({selectedFiles.length})</span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-red-400 hover:underline text-[11px]"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-slate-800 rounded-lg p-1.5 bg-slate-950/40">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs px-2 py-1 rounded bg-slate-800/80 text-slate-300"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileImage size={14} className="text-purple-400 shrink-0" />
                      <span className="truncate font-mono">{file.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="text-slate-500 hover:text-red-400 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-500/40 text-xs text-blue-300 flex items-center space-x-2">
              <CheckCircle size={16} className="text-blue-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Output format: Standard .cbz (ZIP archive)
          </span>
          <button
            disabled={selectedFiles.length === 0 || isPackaging}
            onClick={handlePackageAndDownload}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-medium text-xs shadow-lg transition-all"
          >
            <Download size={14} />
            <span>{isPackaging ? 'Packaging...' : 'Generate & Download CBZ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
