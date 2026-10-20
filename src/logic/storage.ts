import { GardenSettings, SavedGarden } from '../types/garden';

const STORAGE_KEY_PALETTE = 'bloom_type_last_palette';
const STORAGE_KEY_SAVED = 'bloom_type_saved_gardens';

export function getStoredPalette(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_PALETTE);
  } catch {
    return null;
  }
}

export function saveStoredPalette(paletteId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PALETTE, paletteId);
  } catch {
    // Ignore storage quota errors
  }
}

export function getSavedGardens(): SavedGarden[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveGardenToStorage(name: string, settings: GardenSettings, previewThumbnail?: string): SavedGarden {
  const gardens = getSavedGardens();
  const newGarden: SavedGarden = {
    id: 'garden_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: name.trim() || settings.text || 'Untitled Garden',
    timestamp: Date.now(),
    settings: { ...settings },
    previewThumbnail,
  };
  gardens.unshift(newGarden);
  try {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(gardens.slice(0, 30))); // Store up to 30
  } catch {
    // If full, pop oldest thumbnail and retry
    gardens.pop();
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(gardens));
    } catch {
      // ignore
    }
  }
  return newGarden;
}

export function deleteSavedGarden(id: string): void {
  const gardens = getSavedGardens().filter((g) => g.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(gardens));
  } catch {
    // ignore
  }
}
