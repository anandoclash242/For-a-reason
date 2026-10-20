import React from 'react';
import { X, Command } from 'lucide-react';
import type { Palette } from '../types/garden.ts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, palette }) => {
  if (!isOpen) return null;
  const isDark = palette.uiTone === 'dark';

  const shortcuts = [
    { key: 'Space', desc: 'Prune / sever a random vine (when canvas is active)', scope: 'Canvas' },
    { key: 'Backspace', desc: 'Wither the last character with falling petals', scope: 'Canvas' },
    { key: 'R', desc: 'Randomize garden growth seed & variation', scope: 'Global' },
    { key: 'P', desc: 'Open Poster Studio mode', scope: 'Global' },
    { key: 'F', desc: 'Toggle Fullscreen exhibition mode', scope: 'Global' },
    { key: 'Ctrl + Z', desc: 'Undo text editing', scope: 'Global' },
    { key: 'Ctrl + Y', desc: 'Redo text editing', scope: 'Global' },
    { key: 'Click / Tap', desc: 'Summon fluttering butterflies', scope: 'Interactive' },
    { key: 'Pointer Move', desc: 'Tilt nearby blooming roses toward cursor', scope: 'Interactive' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#121420] border-white/10 text-stone-100'
            : 'bg-[#FAF6F0] border-stone-200 text-stone-900'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-[#C92A42]" />
            <h2 className="text-xl font-serif font-semibold tracking-wide">Keyboard & Interactions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 text-xs">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5"
            >
              <div className="flex flex-col pr-3">
                <span className="font-medium text-stone-800 dark:text-stone-200">{item.desc}</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">{item.scope}</span>
              </div>
              <kbd className="px-2 py-1 rounded-lg border border-stone-300 dark:border-white/20 bg-stone-100 dark:bg-stone-800 font-mono font-medium text-stone-700 dark:text-stone-300 shadow-sm whitespace-nowrap">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
