import type {
  Palette,
  Point,
  BezierCurve,
  Leaf,
  Rose,
  RosePetal,
  BotanicalCharacter,
  FallingParticle,
  GardenSettings,
} from '../types/garden.ts';
import { PRNG, hashString } from './prng.ts';
import { sampleGlyphPoints, generateOrganicCurves, GlyphLayout } from './typographySampling.ts';

/**
 * Creates the complete botanical model for a typed string
 */
export function buildBotanicalGarden(
  settings: GardenSettings,
  palette: Palette,
  canvasWidth: number,
  canvasHeight: number,
  existingChars: BotanicalCharacter[] = []
): BotanicalCharacter[] {
  const { text, fontSize, growthDensity, flowerSize, seed } = settings;
  const result: BotanicalCharacter[] = [];
  const chars = Array.from(text);

  if (chars.length === 0) return [];

  // Calculate layout widths and center baseline
  const layouts: GlyphLayout[] = [];
  let currentX = 0;
  const sampleSpacing = Math.max(4, Math.round(7 / growthDensity));
  const baselineY = canvasHeight / 2 + fontSize * 0.35;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const layout = sampleGlyphPoints(
      ch,
      i,
      currentX,
      baselineY,
      fontSize,
      'Cinzel, "Cormorant Garamond", Georgia, serif',
      sampleSpacing
    );
    layouts.push(layout);
    currentX += layout.width + (ch === ' ' ? 0 : fontSize * 0.32);
  }

  // Center horizontally
  const totalWidth = currentX;
  const offsetX = Math.max(30, (canvasWidth - totalWidth) / 2);

  const now = performance.now();

  for (let i = 0; i < layouts.length; i++) {
    const layout = layouts[i];
    const ch = layout.char;

    // Shift x to centered position
    const charOffsetX = offsetX + layout.x;
    const charBounds = {
      x: charOffsetX,
      y: layout.y,
      width: layout.width,
      height: layout.height,
    };

    // Reposition points
    const points = layout.points.map((p) => ({
      x: p.x + offsetX,
      y: p.y,
    }));

    // Reposition paths
    const paths = layout.paths.map((pth) =>
      pth.map((p) => ({
        x: p.x + offsetX,
        y: p.y,
      }))
    );

    // Reuse existing character state (like spawnTime) if available to prevent flicker
    const existing = existingChars[i] && existingChars[i].char === ch ? existingChars[i] : null;
    const charSeed = seed + hashString(ch + '_' + i) + i * 17;
    const rng = new PRNG(charSeed);

    if (ch === ' ' || points.length === 0) {
      result.push({
        char: ch,
        index: i,
        bounds: charBounds,
        baselineY,
        fontSize,
        renderX: charOffsetX,
        stems: [],
        leaves: [],
        roses: [],
        spawnTime: existing ? existing.spawnTime : now + i * 80,
        isWithering: false,
      });
      continue;
    }

    // Generate main stems along paths
    const stems: BezierCurve[] = [];
    const stemColor = rng.pick(palette.stemColors);

    for (const pth of paths) {
      const stemCurves = generateOrganicCurves(pth, rng, 2.8 * Math.min(1.3, growthDensity), stemColor);
      stems.push(...stemCurves);
    }

    // Add extra curling vine tendrils sprouting from top or edges
    const tendrilCount = Math.round(rng.range(1, 2) * growthDensity);
    for (let t = 0; t < tendrilCount; t++) {
      if (points.length < 2) break;
      const origin = rng.pick(points);
      const angle = rng.range(-Math.PI * 0.85, -Math.PI * 0.15);
      const length = rng.range(fontSize * 0.25, fontSize * 0.45);

      const p0 = { ...origin };
      const p3 = {
        x: origin.x + Math.cos(angle) * length,
        y: origin.y + Math.sin(angle) * length,
      };
      const mid = {
        x: (p0.x + p3.x) / 2 + rng.range(-12, 12),
        y: (p0.y + p3.y) / 2 + rng.range(-12, 12),
      };

      stems.push({
        p0,
        p1: mid,
        p2: { x: p3.x - Math.cos(angle) * 4, y: p3.y - Math.sin(angle) * 4 },
        p3,
        width: 1.6,
        color: stemColor,
      });
    }

    // Generate leaves along stems
    const leaves: Leaf[] = [];
    const leafCountTarget = Math.max(3, Math.round(stems.length * 1.3 * growthDensity));

    for (let l = 0; l < leafCountTarget; l++) {
      if (stems.length === 0) break;
      const stemIdx = rng.int(0, stems.length - 1);
      const t = rng.range(0.15, 0.85);
      const isLeft = rng.chance(0.5);
      const baseAngle = isLeft ? -rng.range(0.5, 1.4) : rng.range(0.5, 1.4);

      leaves.push({
        stemIdx,
        t,
        angle: baseAngle,
        length: rng.range(fontSize * 0.14, fontSize * 0.28) * Math.sqrt(flowerSize),
        width: rng.range(fontSize * 0.06, fontSize * 0.14) * Math.sqrt(flowerSize),
        curve: rng.range(-0.35, 0.35),
        color: rng.chance(0.35) ? palette.leafColors.light : palette.leafColors.base,
        veinColor: palette.leafColors.vein,
        growthDelay: rng.range(0.1, 0.6),
        scale: 0,
        witherProgress: 0,
      });
    }

    // Generate blooming roses
    const roses: Rose[] = [];
    const roseCandidatePoints: Point[] = [];

    // Stems endpoints are prime spots for blossoms
    for (const s of stems) {
      roseCandidatePoints.push(s.p3);
      if (rng.chance(0.25)) roseCandidatePoints.push(s.p0);
    }
    // Also sample a couple key stroke points
    for (let r = 0; r < Math.min(4, points.length); r++) {
      if (rng.chance(0.35)) roseCandidatePoints.push(rng.pick(points));
    }

    // Number of roses per letter based on density and size
    const roseCount = Math.max(1, Math.round(rng.range(1, 2.4) * growthDensity));

    for (let r = 0; r < roseCount; r++) {
      if (roseCandidatePoints.length === 0) break;
      const ptIdx = rng.int(0, roseCandidatePoints.length - 1);
      const pos = roseCandidatePoints.splice(ptIdx, 1)[0];

      // Avoid placing roses right on top of each other
      const tooClose = roses.some(
        (existingRose) => Math.hypot(existingRose.x - pos.x, existingRose.y - pos.y) < fontSize * 0.26
      );
      if (tooClose && roses.length > 0) continue;

      const baseRadius = rng.range(fontSize * 0.11, fontSize * 0.22) * flowerSize;
      const petals = generateRosePetals(baseRadius, rng, palette);

      const flowerType: 'rose' | 'bud' | 'blossom' =
        baseRadius < fontSize * 0.14 ? 'bud' : rng.chance(0.65) ? 'rose' : 'blossom';

      roses.push({
        id: `rose_${i}_${r}_${charSeed}`,
        letterIndex: i,
        x: pos.x,
        y: pos.y,
        baseRadius,
        currentRadius: 0,
        petals,
        rotation: rng.range(0, Math.PI * 2),
        targetRotation: 0,
        tiltX: 0,
        tiltY: 0,
        swayPhase: rng.range(0, Math.PI * 2),
        swaySpeed: rng.range(0.8, 1.8),
        bloomDelay: rng.range(0.2, 0.9),
        bloomDuration: rng.range(0.8, 1.5),
        paletteIndex: rng.int(0, palette.flowerColors.length - 1),
        type: flowerType,
        witherProgress: 0,
      });
    }

    result.push({
      char: ch,
      index: i,
      bounds: charBounds,
      baselineY,
      fontSize,
      renderX: charOffsetX,
      stems,
      leaves,
      roses,
      spawnTime: existing ? existing.spawnTime : now + i * 70,
      isWithering: false,
    });
  }

  return result;
}

