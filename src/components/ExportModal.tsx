import React, { useState } from 'react';
import { X, Image, Video, Sparkles, Layers, Check } from 'lucide-react';
import type { Palette } from '../types/garden.ts';
import { recordCanvasVideo, downloadBlob, downloadCanvasPng } from '../logic/exportMedia.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette;
  getCanvas: () => HTMLCanvasElement | null;
  text: string;
  onOpenPosterStudio: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  palette,
  getCanvas,
  text,
  onOpenPosterStudio,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

    setIsRecording(true);
    setRecordingProgress(0);
    setStatusMessage('Capturing live animated garden (3.5s)...');

    try {
      const { blob, extension } = await recordCanvasVideo(canvas, 3.5, (p) => {
        setRecordingProgress(Math.round(p * 100));
      });

      const filename = `bloom-type-${text || 'garden'}-animated-${Date.now()}.${extension}`;
      downloadBlob(blob, filename);
      setStatusMessage(`Animated ${extension.toUpperCase()} video downloaded!`);
      setTimeout(() => {
        setStatusMessage(null);
        setIsRecording(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.warn('Video export error:', err);
      setStatusMessage('Direct video recording unavailable in this browser. Downloading PNG instead.');
      handleDownloadPng();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
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
            <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-stone-200 dark:border-white/10">
              <div className="flex justify-between items-center text-stone-500 dark:text-stone-400 font-medium">
                <span>Capturing Frames</span>
                <span className="font-mono">{recordingProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className="h-full bg-[#C92A42] transition-all duration-150"
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action 1: Animated Video */}
          <button
            onClick={handleRecordAnimatedVideo}
            disabled={isRecording}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
              isRecording
                ? 'opacity-60 cursor-not-allowed border-stone-300 dark:border-white/10'
                : 'border-[#C92A42] bg-[#C92A42]/10 hover:bg-[#C92A42]/15 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#C92A42] text-white">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif font-semibold text-sm block text-stone-900 dark:text-stone-100">
                  Download Animated Video
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">
                  Records living swaying garden & butterflies (WebM / MP4)
                </span>
              </div>
            </div>
          </button>

          {/* Action 2: PNG Still */}
          <button
            onClick={handleDownloadPng}
            disabled={isRecording}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-all text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif font-semibold text-sm block text-stone-900 dark:text-stone-100">
                  Download Still Image (PNG)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">
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
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 bg-white/20 dark:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-medium text-xs block text-stone-800 dark:text-stone-200">
                  Open Poster Studio (1080 × 1080)
                </span>
                <span className="text-[10px] text-stone-400 block">
                  Curatorial frames, print typography & ultra-resolution exports
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
