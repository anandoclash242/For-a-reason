import React from 'react';
import { X, Flower2, Sparkles, Feather, Compass, Layers } from 'lucide-react';
import type { Palette } from '../types/garden.ts';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, palette }) => {
  if (!isOpen) return null;
  const isDark = palette.uiTone === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#121420] border-white/10 text-stone-100'
            : 'bg-[#FAF6F0] border-stone-200 text-stone-900'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-[#C92A42]" />
            <h2 className="text-xl font-serif font-semibold tracking-wide">About Bloom Type</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Close about modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
              The Living Typography Garden
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              <strong>BLOOM TYPE</strong> is an interactive generative art installation that synthesizes
              organic botany with typographic anatomy. Rather than placing static photographs, every glyph
              is sampled into vector contours, from which organic Bézier vine systems, curling tendrils,
              foliage leaves, and multi-layered blooming roses emerge in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-[#C92A42] font-semibold text-xs tracking-wider uppercase">
                <Compass className="w-4 h-4" />
                <span>Letter-Guided Growth</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Glyph shapes are rasterized offscreen, contour-sampled, and converted into continuous spline paths that maintain letter legibility even under lush density.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
                <Layers className="w-4 h-4" />
                <span>Procedural Roses</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Roses are constructed from 4 concentric rings of procedurally shaded petals with organic curls, green sepals, and an illuminated pistil core.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Cursor Proximity & Wind</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Hovering or touching near blossoming roses causes them to gracefully tilt and rotate toward your pointer with gentle spring damping physics.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-violet-600 font-semibold text-xs tracking-wider uppercase">
                <Feather className="w-4 h-4" />
                <span>Living Flutter Engine</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Clicking or tapping anywhere spawns animated butterflies with fluttering wings that steer along curved paths, occasionally resting on nearby flowers.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400 flex flex-wrap justify-between items-center gap-2">
            <span>Client-side procedural generative artwork · Zero external tracking</span>
            <span className="font-mono">100% Canvas 2D & Math</span>
          </div>
        </div>
      </div>
    </div>
  );
};
