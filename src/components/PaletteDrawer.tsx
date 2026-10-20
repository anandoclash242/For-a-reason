import React from 'react';
import { X, Check } from 'lucide-react';
import { BOTANICAL_PALETTES } from '../logic/palettes.ts';
import type { Palette } from '../types/garden.ts';

interface PaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPaletteId: string;
  onSelectPalette: (paletteId: string) => void;
  currentPalette: Palette;
}

export const PaletteDrawer: React.FC<PaletteDrawerProps> = ({
  isOpen,
  onClose,
  selectedPaletteId,
  onSelectPalette,
  currentPalette,
}) => {
  if (!isOpen) return null;

  const isDark = currentPalette.uiTone === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#141521] border-white/10 text-stone-100'
            : 'bg-[#FAF6F0] border-stone-200 text-stone-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10">
          <div>
            <h2 className="text-xl font-serif font-semibold tracking-wide">Botanical Color Palettes</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              10 curated color schemes that instantly recolor flowers, stems, and canvas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Close palettes modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Palettes Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BOTANICAL_PALETTES.map((palette) => {
            const isSelected = palette.id === selectedPaletteId;

            return (
              <button
                key={palette.id}
                onClick={() => {
                  onSelectPalette(palette.id);
                }}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative ${
                  isSelected
                    ? 'border-[#C92A42] ring-2 ring-[#C92A42]/30 shadow-md'
                    : isDark
                    ? 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-medium text-sm">{palette.name}</span>
                    {palette.uiTone === 'dark' && (
                      <span className="text-[10px] uppercase font-sans tracking-wider px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                        Dark
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#C92A42] text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 line-clamp-1">
                  {palette.description}
                </p>

                {/* Swatches strip */}
                <div className="flex items-center gap-1.5 h-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 p-0.5 bg-stone-100 dark:bg-stone-900/50">
                  {/* Canvas bg indicator */}
                  <div
                    className="w-5 h-full rounded-sm border border-black/10"
                    style={{ backgroundColor: palette.canvasBg }}
                    title={`Background: ${palette.canvasBg}`}
                  />
                  {/* Stem color */}
                  <div
                    className="w-5 h-full rounded-sm"
                    style={{ backgroundColor: palette.stemColors[0] }}
                    title="Stem color"
                  />
                  {/* Leaf color */}
                  <div
                    className="w-5 h-full rounded-sm"
                    style={{ backgroundColor: palette.leafColors.base }}
                    title="Leaf color"
                  />
                  {/* Flower petal gradient colors */}
                  {palette.rosePetalPalette.slice(0, 4).map((c, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full rounded-sm"
                      style={{ backgroundColor: c }}
                      title={`Petal: ${c}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
