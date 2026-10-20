import React from 'react';
import { Palette, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import type { Palette as PaletteType } from '../types/garden.ts';

interface HeaderProps {
  currentPalette: PaletteType;
  currentColor?: string;
  onOpenPalettes: () => void;
  onOpenBgColor: () => void;
  onOpenPoster: () => void;
  onOpenSaved: () => void;
  onOpenAbout: () => void;
  onOpenShortcuts: () => void;
  onRandomQuote: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPalette,
  currentColor,
  onOpenPalettes,
  onOpenBgColor,
  onOpenPoster,
  onOpenSaved,
  onOpenAbout,
  onOpenShortcuts,
  onRandomQuote,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const isDark = currentPalette.uiTone === 'dark';

  return (
    <header
      className={`relative z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-8 py-3.5 transition-colors duration-500 border-b ${
        isDark
          ? 'bg-[#0D0E15]/85 border-white/10 text-stone-100'
          : 'bg-[#FAF6F0]/85 border-stone-200 text-stone-900'
      } backdrop-blur-md`}
    >
      {/* Zone 1: Brand Title */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/"
          className="text-lg sm:text-2xl font-serif tracking-wider font-semibold uppercase whitespace-nowrap hover:opacity-80 transition-opacity"
          aria-label="BLOOM TYPE Home"
        >
          Bloom Type
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm font-medium tracking-wide overflow-x-hidden">
        <button
          onClick={onRandomQuote}
          className={`flex items-center gap-1 p-1 sm:p-0 transition-colors whitespace-nowrap hover:opacity-100 ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
          title="Inspire with botanical word"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="hidden xs:inline">Inspire</span>
        </button>

        <button
          onClick={onOpenPalettes}
          className={`flex items-center gap-1 p-1 sm:p-0 transition-colors whitespace-nowrap hover:opacity-100 ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span>Palettes</span>
        </button>

        <button
          onClick={onOpenBgColor}
          className={`flex items-center gap-1.5 p-1 sm:p-0 transition-colors whitespace-nowrap hover:opacity-100 ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
          title="Change canvas background color"
        >
          <span
            className="w-3.5 h-3.5 rounded-full border border-stone-400 dark:border-white/30 shadow-inner shrink-0"
            style={{ backgroundColor: currentColor || currentPalette.canvasBg }}
          />
          <span>Background</span>
        </button>

        <button
          onClick={onOpenPoster}
          className={`p-1 sm:p-0 transition-colors whitespace-nowrap ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Poster
        </button>

        <button
          onClick={onOpenSaved}
          className={`hidden sm:inline-block transition-colors whitespace-nowrap ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Collection
        </button>

        <button
          onClick={onOpenAbout}
          className={`hidden md:inline-block transition-colors whitespace-nowrap ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          About
        </button>

        <button
          onClick={onOpenShortcuts}
          className={`hidden lg:inline-block transition-colors whitespace-nowrap ${
            isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-900'
          }`}
          title="Keyboard shortcuts"
        >
          Keys
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleFullscreen}
          className={`p-2 rounded-lg transition-colors border ${
            isDark
              ? 'border-white/15 bg-white/5 hover:bg-white/10 text-stone-200'
              : 'border-stone-300 bg-stone-100/60 hover:bg-stone-200/80 text-stone-700'
          }`}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Garden (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