/**
 * Procedurally generates concentric layered rose petals
 */
function generateRosePetals(radius: number, rng: PRNG, palette: Palette): RosePetal[] {
  const petals: RosePetal[] = [];
  const layers = 4; // 0 outer, 3 inner core
  const petalColors = palette.rosePetalPalette;

  for (let l = 0; l < layers; l++) {
    const layerFrac = l / (layers - 1); // 0 (outer) to 1 (inner)
    const petalsInLayer = l === 0 ? 6 : l === 1 ? 5 : l === 2 ? 4 : 3;
    const layerRadius = radius * (1 - layerFrac * 0.65);
    const angleOffset = rng.range(0, Math.PI * 2);

    const colorIdx = Math.min(
      petalColors.length - 1,
      Math.floor((1 - layerFrac) * (petalColors.length - 1))
    );
    const color = petalColors[colorIdx] || petalColors[0];

    for (let p = 0; p < petalsInLayer; p++) {
      const angle = angleOffset + (p / petalsInLayer) * Math.PI * 2 + rng.range(-0.15, 0.15);
      const width = layerRadius * rng.range(0.8, 1.25);
      const height = layerRadius * rng.range(0.7, 1.1);

      petals.push({
        layer: l,
        angle,
        radius: layerRadius,
        width,
        height,
        color,
        curl: rng.range(-0.3, 0.3),
      });
    }
  }

  return petals;
}

