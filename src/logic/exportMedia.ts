import type { GardenSettings, Palette, PosterConfig } from '../types/garden.ts';
import { buildBotanicalGarden, renderGarden } from './botanicalEngine.ts';

/**
 * Downloads a canvas as a PNG image with specified filename
 */
export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string = 'bloom-type-garden.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

/**
 * Renders an exact high-resolution poster onto a dedicated canvas
 */
export function renderPosterToCanvas(
  targetCanvas: HTMLCanvasElement,
  settings: GardenSettings,
  posterConfig: PosterConfig,
  palette: Palette,
  width: number = 1080,
  height: number = 1080
): void {
  targetCanvas.width = width;
  targetCanvas.height = height;
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw Background
  ctx.fillStyle = posterConfig.bgColor || palette.canvasBg;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw subtle border if enabled
  if (posterConfig.showBorders) {
    ctx.strokeStyle = palette.uiTone === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(posterConfig.margin, posterConfig.margin, width - posterConfig.margin * 2, height - posterConfig.margin * 2);

    // Inner hairline frame
    ctx.lineWidth = 0.8;
    ctx.strokeRect(
      posterConfig.margin + 12,
      posterConfig.margin + 12,
      width - (posterConfig.margin + 12) * 2,
      height - (posterConfig.margin + 12) * 2
    );
  }

  // 3. Render Header Typography (Title & Subtitle)
  const textColor = palette.textColor;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';

  if (posterConfig.title) {
    ctx.font = '600 36px "Cinzel", "Cormorant Garamond", Georgia, serif';
    ctx.fillText(posterConfig.title.toUpperCase(), width / 2, posterConfig.margin + 64);
  }

  if (posterConfig.subtitle) {
    ctx.font = 'italic 16px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = palette.uiTone === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
    ctx.fillText(posterConfig.subtitle, width / 2, posterConfig.margin + 94);
  }

  // 4. Render Botanical Garden in the Center Area
  const artworkTop = posterConfig.margin + 120;
  const artworkBottom = height - (posterConfig.margin + 80);
  const artworkHeight = artworkBottom - artworkTop;
  const artworkWidth = width - posterConfig.margin * 2;

  // Scale font size according to poster canvas dimensions
  const scaleFactor = width / 1200;
  const posterSettings: GardenSettings = {
    ...settings,
    fontSize: Math.round(settings.fontSize * scaleFactor * 1.2),
  };

  const characters = buildBotanicalGarden(
    posterSettings,
    palette,
    artworkWidth,
    artworkHeight
  );

  ctx.save();
  ctx.translate(posterConfig.margin, artworkTop);
  // Clip to inner poster bounds
  ctx.beginPath();
  ctx.rect(0, 0, artworkWidth, artworkHeight);
  ctx.clip();

  // Render garden fully grown
  const fullGrownTime = 1000000;
  renderGarden(ctx, characters, palette, fullGrownTime, 1.0, true, [], posterSettings);
  ctx.restore();

  // 5. Render Footer Signature & Watermark
  if (posterConfig.showMetadata) {
    ctx.fillStyle = palette.uiTone === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const sig = posterConfig.signature || 'BLOOM TYPE · BOTANICAL GENERATIVE TYPOGRAPHY';
    ctx.fillText(sig.toUpperCase(), width / 2, height - posterConfig.margin - 24);
  }
}

/**
 * Records an animated WebM video from canvas using MediaRecorder
 */
export async function recordCanvasVideo(
  canvas: HTMLCanvasElement,
  durationSeconds: number = 4,
  onProgress: (progress: number) => void
): Promise<Blob> {
  if (!('captureStream' in canvas) || typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder or captureStream is not supported in this browser.');
  }

  return new Promise((resolve, reject) => {
    try {
      const stream = (canvas as any).captureStream(30); // 30 fps
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };

      recorder.onerror = (err) => reject(err);

      recorder.start();

      const startTime = performance.now();
      const interval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(1, elapsed / durationSeconds);
        onProgress(progress);

        if (elapsed >= durationSeconds) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
}
