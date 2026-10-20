import type { GardenSettings, Palette, PosterConfig } from '../types/garden.ts';
import { buildBotanicalGarden, renderGarden } from './botanicalEngine.ts';

/**
 * Downloads a canvas as a PNG image with specified filename
 */
export function downloadCanvasPng(
  canvas: HTMLCanvasElement,
  filename: string = 'bloom-type-garden.png'
): void {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 500);
}

/**
 * Downloads a binary Blob with specified filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();

  // Keep URL active for 60 seconds so browser download manager can stream it reliably
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 60000);
}

/**
 * Detects the best supported video MIME type
 */
export function getBestVideoMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidateTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ];
  for (const t of candidateTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return '';
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
  height: number = 1080,
  animTimeMs: number = 1000000
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
    ctx.strokeRect(
      posterConfig.margin,
      posterConfig.margin,
      width - posterConfig.margin * 2,
      height - posterConfig.margin * 2
    );

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
  ctx.beginPath();
  ctx.rect(0, 0, artworkWidth, artworkHeight);
  ctx.clip();

  renderGarden(ctx, characters, palette, animTimeMs, 1.0, false, [], posterSettings);
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
 * Records an animated video from canvas using MediaRecorder
 */
export async function recordCanvasVideo(
  canvas: HTMLCanvasElement,
  durationSeconds: number = 3.5,
  onProgress: (progress: number) => void,
  renderFrame?: (currentTimeMs: number, progress: number) => void
): Promise<{ blob: Blob; extension: string; mimeType: string }> {
  if (!('captureStream' in canvas) || typeof MediaRecorder === 'undefined') {
    throw new Error('Video recording (MediaRecorder) is not supported in this browser.');
  }

  const mimeType = getBestVideoMimeType();
  if (!mimeType) {
    throw new Error('No compatible video format (WebM/MP4) is supported by this browser.');
  }

  const isMp4 = mimeType.includes('mp4');
  const extension = isMp4 ? 'mp4' : 'webm';

  return new Promise((resolve, reject) => {
    try {
      const stream = (canvas as any).captureStream(30); // 30 fps
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps quality
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      let animId: number | null = null;
      let isStopped = false;

      const finishRecording = () => {
        if (isStopped) return;
        isStopped = true;
        if (animId) cancelAnimationFrame(animId);
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      };

      recorder.onstop = () => {
        if (animId) cancelAnimationFrame(animId);
        if (chunks.length === 0) {
          reject(new Error('No video frames could be recorded.'));
          return;
        }
        const blob = new Blob(chunks, { type: mimeType });
        resolve({ blob, extension, mimeType });
      };

      recorder.onerror = (err) => {
        finishRecording();
        reject(err);
      };

      // Request data slices every 150ms to ensure steady buffer delivery
      recorder.start(150);

      const startTime = performance.now();
      const totalMs = durationSeconds * 1000;

      const frameLoop = (timestamp: number) => {
        if (isStopped) return;

        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / totalMs);
        onProgress(progress);

        // If custom per-frame render callback is provided, invoke it
        if (renderFrame) {
          renderFrame(timestamp, progress);
        }

        if (elapsed < totalMs) {
          animId = requestAnimationFrame(frameLoop);
        } else {
          finishRecording();
        }
      };

      animId = requestAnimationFrame(frameLoop);
    } catch (err) {
      reject(err);
    }
  });
}