/**
 * Evaluates point along cubic Bézier curve at parameter t (0..1)
 */
export function getBezierPoint(curve: BezierCurve, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * curve.p0.x + 3 * mt2 * t * curve.p1.x + 3 * mt * t2 * curve.p2.x + t3 * curve.p3.x,
    y: mt3 * curve.p0.y + 3 * mt2 * t * curve.p1.y + 3 * mt * t2 * curve.p2.y + t3 * curve.p3.y,
  };
}

/**
 * Evaluates tangent vector along cubic Bézier curve at parameter t
 */
export function getBezierTangent(curve: BezierCurve, t: number): Point {
  const mt = 1 - t;
  const a = 3 * mt * mt;
  const b = 6 * mt * t;
  const c = 3 * t * t;

  const dx = a * (curve.p1.x - curve.p0.x) + b * (curve.p2.x - curve.p1.x) + c * (curve.p3.x - curve.p2.x);
  const dy = a * (curve.p1.y - curve.p0.y) + b * (curve.p2.y - curve.p1.y) + c * (curve.p3.y - curve.p2.y);
  const len = Math.hypot(dx, dy) || 1;

  return { x: dx / len, y: dy / len };
}

/**
 * Updates cursor-aware rose attraction and swaying
 */
export function updateRosesInteraction(
  roses: Rose[],
  pointerX: number,
  pointerY: number,
  timeSec: number,
  reducedMotion: boolean
): void {
  for (const rose of roses) {
    if (reducedMotion) {
      rose.rotation = 0;
      rose.tiltX = 0;
      rose.tiltY = 0;
      continue;
    }

    // Natural gentle botanical ambient swaying
    const ambientSway = Math.sin(timeSec * rose.swaySpeed + rose.swayPhase) * 0.08;

    // Distance to pointer
    const dx = pointerX - rose.x;
    const dy = pointerY - rose.y;
    const dist = Math.hypot(dx, dy);
    const maxReach = 180;

    if (dist < maxReach && dist > 1) {
      // Rose rotates slightly towards cursor
      const targetAngle = Math.atan2(dy, dx);
      const intensity = (1 - dist / maxReach);

      // Smooth interpolation
      rose.rotation += (targetAngle - rose.rotation) * 0.05 * intensity;
      rose.tiltX += ((dx / maxReach) * 0.4 - rose.tiltX) * 0.08;
      rose.tiltY += ((dy / maxReach) * 0.4 - rose.tiltY) * 0.08;
    } else {
      // Ease back to ambient sway
      rose.rotation += (ambientSway - rose.rotation) * 0.03;
      rose.tiltX += (0 - rose.tiltX) * 0.04;
      rose.tiltY += (0 - rose.tiltY) * 0.04;
    }
  }
}

/**
 * Renders the full botanical typography garden onto the Canvas
 */
