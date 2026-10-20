import React, { useState } from 'react';
import { X, Pipette, RotateCcw, Check, Sparkles } from 'lucide-react';
import type { Palette } from '../types/garden.ts';

interface BgColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette;
  currentColor?: string;
  onSelectColor: (color?: string) => void;
}

const BG_PRESETS = [
  { name: 'Antique Parchment', hex: '#FAF6F0', tone: 'light' },
  { name: 'Warm Herbarium', hex: '#F6EFE6', tone: 'light' },
  { name: 'Alabaster Ivory', hex: '#FFFFFF', tone: 'light' },
  { name: 'French Linen', hex: '#EFE8DE', tone: 'light' },
  { name: 'Dusty Rose Paper', hex: '#F8EEF0', tone: 'light' },
  { name: 'Antique Celadon', hex: '#EBF1EB', tone: 'light' },
  { name: 'Midnight Obsidian', hex: '#0F111A', tone: 'dark' },
  { name: 'Botanical Noir', hex: '#0A0D0B', tone: 'dark' },
  { name: 'Twilight Velvet', hex: '#141324', tone: 'dark' },
  { name: 'Forest Moss Dark', hex: '#152018', tone: 'dark' },
  { name: 'Coastal Deep Navy', hex: '#0C1620', tone: 'dark' },
  { name: 'Charcoal Slate', hex: '#1E2024', tone: 'dark' },
];

export const BgColorModal: React.FC<BgColorModalProps> = ({
  isOpen,
  onClose,
  palette,
  currentColor,
  onSelectColor,
}) => {
  const isDark = palette.uiTone === 'dark';
  const effectiveBg = currentColor || palette.canvasBg;
  const [customHex, setCustomHex] = useState(effectiveBg);

  if (!isOpen) return null;

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#([0-9A-F]{3}){1,2}$/i.test(customHex)) {
      onSelectColor(customHex);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#121420] border-white/10 text-stone-100'
            : 'bg-[#FAF6F0] border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-full border border-stone-300 dark:border-white/20 shadow-inner"
              style={{ backgroundColor: effectiveBg }}
            />
            <h2 className="text-xl font-serif font-semibold tracking-wide">Canvas Background</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Close background color modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Active Color Preview & Reset to Default */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/20 shadow-sm"
                style={{ backgroundColor: effectiveBg }}
              />
              <div>
                <span className="font-mono text-xs font-semibold block uppercase">
                  {effectiveBg}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                  {currentColor ? 'Custom Background Active' : 'Palette Default Active'}
                </span>
              </div>
            </div>

            {currentColor && (
              <button
                onClick={() => {
                  onSelectColor(undefined);
                  setCustomHex(palette.canvasBg);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/20 text-stone-700 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Reset to palette default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Theme</span>
              </button>
            )}
          </div>

          {/* Preset Swatches Grid */}
          <div>
            <label className="block text-stone-600 dark:text-stone-300 font-medium mb-2.5">
              Curated Botanical Grounds
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {BG_PRESETS.map((preset) => {
                const isSelected = effectiveBg.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    onClick={() => {
                      onSelectColor(preset.hex);
                      setCustomHex(preset.hex);
                    }}
                    className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-[#C92A42] ring-2 ring-[#C92A42]/30 shadow-sm'
                        : 'border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/25'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-lg border border-black/10 dark:border-white/15 mb-1.5 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            preset.tone === 'dark' ? 'text-white' : 'text-stone-900'
                          }`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] leading-tight text-stone-700 dark:text-stone-300 line-clamp-1 font-medium">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker & Hex Input */}
          <div className="pt-2 border-t border-stone-200 dark:border-white/10">
            <label className="block text-stone-600 dark:text-stone-300 font-medium mb-2">
              Custom Hex or Color Picker
            </label>
            <form onSubmit={handleHexSubmit} className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <input
                  type="color"
                  value={effectiveBg.startsWith('#') ? effectiveBg : '#FAF6F0'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHex(val);
                    onSelectColor(val);
                  }}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300 dark:border-white/20 p-0.5 bg-transparent"
                  title="Open Color Wheel"
                />
              </div>

              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="#FAF6F0"
                maxLength={7}
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-white/20 bg-black/5 dark:bg-white/5 font-mono text-sm tracking-wide text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#C92A42]"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#C92A42] hover:bg-[#B32439] text-white font-medium shadow-sm transition-colors"
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
