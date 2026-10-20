import React, { useState, useEffect } from 'react';
import { X, Bookmark, Trash2, ArrowUpRight, Plus } from 'lucide-react';
import type { GardenSettings, Palette, SavedGarden } from '../types/garden.ts';
import { getSavedGardens, deleteSavedGarden, saveGardenToStorage } from '../logic/storage.ts';

interface SavedGardensModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GardenSettings;
  palette: Palette;
  onLoadGarden: (settings: GardenSettings) => void;
  onToast: (msg: string) => void;
}

export const SavedGardensModal: React.FC<SavedGardensModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  palette,
  onLoadGarden,
  onToast,
}) => {
  const [gardens, setGardens] = useState<SavedGarden[]>([]);
  const [customName, setCustomName] = useState('');

  const refreshList = () => {
    setGardens(getSavedGardens());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setCustomName(currentSettings.text || 'My Garden');
    }
  }, [isOpen, currentSettings.text]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    const item = saveGardenToStorage(customName, currentSettings);
    refreshList();
    onToast(`Saved "${item.name}" to your collection!`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSavedGarden(id);
    refreshList();
    onToast(`Deleted "${name}"`);
  };

  const handleSelect = (garden: SavedGarden) => {
    onLoadGarden(garden.settings);
    onToast(`Restored garden "${garden.name}"`);
    onClose();
  };

  const isDark = palette.uiTone === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#121420] border-white/10 text-stone-100'
            : 'bg-[#FAF6F0] border-stone-200 text-stone-900'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#C92A42]" />
            <h2 className="text-xl font-serif font-semibold tracking-wide">Saved Botanical Gardens</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Close saved gardens modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Save Current Section */}
          <div className="flex items-center gap-2 p-2 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Name this botanical garden..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-transparent focus:outline-none"
            />
            <button
              onClick={handleSaveCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-[#C92A42] hover:bg-[#B02035] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current</span>
            </button>
          </div>

          {/* List of Saved Designs */}
          {gardens.length === 0 ? (
            <div className="text-center py-10 text-stone-400 dark:text-stone-500 text-xs">
              No saved garden compositions yet. Cultivate something beautiful and click &ldquo;Save Current&rdquo;!
            </div>
          ) : (
            <div className="space-y-2.5">
              {gardens.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:border-stone-300 dark:hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="font-serif font-medium text-sm truncate">{g.name}</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      &ldquo;{g.settings.text}&rdquo; · {new Date(g.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSelect(g)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-300 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Open and cultivate this garden"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleDelete(g.id, g.name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
                      title="Delete saved garden"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