export function renderGarden(
  ctx: CanvasRenderingContext2D,
  characters: BotanicalCharacter[],
  palette: Palette,
  currentTime: number,
  animationSpeed: number,
  reducedMotion: boolean,
  fallingParticles: FallingParticle[],
  settings?: GardenSettings
): void {
  const showText = settings?.showTextLetterforms ?? true;
  const textStyle = settings?.textStyle ?? 'calligraphy';
  const textOpacity = settings?.textOpacity ?? 0.85;

  // 1. Draw Typography Letterforms (Render the text clearly with living growth)
  if (showText && textOpacity > 0.02) {
    for (const char of characters) {
      if (!char.char || char.char === ' ') continue;

      const elapsed = Math.max(0, (currentTime - char.spawnTime) / 1000) * animationSpeed;
      const growthProgress = reducedMotion ? 1 : Math.min(1, elapsed / 0.85);
      if (growthProgress <= 0) continue;

      const alpha = char.isWithering
        ? Math.max(0, 1 - (currentTime - (char.witherStartTime || currentTime)) / 600) * textOpacity
        : growthProgress * textOpacity;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `600 ${char.fontSize}px "Cinzel", "Cormorant Garamond", Georgia, serif`;
      ctx.textBaseline = 'alphabetic';

      if (textStyle === 'outline') {
        ctx.strokeStyle = palette.textColor;
        ctx.lineWidth = 1.8;
        ctx.strokeText(char.char, char.renderX, char.baselineY);
      } else if (textStyle === 'subtle') {
        ctx.fillStyle = palette.textColor;
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillText(char.char, char.renderX, char.baselineY);
      } else {
        // 'calligraphy': Rich, elegant botanical typography
        ctx.fillStyle = palette.textColor;
        ctx.shadowColor = palette.uiTone === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 4;
        ctx.fillText(char.char, char.renderX, char.baselineY);

        ctx.shadowBlur = 0;
        ctx.strokeStyle = palette.uiTone === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 0.8;
        ctx.strokeText(char.char, char.renderX, char.baselineY);
      }

      ctx.restore();
    }
  }

  // 2. Draw Stems (vines winding through and over the letterforms)
  for (const char of characters) {
    const elapsed = Math.max(0, (currentTime - char.spawnTime) / 1000) * animationSpeed;
    const growthProgress = reducedMotion ? 1 : Math.min(1, elapsed / 0.9);

    if (growthProgress <= 0) continue;

    ctx.save();
    for (const stem of char.stems) {
      if (stem.severed) {
        // Render cut stem in two halves
        drawCutStem(ctx, stem, growthProgress, palette);
      } else {
        drawStem(ctx, stem, growthProgress);
      }
    }
    ctx.restore();
  }

  // 2. Draw Leaves
  for (const char of characters) {
    const elapsed = Math.max(0, (currentTime - char.spawnTime) / 1000) * animationSpeed;

    ctx.save();
    for (const leaf of char.leaves) {
      const stem = char.stems[leaf.stemIdx];
      if (!stem) continue;

      const leafElapsed = Math.max(0, elapsed - leaf.growthDelay);
      const leafGrowth = reducedMotion ? 1 : Math.min(1, leafElapsed / 0.6);
      if (leafGrowth <= 0) continue;

      const pt = getBezierPoint(stem, leaf.t);
      const tangent = getBezierTangent(stem, leaf.t);
      const stemAngle = Math.atan2(tangent.y, tangent.x);
      const finalAngle = stemAngle + leaf.angle;

      drawLeaf(ctx, pt, finalAngle, leaf, leafGrowth, char.isWithering);
    }
    ctx.restore();
  }

  // 3. Draw Roses
  for (const char of characters) {
    const elapsed = Math.max(0, (currentTime - char.spawnTime) / 1000) * animationSpeed;

    for (const rose of char.roses) {
      const roseElapsed = Math.max(0, elapsed - rose.bloomDelay);
      const bloomProgress = reducedMotion ? 1 : Math.min(1, roseElapsed / rose.bloomDuration);
      if (bloomProgress <= 0) continue;

      // Easing curve for blossoming (anticipation -> smooth bloom)
      const easedBloom = easeOutBack(bloomProgress);
      rose.currentRadius = rose.baseRadius * easedBloom;

      drawRose(ctx, rose, palette, char.isWithering);
    }
  }

  // 4b. Foreground Illuminated Letterform Accents (Ensures typography remains crisp and legible)
  if (showText && textStyle === 'calligraphy' && textOpacity > 0.2) {
    for (const char of characters) {
      if (!char.char || char.char === ' ') continue;
      const elapsed = Math.max(0, (currentTime - char.spawnTime) / 1000) * animationSpeed;
      const growthProgress = reducedMotion ? 1 : Math.min(1, elapsed / 0.85);
      if (growthProgress <= 0) continue;

      const alpha = char.isWithering
        ? Math.max(0, 1 - (currentTime - (char.witherStartTime || currentTime)) / 600) * (textOpacity * 0.6)
        : growthProgress * (textOpacity * 0.6);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `600 ${char.fontSize}px "Cinzel", "Cormorant Garamond", Georgia, serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.strokeStyle = palette.uiTone === 'dark' ? 'rgba(255, 255, 255, 0.4)' : palette.textColor;
      ctx.lineWidth = 1.2;
      ctx.strokeText(char.char, char.renderX, char.baselineY);
      ctx.restore();
    }
  }

  // 5. Draw Falling Particles (petals and leaves drifting downwards)
  drawFallingParticles(ctx, fallingParticles);
}

function drawStem(ctx: CanvasRenderingContext2D, stem: BezierCurve, progress: number): void {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const isFull = progress >= 0.99;
  const targetCurve = isFull ? stem : subdivideBezier(stem, progress);

  // Subtle bark depth under-stroke
  ctx.strokeStyle = 'rgba(25, 38, 25, 0.2)';
  ctx.lineWidth = stem.width + 1.2;
  ctx.beginPath();
  ctx.moveTo(targetCurve.p0.x, targetCurve.p0.y + 0.6);
  ctx.bezierCurveTo(targetCurve.p1.x, targetCurve.p1.y + 0.6, targetCurve.p2.x, targetCurve.p2.y + 0.6, targetCurve.p3.x, targetCurve.p3.y + 0.6);
  ctx.stroke();

  // Primary botanical runner stem
  ctx.strokeStyle = stem.color;
  ctx.lineWidth = stem.width;
  ctx.beginPath();
  ctx.moveTo(targetCurve.p0.x, targetCurve.p0.y);
  ctx.bezierCurveTo(targetCurve.p1.x, targetCurve.p1.y, targetCurve.p2.x, targetCurve.p2.y, targetCurve.p3.x, targetCurve.p3.y);
  ctx.stroke();
}

function drawCutStem(
  ctx: CanvasRenderingContext2D,
  stem: BezierCurve,
  progress: number,
  palette: Palette
): void {
  const cutT = stem.cutT || 0.5;

  ctx.lineWidth = stem.width;
  ctx.lineCap = 'round';

  // Part 1: from p0 to cutT - 0.05
  ctx.strokeStyle = stem.color;
  const part1 = subdivideBezier(stem, Math.max(0.01, cutT - 0.06));
  ctx.beginPath();
  ctx.moveTo(part1.p0.x, part1.p0.y);
  ctx.bezierCurveTo(part1.p1.x, part1.p1.y, part1.p2.x, part1.p2.y, part1.p3.x, part1.p3.y);
  ctx.stroke();

  // Part 2: from cutT + 0.06 to 1.0 (drooping slightly)
  ctx.beginPath();
  const cutPt2 = getBezierPoint(stem, Math.min(0.99, cutT + 0.06));
  ctx.moveTo(cutPt2.x, cutPt2.y + 4);
  ctx.bezierCurveTo(stem.p2.x, stem.p2.y + 8, stem.p3.x, stem.p3.y + 12, stem.p3.x, stem.p3.y + 16);
  ctx.stroke();

  // Draw tiny sap droplet
  ctx.fillStyle = palette.accentColor;
  ctx.beginPath();
  ctx.arc(part1.p3.x, part1.p3.y, 2, 0, Math.PI * 2);
  ctx.fill();
}

function subdivideBezier(curve: BezierCurve, t: number): BezierCurve {
  const p0 = curve.p0;
  const p1 = curve.p1;
  const p2 = curve.p2;
  const p3 = curve.p3;

  const p01 = lerpPoint(p0, p1, t);
  const p12 = lerpPoint(p1, p2, t);
  const p23 = lerpPoint(p2, p3, t);

  const p012 = lerpPoint(p01, p12, t);
  const p123 = lerpPoint(p12, p23, t);

  const p0123 = lerpPoint(p012, p123, t);

  return {
    p0,
    p1: p01,
    p2: p012,
    p3: p0123,
    width: curve.width,
    color: curve.color,
  };
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  pos: Point,
  angle: number,
  leaf: Leaf,
  growth: number,
  isWithering: boolean
): void {
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(angle);

  const currentLen = leaf.length * growth;
  const currentW = leaf.width * growth;

  // Leaf body path
  ctx.beginPath();
  ctx.moveTo(0, 0);

  // Top curve
  ctx.quadraticCurveTo(currentLen * 0.45, -currentW * 1.1 + leaf.curve * 8, currentLen, 0);
  // Bottom curve back to base
  ctx.quadraticCurveTo(currentLen * 0.45, currentW * 1.1 + leaf.curve * 8, 0, 0);
  ctx.closePath();

  // Wither effect changes leaf color to aged olive/sepia
  ctx.fillStyle = isWithering ? '#7A6B53' : leaf.color;
  ctx.fill();

  // Delicate center vein
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(currentLen * 0.5, leaf.curve * 4, currentLen * 0.9, 0);
  ctx.strokeStyle = isWithering ? '#544634' : leaf.veinColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawRose(
  ctx: CanvasRenderingContext2D,
  rose: Rose,
  palette: Palette,
  isWithering: boolean
): void {
  ctx.save();
  ctx.translate(rose.x + rose.tiltX * 12, rose.y + rose.tiltY * 12);
  ctx.rotate(rose.rotation);

  const rad = rose.currentRadius;
  if (rad < 2) {
    ctx.restore();
    return;
  }

  // Draw sepals / green calyx underneath
  const sepalCount = 5;
  ctx.fillStyle = palette.leafColors.dark;
  for (let s = 0; s < sepalCount; s++) {
    const sepalAngle = (s / sepalCount) * Math.PI * 2;
    ctx.save();
    ctx.rotate(sepalAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(rad * 0.5, -rad * 0.35, rad * 1.05, 0);
    ctx.quadraticCurveTo(rad * 0.5, rad * 0.35, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // Draw layered petals from outer to inner
  // Sort outer layers first
  const sortedPetals = [...rose.petals].sort((a, b) => a.layer - b.layer);

  for (const petal of sortedPetals) {
    const pRad = (petal.radius / rose.baseRadius) * rad;
    const pW = (petal.width / rose.baseRadius) * rad;
    const pH = (petal.height / rose.baseRadius) * rad;

    ctx.save();
    ctx.rotate(petal.angle);
    ctx.translate(pRad * 0.45, 0);

    // Procedural organic petal shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      pW * 0.6,
      -pH * 0.9,
      pW * 1.1,
      -pH * 0.5,
      pW,
      0
    );
    ctx.bezierCurveTo(
      pW * 1.1,
      pH * 0.5,
      pW * 0.6,
      pH * 0.9,
      0,
      0
    );

    ctx.fillStyle = isWithering ? '#8B5A65' : petal.color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 3;
    ctx.fill();

    // Subtle petal rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // Golden glowing pistil / rosebud core
  ctx.beginPath();
  ctx.arc(0, 0, rad * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = palette.flowerColors[0]?.center || '#FFE373';
  ctx.shadowColor = 'rgba(255, 220, 100, 0.5)';
  ctx.shadowBlur = 6;
  ctx.fill();

  ctx.restore();
}

function drawFallingParticles(
  ctx: CanvasRenderingContext2D,
  particles: FallingParticle[]
): void {
  for (const p of particles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, p.opacity);

    if (p.type === 'petal') {
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
      ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
      ctx.fillStyle = p.color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(p.size * 0.5, -p.size * 0.4, p.size, 0);
      ctx.quadraticCurveTo(p.size * 0.5, p.size * 0.4, 0, 0);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    ctx.restore();
  }
}

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
