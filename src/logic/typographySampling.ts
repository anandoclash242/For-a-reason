import type { Point, BezierCurve } from '../types/garden.ts';
import { PRNG, hashString } from './prng.ts';

export interface GlyphLayout {
  char: string;
  charIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
  paths: Point[][];
}

/**
 * Samples points along the rendered glyph shape using an offscreen canvas.
 */
export function sampleGlyphPoints(
  char: string,
  charIndex: number,
  xOffset: number,
  baselineY: number,
  fontSize: number,
  fontFamily: string = 'Cinzel, "Cormorant Garamond", Georgia, serif',
  step: number = 6
): GlyphLayout {
  // If character is a space, return an empty layout with appropriate width
  if (char === ' ') {
    return {
      char,
      charIndex,
      x: xOffset,
      y: baselineY - fontSize,
      width: fontSize * 0.45,
      height: fontSize * 1.2,
      points: [],
      paths: [],
    };
  }

  // Create an offscreen canvas dedicated to analyzing this character
  const width = Math.ceil(fontSize * 1.8);
  const height = Math.ceil(fontSize * 1.6);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return {
      char,
      charIndex,
      x: xOffset,
      y: baselineY - fontSize,
      width: fontSize * 0.7,
      height: fontSize * 1.2,
      points: [],
      paths: [],
    };
  }

  // Draw font glyph
  ctx.fillStyle = '#000000';
  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'alphabetic';
  const charMetrics = ctx.measureText(char);
  const charWidth = Math.max(charMetrics.width, fontSize * 0.3);
  const localX = 15;
  const localY = fontSize * 1.1;

  ctx.fillText(char, localX, localY);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample filled pixels
  const rawPoints: Point[] = [];
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  const sampleStep = Math.max(3, Math.min(step, 8));

  for (let py = 0; py < height; py += sampleStep) {
    for (let px = 0; px < width; px += sampleStep) {
      const alpha = data[(py * width + px) * 4 + 3];
      if (alpha > 70) {
        rawPoints.push({ x: px, y: py });
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
  }

  if (rawPoints.length === 0) {
    return {
      char,
      charIndex,
      x: xOffset,
      y: baselineY - fontSize,
      width: charWidth,
      height: fontSize * 1.2,
      points: [],
      paths: [],
    };
  }

  // Normalize points relative to global canvas position
  const mappedPoints: Point[] = rawPoints.map((p) => ({
    x: xOffset + (p.x - localX),
    y: baselineY - (localY - p.y),
  }));

  // Build connected skeletal path chains through the points
  const paths = buildGlyphPaths(mappedPoints, sampleStep * 2.8);

  const actualWidth = Math.max(charMetrics.width, (maxX - minX) + 8);
  const actualHeight = Math.max(maxY - minY, fontSize * 0.85);

  return {
    char,
    charIndex,
    x: xOffset,
    y: baselineY - actualHeight,
    width: actualWidth,
    height: actualHeight,
    points: mappedPoints,
    paths,
  };
}

/**
 * Connects sampled points into sequential vine paths using nearest-neighbor chains.
 */
function buildGlyphPaths(points: Point[], maxDist: number): Point[][] {
  if (points.length < 2) return points.length === 1 ? [[points[0]]] : [];

  const unvisited = new Set(points.map((_, i) => i));
  const paths: Point[][] = [];
  const maxDistSq = maxDist * maxDist;

  // Prefer starting at bottom-left or top-left
  while (unvisited.size > 0) {
    let startIdx = -1;
    let bestY = 999999;
    for (const idx of unvisited) {
      if (points[idx].y < bestY) {
        bestY = points[idx].y;
        startIdx = idx;
      }
    }

    if (startIdx === -1) break;

    unvisited.delete(startIdx);
    const currentPath: Point[] = [points[startIdx]];

    let current = points[startIdx];
    while (unvisited.size > 0) {
      let nearestIdx = -1;
      let nearestDistSq = Infinity;

      for (const candidateIdx of unvisited) {
        const cand = points[candidateIdx];
        const dx = cand.x - current.x;
        const dy = cand.y - current.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < nearestDistSq && distSq <= maxDistSq) {
          nearestDistSq = distSq;
          nearestIdx = candidateIdx;
        }
      }

      if (nearestIdx !== -1) {
        unvisited.delete(nearestIdx);
        current = points[nearestIdx];
        currentPath.push(current);
      } else {
        break;
      }
    }

    if (currentPath.length >= 2) {
      paths.push(currentPath);
    }
  }

  return paths;
}

/**
 * Creates smooth organic cubic Bézier splines following the path
 */
export function generateOrganicCurves(
  path: Point[],
  rng: PRNG,
  stemWidth: number = 2.4,
  stemColor: string = '#3A533E'
): BezierCurve[] {
  if (path.length < 2) return [];
  const curves: BezierCurve[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const p0 = path[i];
    const p3 = path[i + 1];

    const dx = p3.x - p0.x;
    const dy = p3.y - p0.y;
    const dist = Math.hypot(dx, dy);

    // Add organic perpendicular curl
    const perpX = -dy / (dist || 1);
    const perpY = dx / (dist || 1);
    const curveAmp = rng.range(-0.35, 0.35) * dist;

    const p1: Point = {
      x: p0.x + dx * 0.33 + perpX * curveAmp,
      y: p0.y + dy * 0.33 + perpY * curveAmp,
    };

    const p2: Point = {
      x: p0.x + dx * 0.66 + perpX * (curveAmp * 0.8),
      y: p0.y + dy * 0.66 + perpY * (curveAmp * 0.8),
    };

    curves.push({
      p0,
      p1,
      p2,
      p3,
      width: Math.max(1.2, stemWidth + rng.range(-0.4, 0.4)),
      color: stemColor,
    });
  }

  return curves;
}
