import React, { useState } from 'react';
import { X, Image, Video, Sparkles, Layers, Clock, Sprout, Wind } from 'lucide-react';
import type { Palette } from '../types/garden.ts';
import { recordCanvasVideo, downloadBlob, downloadCanvasPng } from '../logic/exportMedia.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette;
  getCanvas: () => HTMLCanvasElement | null;
  text: string;
  onOpenPosterStudio: () => void;
  onRestartGrowthAnimation?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  palette,
  getCanvas,
  text,
  onOpenPosterStudio,
  onRestartGrowthAnimation,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<'growth' | 'ambient'>('growth');
  const [videoDuration, setVideoDuration] = useState<number>(6); // 6s full animation default

  if (!isOpen) return null;
  const isDark = palette.uiTone === 'dark';

  const handleDownloadPng = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    setStatusMessage('Downloading PNG artwork...');
    downloadCanvasPng(canvas, `bloom-type-${text || 'garden'}-${Date.now()}.png`);
    setTimeout(() => {
      setStatusMessage('PNG downloaded!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1000);
    }, 400);
  };

  const handleRecordAnimatedVideo = async () => {
    const canvas = getCanvas();
    if (!canvas) return;

    // If recording full growth sequence, reset spawn timers to 0 so the video captures
    // the full journey from initial sprouts to full blooms & butterflies!
    if (videoMode === 'growth' && onRestartGrowthAnimation) {
      onRestartGrowthAnimation();
    }

    setIsRecording(true);
    setRecordingProgress(0);
    setStatusMessage(
      videoMode === 'growth'
        ? `Recording full growth & bloom cycle (${videoDuration}s)...`
        : `Recording live garden breeze (${videoDuration}s)...`
    );

    try {
      const { blob, extension } = await recordCanvasVideo(canvas, videoDuration, (p) => {
        setRecordingProgress(Math.round(p * 100));
      });

      const filename = `bloom-type-${text || 'garden'}-animated-${Date.now()}.${extension}`;
      downloadBlob(blob, filename);
      setStatusMessage(`Full animated ${extension.toUpperCase()} video downloaded successfully!`);
      setTimeout(() => {
        setStatusMessage(null);
        setIsRecording(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      console.warn('Video export error:', err);
      setStatusMessage('Direct video recording unavailable in this browser. Downloading PNG instead.');
      handleDownloadPng();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#121420] border-white/10 text-stone-100'
            : 'bg-[#FAF6F0] border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C92A42]" />
            <h2 className="text-xl font-serif font-semibold tracking-wide">Export Artwork</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isRecording}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Alert */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-[#C92A42]/10 border border-[#C92A42]/30 text-[#C92A42] font-medium text-center animate-pulse">
              {statusMessage}
            </div>
          )}

          {/* Recording Progress Bar */}
          {isRecording && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-stone-200 dark:border-white/10">
              <div className="flex justify-between items-center text-stone-500 dark:text-stone-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Capturing Full Animation
                </span>
                <span className="font-mono font-bold text-[#C92A42]">{recordingProgress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className="h-full bg-[#C92A42] transition-all duration-150"
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Section: Animated Video Config Card */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#C92A42]" />
                <span className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100">
                  Animated Video Settings
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-stone-300 dark:border-white/15 text-stone-500">
                WebM / MP4
              </span>
            </div>

            {/* Mode selection: Full Sprout vs Ambient */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVideoMode('growth')}
                disabled={isRecording}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  videoMode === 'growth'
                    ? 'border-[#C92A42] bg-[#C92A42]/10 text-stone-900 dark:text-stone-100 font-medium ring-1 ring-[#C92A42]'
                    : 'border-stone-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Sprout className="w-4 h-4 text-[#C92A42] shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Full Growth Cycle</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">Sprouts to full bloom</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVideoMode('ambient')}
                disabled={isRecording}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  videoMode === 'ambient'
                    ? 'border-[#C92A42] bg-[#C92A42]/10 text-stone-900 dark:text-stone-100 font-medium ring-1 ring-[#C92A42]'
                    : 'border-stone-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Ambient Sway Loop</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">Breeze & butterflies</div>
                </div>
              </button>
            </div>

            {/* Duration Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-stone-600 dark:text-stone-400">Duration:</span>
              <div className="flex items-center gap-1.5">
                {[4, 6, 8].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    disabled={isRecording}
                    onClick={() => setVideoDuration(sec)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      videoDuration === sec
                        ? 'bg-[#C92A42] text-white font-bold shadow-sm'
                        : 'border border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Download Video Button */}
            <button
              onClick={handleRecordAnimatedVideo}
              disabled={isRecording}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all shadow-md ${
                isRecording
                  ? 'bg-stone-400 cursor-not-allowed opacity-60'
                  : 'bg-[#C92A42] hover:bg-[#B32439] active:scale-[0.99]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>
                {isRecording
                  ? `Recording... (${recordingProgress}%)`
                  : `Download ${videoDuration}s Animated Video`}
              </span>
            </button>
          </div>

          {/* Action 2: PNG Still */}
          <button
            onClick={handleDownloadPng}
            disabled={isRecording}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200">
                <Image className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-semibold text-xs block text-stone-900 dark:text-stone-100">
                  Download Still Image (PNG)
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  Instant crystal-clear transparency / high-dpi still image
                </span>
              </div>
            </div>
          </button>

          {/* Action 3: Poster Studio */}
          <button
            onClick={() => {
              onClose();
              onOpenPosterStudio();
            }}
            disabled={isRecording}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 bg-white/20 dark:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-medium text-xs block text-stone-800 dark:text-stone-200">
                  Open Poster Studio (1080 × 1080)
                </span>
                <span className="text-[10px] text-stone-400 block">
                  Square curatorial frames, print typography & ultra-resolution exports
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
