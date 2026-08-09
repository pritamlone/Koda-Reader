import React from 'react';
import { HelpCircle, X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Right Arrow / J', desc: 'Next Page (or next spread)' },
    { key: 'Left Arrow / K', desc: 'Previous Page (or previous spread)' },
    { key: 'Spacebar', desc: 'Advance 1 Page' },
    { key: 'Home / End', desc: 'Jump to First / Last Page' },
    { key: 'Cmd + O', desc: 'Open CBZ or ZIP File' },
    { key: 'Cmd + \\', desc: 'Toggle Sidebar' },
    { key: 'M', desc: 'Toggle Manga Mode (RTL vs LTR)' },
    { key: 'S', desc: 'Toggle Two-Page Spread Mode' },
    { key: 'Double Click Page', desc: 'Zoom In / Out' },
    { key: 'F', desc: 'Toggle Fullscreen Reader' },
    { key: '?', desc: 'Show / Hide Keyboard Shortcuts' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Command size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                macOS Reader Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-slate-400">
                Native hotkeys for swift desktop navigation
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

        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
            >
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-[11px] text-blue-400 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-white/10 bg-slate-950/60 text-right text-[11px] text-slate-400">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800">Esc</kbd> or click ✕ to close
        </div>
      </div>
    </div>
  );
};
