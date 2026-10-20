import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GardenSettings } from './types/garden.ts';
import { getPalette } from './logic/palettes.ts';
import {
  DEFAULT_SETTINGS,
  parseUrlSettings,
  encodeUrlSettings,
} from './logic/urlState.ts';
import {
  getStoredPalette,
  saveStoredPalette,
  saveGardenToStorage,
} from './logic/storage.ts';
import { Header } from './components/Header.tsx';
import { GardenCanvas, GardenCanvasRef } from './components/GardenCanvas.tsx';
import { BottomToolbar } from './components/BottomToolbar.tsx';
import { PaletteDrawer } from './components/PaletteDrawer.tsx';
import { PosterModal } from './components/PosterModal.tsx';
import { SavedGardensModal } from './components/SavedGardensModal.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { ShortcutsModal } from './components/ShortcutsModal.tsx';
import { Toast } from './components/Toast.tsx';
import { downloadCanvasPng } from './logic/exportMedia.ts';

const BOTANICAL_WORDS = [
  'Bloom',
  'Flora',
  'Wildflower',
  'Petrichor',
  'Sylvan',
  'Rosarium',
  'Ephemeral',
  'Verdant',
  'Serenade',
  'Solitude',
  'Evergreen',
  'Meadow',
  'Reverie',
  'Botanica',
  'Flourish',
  'Camellia',
];

export default function App() {
  const canvasRef = useRef<GardenCanvasRef | null>(null);

  // Initialize settings from URL or storage or defaults
  const [settings, setSettings] = useState<GardenSettings>(() => {
    const urlSettings = parseUrlSettings();
    const storedPalette = getStoredPalette();
    return {
      ...DEFAULT_SETTINGS,
      ...(storedPalette ? { paletteId: storedPalette } : {}),
      ...urlSettings,
    };
  });

  // Undo / Redo history stacks
  const [history, setHistory] = useState<GardenSettings[]>([settings]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals state
  const [isPalettesOpen, setIsPalettesOpen] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const currentPalette = getPalette(settings.paletteId);

  // Update settings with history tracking
  const updateSettings = useCallback(
    (partial: Partial<GardenSettings>, recordHistory = true) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };

        // Save palette preference
        if (partial.paletteId && partial.paletteId !== prev.paletteId) {
          saveStoredPalette(partial.paletteId);
        }

        if (recordHistory) {
          setHistory((h) => {
            const truncated = h.slice(0, historyIndex + 1);
            return [...truncated, next];
          });
          setHistoryIndex((idx) => idx + 1);
        }

        return next;
      });
    },
    [historyIndex]
  );

  // Update browser URL query string without reloading
  useEffect(() => {
    const newUrl = encodeUrlSettings(settings);
    window.history.replaceState({}, '', newUrl);
  }, [settings]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setSettings(history[prevIdx]);
      showToast('Undo');
    }
  }, [historyIndex, history, showToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setSettings(history[nextIdx]);
      showToast('Redo');
    }
  }, [historyIndex, history, showToast]);

  // Randomize Seed
  const handleRandomize = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 1000000);
    updateSettings({ seed: newSeed });
    showToast('Randomized botanical growth');
  }, [updateSettings, showToast]);

  // Inspire with random botanical word
  const handleRandomQuote = useCallback(() => {
    const currentWord = settings.text;
    const candidates = BOTANICAL_WORDS.filter((w) => w.toLowerCase() !== currentWord.toLowerCase());
    const picked = candidates[Math.floor(Math.random() * candidates.length)] || 'Bloom';
    updateSettings({ text: picked, seed: Math.floor(Math.random() * 1000000) });
    showToast(`Cultivating: "${picked}"`);
  }, [settings.text, updateSettings, showToast]);

  // Clear garden with smooth fade
  const handleClear = useCallback(() => {
    if (!settings.text) return;
    if (canvasRef.current) {
      canvasRef.current.triggerClearFade(() => {
        updateSettings({ text: '' });
        showToast('Garden cleared');
      });
    } else {
      updateSettings({ text: '' });
      showToast('Garden cleared');
    }
  }, [settings.text, updateSettings, showToast]);

  // Cut vine
  const handleCutVine = useCallback(() => {
    if (canvasRef.current) {
      const success = canvasRef.current.cutRandomVine();
      if (success) {
        showToast('Pruned vine');
      } else {
        showToast('No active vines to prune');
      }
    }
  }, [showToast]);

  // Wither letter
  const handleWitherLetter = useCallback(() => {
    if (canvasRef.current) {
      const success = canvasRef.current.witherLastCharacter();
      if (success) {
        showToast('Withering letter...');
      }
    }
  }, [showToast]);

  // Save current garden to collection
  const handleSaveGarden = useCallback(() => {
    saveGardenToStorage(settings.text || 'Untitled Garden', settings);
    showToast('Garden saved to your collection');
  }, [settings, showToast]);

  // Share garden link
  const handleShare = useCallback(() => {
    const fullUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('Garden link copied to clipboard!');
      });
    } else {
      showToast('Link ready in address bar');
    }
  }, [showToast]);

  // Download artwork directly as PNG
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    downloadCanvasPng(canvas, `bloom-type-${settings.text || 'garden'}-${Date.now()}.png`);
    showToast('Artwork downloaded!');
  }, [settings.text, showToast]);

  // Fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, don't intercept Space, Backspace, or letters
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
        return;
      }

      if (isInput) return;

      // Canvas active shortcuts:
      if (e.code === 'Space') {
        e.preventDefault();
        handleCutVine();
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        handleWitherLetter();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRandomize();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPosterOpen(true);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleCutVine,
    handleWitherLetter,
    handleRandomize,
    handleToggleFullscreen,
  ]);

  return (
    <div
      className="relative flex flex-col w-screen h-screen overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: currentPalette.background }}
    >
      {/* Toast notifications */}
      <Toast message={toastMessage} palette={currentPalette} />

      {/* Top Navigation */}
      <Header
        currentPalette={currentPalette}
        onOpenPalettes={() => setIsPalettesOpen(true)}
        onOpenPoster={() => setIsPosterOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onRandomQuote={handleRandomQuote}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Botanical Canvas Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <GardenCanvas
          ref={canvasRef}
          settings={settings}
          palette={currentPalette}
          onLetterWithered={(newText) => updateSettings({ text: newText }, false)}
        />
      </main>

      {/* Bottom Interactive Toolbar */}
      <BottomToolbar
        settings={settings}
        palette={currentPalette}
        onUpdateSettings={updateSettings}
        onRandomize={handleRandomize}
        onClear={handleClear}
        onDownload={handleDownload}
        onCutVine={handleCutVine}
        onWitherLetter={handleWitherLetter}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onSaveGarden={handleSaveGarden}
        onShare={handleShare}
      />

      {/* Modals */}
      <PaletteDrawer
        isOpen={isPalettesOpen}
        onClose={() => setIsPalettesOpen(false)}
        selectedPaletteId={settings.paletteId}
        onSelectPalette={(id) => updateSettings({ paletteId: id })}
        currentPalette={currentPalette}
      />

      <PosterModal
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
        settings={settings}
        palette={currentPalette}
      />

      <SavedGardensModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        currentSettings={settings}
        palette={currentPalette}
        onLoadGarden={(newSettings) => updateSettings(newSettings)}
        onToast={showToast}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        palette={currentPalette}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        palette={currentPalette}
      />
    </div>
  );
}
