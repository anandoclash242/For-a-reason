export interface Palette {
  id: string;
  name: string;
  description: string;
  background: string;
  canvasBg: string;
  textColor: string;
  stemColors: string[];
  leafColors: {
    base: string;
    light: string;
    dark: string;
    vein: string;
  };
  flowerColors: {
    primary: string;
    secondary: string;
    accent: string;
    center: string;
    bud: string;
  }[];
  rosePetalPalette: string[];
  accentColor: string;
  uiTone: 'light' | 'dark';
}

export interface Point {
  x: number;
  y: number;
}

export interface BezierCurve {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  width: number;
  color: string;
  severed?: boolean;
  cutT?: number; // point where severed
}

export interface Leaf {
  stemIdx: number;
  t: number; // 0..1 along stem
  angle: number;
  length: number;
  width: number;
  curve: number;
  color: string;
  veinColor: string;
  growthDelay: number; // in seconds
  scale: number;
  witherProgress: number; // 0 = healthy, 1 = withered
}

export interface RosePetal {
  layer: number; // 0 (outer) to 4 (inner core)
  angle: number;
  radius: number;
  width: number;
  height: number;
  color: string;
  curl: number;
}

export interface Rose {
  id: string;
  letterIndex: number;
  x: number;
  y: number;
  baseRadius: number;
  currentRadius: number;
  petals: RosePetal[];
  rotation: number;
  targetRotation: number;
  tiltX: number;
  tiltY: number;
  swayPhase: number;
  swaySpeed: number;
  bloomDelay: number;
  bloomDuration: number;
  paletteIndex: number;
  type: 'rose' | 'bud' | 'blossom';
  witherProgress: number; // 0 = normal, 1 = withered
}

export interface BotanicalCharacter {
  char: string;
  index: number;
  bounds: { x: number; y: number; width: number; height: number };
  baselineY: number;
  fontSize: number;
  renderX: number;
  stems: BezierCurve[];
  leaves: Leaf[];
  roses: Rose[];
  spawnTime: number; // performance.now()
  isWithering: boolean;
  witherStartTime?: number;
}

export interface FallingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  size: number;
  color: string;
  type: 'petal' | 'leaf';
  opacity: number;
  decay: number;
}

export interface Butterfly {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  color1: string;
  color2: string;
  wingAngle: number;
  wingSpeed: number;
  heading: number;
  state: 'flying' | 'resting';
  restTimer: number;
  age: number;
  maxAge: number;
}

export interface GardenSettings {
  text: string;
  fontSize: number; // 30 - 140
  growthDensity: number; // 0.5 - 2.0
  flowerSize: number; // 0.6 - 2.0
  animationSpeed: number; // 0.5 - 2.0
  paletteId: string;
  seed: number;
  isAnimated: boolean;
  reducedMotion: boolean;
  showTextLetterforms: boolean;
  textStyle: 'calligraphy' | 'subtle' | 'outline';
  textOpacity: number; // 0.0 - 1.0
  customBgColor?: string;
}

export interface PosterConfig {
  title: string;
  subtitle: string;
  signature: string;
  margin: number; // 20 - 120
  aspectRatio: '1:1' | '4:5' | '9:16';
  showBorders: boolean;
  bgColor: string;
  showMetadata: boolean;
}

export interface SavedGarden {
  id: string;
  name: string;
  timestamp: number;
  settings: GardenSettings;
  previewThumbnail?: string;
}
