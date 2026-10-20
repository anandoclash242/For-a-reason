import { GardenSettings } from '../types/garden';

export const DEFAULT_SETTINGS: GardenSettings = {
  text: 'Bloom',
  fontSize: 82,
  growthDensity: 1.1,
  flowerSize: 1.0,
  animationSpeed: 1.0,
  paletteId: 'rose-garden',
  seed: 42,
  isAnimated: true,
  reducedMotion: false,
  showTextLetterforms: true,
  textStyle: 'calligraphy',
  textOpacity: 0.85,
};

export function parseUrlSettings(search: string = window.location.search): Partial<GardenSettings> {
  const params = new URLSearchParams(search);
  const settings: Partial<GardenSettings> = {};

  if (params.has('text')) {
    const raw = params.get('text') || '';
    settings.text = raw.slice(0, 40); // Cap at 40 chars for safety
  }
  if (params.has('palette')) {
    settings.paletteId = params.get('palette')!;
  }
  if (params.has('size')) {
    const s = Number(params.get('size'));
    if (!isNaN(s) && s >= 30 && s <= 140) settings.fontSize = s;
  }
  if (params.has('density')) {
    const d = Number(params.get('density'));
    if (!isNaN(d) && d >= 0.5 && d <= 2.0) settings.growthDensity = d;
  }
  if (params.has('flower')) {
    const f = Number(params.get('flower'));
    if (!isNaN(f) && f >= 0.5 && f <= 2.0) settings.flowerSize = f;
  }
  if (params.has('seed')) {
    const seed = Number(params.get('seed'));
    if (!isNaN(seed)) settings.seed = seed;
  }
  if (params.has('motion')) {
    settings.reducedMotion = params.get('motion') === 'reduced';
  }
  if (params.has('bg')) {
    settings.customBgColor = params.get('bg')!;
  }

  return settings;
}

export function encodeUrlSettings(settings: GardenSettings): string {
  const params = new URLSearchParams();
  if (settings.text) params.set('text', settings.text);
  if (settings.paletteId !== DEFAULT_SETTINGS.paletteId) params.set('palette', settings.paletteId);
  if (settings.fontSize !== DEFAULT_SETTINGS.fontSize) params.set('size', Math.round(settings.fontSize).toString());
  if (settings.growthDensity !== DEFAULT_SETTINGS.growthDensity) params.set('density', settings.growthDensity.toFixed(2));
  if (settings.flowerSize !== DEFAULT_SETTINGS.flowerSize) params.set('flower', settings.flowerSize.toFixed(2));
  if (settings.seed !== DEFAULT_SETTINGS.seed) params.set('seed', settings.seed.toString());
  if (settings.reducedMotion) params.set('motion', 'reduced');
  if (settings.customBgColor) params.set('bg', settings.customBgColor);

  const query = params.toString();
  return query ? `${window.location.pathname}?${query}` : window.location.pathname;
}
