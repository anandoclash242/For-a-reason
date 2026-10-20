import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Palette } from '../types/garden.ts';

interface ToastProps {
  message: string | null;
  palette: Palette;
}

export const Toast: React.FC<ToastProps> = ({ message, palette }) => {
  if (!message) return null;
  const isDark = palette.uiTone === 'dark';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-xl text-xs font-medium backdrop-blur-md ${
          isDark
            ? 'bg-[#121420]/90 border-white/15 text-stone-100 shadow-black/50'
            : 'bg-[#FAF6F0]/95 border-stone-300 text-stone-900 shadow-stone-400/20'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#C92A42]" />
        <span>{message}</span>
      </div>
    </div>
  );
};
