import React, { useState } from 'react';
import {
  Shuffle,
  Trash2,
  Download,
  Scissors,
  RotateCcw,
  Undo2,
  Redo2,
  Sliders,
  Play,
  Pause,
  BookmarkPlus,
  Share2,
} from 'lucide-react';
import type { GardenSettings, Palette } from '../types/garden.ts';

interface BottomToolbarProps {
  settings: GardenSettings;
  palette: Palette;
  onUpdateSettings: (partial: Partial<GardenSettings>) => void;
  onRandomize: () => void;
  onClear: () => void;
  onDownload: () => void;
  onCutVine: () => void;
  onWitherLetter: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSaveGarden: () => void;
  onShare: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  settings,
  palette,
  onUpdateSettings,
  onRandomize,
  onClear,
  onDownload,
  onCutVine,
  onWitherLetter,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSaveGarden,
  onShare,
}) => {
  const [showSliders, setShowSliders] = useState(false);
  const isDark = palette.uiTone === 'dark';

  return (
    <div className="relative z-30 w-full max-w-4xl mx-auto px-4 pb-4 pt-1">
      {/* Expandable Botanical Sliders Panel */}
      {showSliders && (
        <div
          className={`mb-3 p-4 rounded-2xl border backdrop-blur-xl transition-all shadow-xl ${
            isDark
              ? 'bg-[#12141F]/90 border-white/10 text-stone-100 shadow-black/40'
              : 'bg-[#FAF6F0]/95 border-stone-300 text-stone-800 shadow-stone-400/20'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-stone-500 dark:text-stone-400 font-medium">
                <span>Font Scale</span>
                <span className="font-mono tabular-nums">{Math.round(settings.fontSize)}px</span>
              </div>
              <input
                type="range"
                min="40"
                max="130"
                step="2"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-[#C92A42] cursor-pointer h-1.5 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none"
                aria-label="Font scale slider"
              />
            </div>

            {/* Growth Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-stone-500 dark:text-stone-400 font-medium">
                <span>Branching Density</span>
                <span className="font-mono tabular-nums">{settings.growthDensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={settings.growthDensity}
                onChange={(e) => onUpdateSettings({ growthDensity: Number(e.target.value) })}
                className="w-full accent-[#3A533E] cursor-pointer h-1.5 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none"
                aria-label="Growth density slider"
              />
            </div>

            {/* Flower Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-stone-500 dark:text-stone-400 font-medium">
                <span>Rose Bloom Size</span>
                <span className="font-mono tabular-nums">{settings.flowerSize.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={settings.flowerSize}
                onChange={(e) => onUpdateSettings({ flowerSize: Number(e.target.value) })}
                className="w-full accent-[#D1586D] cursor-pointer h-1.5 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none"
                aria-label="Flower size slider"
              />
            </div>
          </div>

          {/* Letterform Typography Settings Row */}
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.showTextLetterforms}
                    onChange={(e) => onUpdateSettings({ showTextLetterforms: e.target.checked })}
                    className="rounded text-[#C92A42] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Show Typography Letterforms</span>
                </label>
              </div>

              {settings.showTextLetterforms && (
                <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                  <button
                    onClick={() => onUpdateSettings({ textStyle: 'calligraphy' })}
                    className={`flex-1 py-1 px-2 rounded-md transition-all ${
                      settings.textStyle === 'calligraphy'
                        ? 'bg-white dark:bg-white/20 shadow-sm font-semibold text-stone-900 dark:text-white'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Calligraphy
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ textStyle: 'outline' })}
                    className={`flex-1 py-1 px-2 rounded-md transition-all ${
                      settings.textStyle === 'outline'
                        ? 'bg-white dark:bg-white/20 shadow-sm font-semibold text-stone-900 dark:text-white'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Outline
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ textStyle: 'subtle' })}
                    className={`flex-1 py-1 px-2 rounded-md transition-all ${
                      settings.textStyle === 'subtle'
                        ? 'bg-white dark:bg-white/20 shadow-sm font-semibold text-stone-900 dark:text-white'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Subtle
                  </button>
                </div>
              )}
            </div>

            {/* Text Opacity Slider */}
            {settings.showTextLetterforms && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-stone-500 dark:text-stone-400 font-medium">
                  <span>Letterform Opacity</span>
                  <span className="font-mono tabular-nums">{Math.round(settings.textOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.textOpacity}
                  onChange={(e) => onUpdateSettings({ textOpacity: Number(e.target.value) })}
                  className="w-full accent-[#C92A42] cursor-pointer h-1.5 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none"
                  aria-label="Text opacity slider"
                />
              </div>
            )}
          </div>

          {/* Secondary Switches row */}
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isAnimated}
                  onChange={(e) => onUpdateSettings({ isAnimated: e.target.checked })}
                  className="rounded text-[#C92A42] focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-stone-600 dark:text-stone-300">Live Swaying & Wind</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
                  className="rounded text-[#C92A42] focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-stone-600 dark:text-stone-300">Reduced Motion</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCutVine}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-stone-300 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Prune a vine (or press Space when canvas is selected)"
              >
                <Scissors className="w-3 h-3" />
                <span>Prune Vine</span>
              </button>

              <button
                onClick={onWitherLetter}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-stone-300 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Wither last letter (or press Backspace on canvas)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Wither Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Control Strip */}
      <div
        className={`flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-2xl border backdrop-blur-xl shadow-lg transition-colors ${
          isDark
            ? 'bg-[#12141F]/85 border-white/10 text-stone-100 shadow-black/30'
            : 'bg-[#FAF6F0]/90 border-stone-300 text-stone-900 shadow-stone-300/30'
        }`}
      >
        {/* Undo / Redo (compact on desktop, preserved in keyboard & drawer) */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo
                ? 'hover:bg-black/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200'
                : 'opacity-30 cursor-not-allowed text-stone-400'
            }`}
            aria-label="Undo text change"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo
                ? 'hover:bg-black/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200'
                : 'opacity-30 cursor-not-allowed text-stone-400'
            }`}
            aria-label="Redo text change"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Text Input with live typing */}
        <div className="flex-1 relative min-w-0">
          <input
            type="text"
            value={settings.text}
            onChange={(e) => onUpdateSettings({ text: e.target.value.slice(0, 36) })}
            placeholder="Type words to cultivate..."
            maxLength={36}
            className={`w-full px-3 py-2 text-sm md:text-base font-serif tracking-wide rounded-xl border bg-transparent focus:outline-none focus:ring-1 transition-all ${
              isDark
                ? 'border-white/15 text-stone-100 placeholder:text-stone-500 focus:ring-white/30 focus:border-white/40'
                : 'border-stone-300 text-stone-900 placeholder:text-stone-400 focus:ring-stone-400 focus:border-stone-500'
            }`}
            aria-label="Text to generate botanical typography"
          />
          <span
            className={`hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono pointer-events-none ${
              isDark ? 'text-stone-500' : 'text-stone-400'
            }`}
          >
            {settings.text.length}/36
          </span>
        </div>

        {/* Sliders Toggle */}
        <button
          onClick={() => setShowSliders(!showSliders)}
          className={`p-2 rounded-xl transition-colors border ${
            showSliders
              ? 'bg-[#C92A42] text-white border-transparent'
              : isDark
              ? 'border-white/10 hover:bg-white/10 text-stone-200'
              : 'border-stone-300 hover:bg-stone-200/60 text-stone-700'
          }`}
          aria-label="Toggle botanical sliders"
          title="Adjust flower size, density, scale"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Randomize Seed Button */}
        <button
          onClick={onRandomize}
          className={`p-2 rounded-xl transition-colors border ${
            isDark
              ? 'border-white/10 hover:bg-white/10 text-stone-200'
              : 'border-stone-300 hover:bg-stone-200/60 text-stone-700'
          }`}
          aria-label="Randomize botanical variation"
          title="Randomize garden growth seed (R)"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Save to Collection */}
        <button
          onClick={onSaveGarden}
          className={`hidden sm:inline-flex p-2 rounded-xl transition-colors border ${
            isDark
              ? 'border-white/10 hover:bg-white/10 text-stone-200'
              : 'border-stone-300 hover:bg-stone-200/60 text-stone-700'
          }`}
          aria-label="Save garden to collection"
          title="Save this garden composition"
        >
          <BookmarkPlus className="w-4 h-4" />
        </button>

        {/* Share Link */}
        <button
          onClick={onShare}
          className={`hidden sm:inline-flex p-2 rounded-xl transition-colors border ${
            isDark
              ? 'border-white/10 hover:bg-white/10 text-stone-200'
              : 'border-stone-300 hover:bg-stone-200/60 text-stone-700'
          }`}
          aria-label="Share garden link"
          title="Copy shareable URL link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Clear Garden */}
        <button
          onClick={onClear}
          className={`p-2 rounded-xl transition-colors border hover:text-red-500 ${
            isDark
              ? 'border-white/10 hover:bg-white/10 text-stone-300'
              : 'border-stone-300 hover:bg-stone-200/60 text-stone-600'
          }`}
          aria-label="Clear Garden"
          title="Clear Garden (Fade out)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Download Artwork Button */}
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium text-white bg-[#C92A42] hover:bg-[#B02035] transition-colors shrink-0 shadow-sm"
          aria-label="Download Artwork"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};
