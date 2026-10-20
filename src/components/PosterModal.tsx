import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Video, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import type { GardenSettings, Palette, PosterConfig } from '../types/garden.ts';
import { renderPosterToCanvas, downloadCanvasPng, recordCanvasVideo, downloadBlob } from '../logic/exportMedia.ts';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GardenSettings;
  palette: Palette;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  isOpen,
  onClose,
  settings,
  palette,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [posterConfig, setPosterConfig] = useState<PosterConfig>({
    title: 'Hortus Botanicus',
    subtitle: 'A Study in Living Generative Typography',
    signature: 'BLOOM TYPE · EDITION 2026',
    margin: 60,
    aspectRatio: '1:1',
    showBorders: true,
    bgColor: settings.customBgColor || palette.canvasBg,
    showMetadata: true,
  });

  const [hideControls, setHideControls] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync background color when palette or customBgColor changes
  useEffect(() => {
    setPosterConfig((prev) => ({ ...prev, bgColor: settings.customBgColor || palette.canvasBg }));
  }, [palette, settings.customBgColor]);

  // Re-render poster whenever config or settings change
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    renderPosterToCanvas(
      canvasRef.current,
      settings,
      posterConfig,
      palette,
      1080,
      1080
    );
  }, [isOpen, posterConfig, settings, palette]);

  if (!isOpen) return null;

  const handleDownloadStandardPng = () => {
    if (!canvasRef.current) return;
    setStatusMessage('Exporting 1080x1080 PNG...');
    downloadCanvasPng(canvasRef.current, `bloom-type-poster-${Date.now()}.png`);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const handleDownloadHighResPng = () => {
    setStatusMessage('Rendering ultra high-resolution 2160x2160 PNG...');
    const offscreen = document.createElement('canvas');
    renderPosterToCanvas(offscreen, settings, posterConfig, palette, 2160, 2160);
    downloadCanvasPng(offscreen, `bloom-type-ultra-${Date.now()}.png`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleRecordVideo = async () => {
    if (!canvasRef.current) return;
    setIsRecording(true);
    setRecordingProgress(0);
    setStatusMessage('Recording animated poster video (3.5s)...');

    try {
      const { blob, extension } = await recordCanvasVideo(
        canvasRef.current,
        3.5,
        (p) => {
          setRecordingProgress(Math.round(p * 100));
        },
        (timestamp) => {
          // Continuously render animated frame during recording
          if (canvasRef.current) {
            renderPosterToCanvas(
              canvasRef.current,
              settings,
              posterConfig,
              palette,
              1080,
              1080,
              timestamp
            );
          }
        }
      );

      const filename = `bloom-type-poster-${Date.now()}.${extension}`;
      downloadBlob(blob, filename);
      setStatusMessage(`Animated ${extension.toUpperCase()} video downloaded successfully!`);
    } catch (err: any) {
      console.warn('Video recording error:', err);
      setStatusMessage('Video recording unsupported in this browser. Downloading high-res PNG instead.');
      handleDownloadHighResPng();
    } finally {
      setIsRecording(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const isDark = palette.uiTone === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#121420] border-white/10 text-stone-100'
            : 'bg-[#FAF6F0] border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif font-semibold tracking-wide">Poster Studio</h2>
            <span className="text-[11px] font-sans tracking-wider uppercase px-2 py-0.5 rounded border border-stone-300 dark:border-white/15 text-stone-500 dark:text-stone-400">
              1080 × 1080 Square Edition
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideControls(!hideControls)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-stone-300 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Toggle preview controls"
            >
              {hideControls ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{hideControls ? 'Show Controls' : 'Clean Preview'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
              aria-label="Close poster mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split Preview + Controls */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row items-center justify-center gap-6 p-4 sm:p-6">
          {/* Square Canvas Preview */}
          <div className="relative flex-1 flex items-center justify-center w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden border border-stone-300 dark:border-white/10 shadow-2xl bg-stone-900">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Controls Panel (Collapsible via hideControls) */}
          {!hideControls && (
            <div className="w-full lg:w-80 flex flex-col gap-4 text-xs">
              {/* Status Message */}
              {statusMessage && (
                <div className="p-3 rounded-xl bg-[#C92A42]/10 border border-[#C92A42]/30 text-[#C92A42] font-medium animate-pulse">
                  {statusMessage}
                </div>
              )}

              {/* Title & Subtitle Inputs */}
              <div className="space-y-3 p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5">
                <div>
                  <label className="block text-stone-700 dark:text-stone-200 mb-1 font-medium">
                    Poster Heading
                  </label>
                  <input
                    type="text"
                    value={posterConfig.title}
                    onChange={(e) => setPosterConfig({ ...posterConfig, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-white/20 bg-black/10 dark:bg-white/5 text-stone-900 dark:text-stone-100 font-serif"
                    placeholder="e.g. Hortus Botanicus"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-200 mb-1 font-medium">
                    Subtitle / Deck
                  </label>
                  <input
                    type="text"
                    value={posterConfig.subtitle}
                    onChange={(e) => setPosterConfig({ ...posterConfig, subtitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-white/20 bg-black/10 dark:bg-white/5 text-stone-900 dark:text-stone-100 font-serif italic"
                    placeholder="e.g. A Study in Living Flora"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-200 mb-1 font-medium">
                    Botanical Signature
                  </label>
                  <input
                    type="text"
                    value={posterConfig.signature}
                    onChange={(e) => setPosterConfig({ ...posterConfig, signature: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-white/20 bg-black/10 dark:bg-white/5 text-stone-900 dark:text-stone-100 font-mono"
                    placeholder="e.g. BLOOM TYPE · 2026"
                  />
                </div>
              </div>

              {/* Formatting & Margin Options */}
              <div className="space-y-3 p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-stone-700 dark:text-stone-200 font-medium">
                    <span>Frame Margins</span>
                    <span className="font-mono">{posterConfig.margin}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={posterConfig.margin}
                    onChange={(e) => setPosterConfig({ ...posterConfig, margin: Number(e.target.value) })}
                    className="w-full accent-[#C92A42] cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={posterConfig.showBorders}
                      onChange={(e) => setPosterConfig({ ...posterConfig, showBorders: e.target.checked })}
                      className="rounded text-[#C92A42] focus:ring-0"
                    />
                    <span>Draw Curatorial Border Lines</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={posterConfig.showMetadata}
                      onChange={(e) => setPosterConfig({ ...posterConfig, showMetadata: e.target.checked })}
                      className="rounded text-[#C92A42] focus:ring-0"
                    />
                    <span>Show Archival Signature Stamp</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownloadStandardPng}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium bg-[#C92A42] hover:bg-[#B02035] transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 1080 × 1080 PNG</span>
                </button>

                <button
                  onClick={handleDownloadHighResPng}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium border border-stone-300 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Ultra-Res 2160 × 2160 (Print)</span>
                </button>

                <button
                  onClick={handleRecordVideo}
                  disabled={isRecording}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium border transition-colors ${
                    isRecording
                      ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                      : 'border-stone-300 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>
                    {isRecording ? `Recording... (${recordingProgress}%)` : 'Export Animated Video (WebM)'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
