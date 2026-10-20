import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import type {
  GardenSettings,
  Palette,
  BotanicalCharacter,
  FallingParticle,
  Butterfly,
} from '../types/garden.ts';
import {
  buildBotanicalGarden,
  renderGarden,
  updateRosesInteraction,
} from '../logic/botanicalEngine.ts';
import {
  spawnButterflies,
  updateButterflies,
  drawButterflies,
} from '../logic/butterflies.ts';

export interface GardenCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
  cutRandomVine: () => boolean;
  witherLastCharacter: () => boolean;
  triggerClearFade: (onComplete: () => void) => void;
  spawnButterfliesAt: (x: number, y: number, count?: number) => void;
}

interface GardenCanvasProps {
  settings: GardenSettings;
  palette: Palette;
  onLetterWithered?: (newText: string) => void;
}

export const GardenCanvas = forwardRef<GardenCanvasRef, GardenCanvasProps>(
  ({ settings, palette, onLetterWithered }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Simulation states stored in refs to prevent unnecessary React re-renders at 60fps
    const charactersRef = useRef<BotanicalCharacter[]>([]);
    const butterfliesRef = useRef<Butterfly[]>([]);
    const fallingParticlesRef = useRef<FallingParticle[]>([]);
    const pointerRef = useRef({ x: -1000, y: -1000, isOver: false });
    const isClearingRef = useRef(false);
    const clearOpacityRef = useRef(1.0);
    const lastTimeRef = useRef(performance.now());
    const animFrameRef = useRef<number | null>(null);

    // Regenerate botanical structures whenever text, font, density, or seed changes
    const rebuildGarden = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const currentChars = charactersRef.current;

      // Ensure typography fits gracefully on small screens without horizontal clipping
      const maxAvailableWidth = Math.max(260, rect.width - 60);
      const textLen = Math.max(1, settings.text.length);
      const approxCharWidth = settings.fontSize * 0.92;
      const estimatedWidth = textLen * approxCharWidth;

      let effectiveFontSize = settings.fontSize;
      if (estimatedWidth > maxAvailableWidth) {
        effectiveFontSize = Math.max(30, Math.floor((maxAvailableWidth / estimatedWidth) * settings.fontSize));
      }

      const responsiveSettings: GardenSettings = {
        ...settings,
        fontSize: effectiveFontSize,
      };

      const newChars = buildBotanicalGarden(
        responsiveSettings,
        palette,
        rect.width,
        rect.height,
        currentChars
      );

      charactersRef.current = newChars;
    }, [settings, palette]);

    // Handle Cut Vine with Spacebar
    const cutRandomVine = useCallback((): boolean => {
      const chars = charactersRef.current;
      const eligibleCurves: { curve: any; char: BotanicalCharacter }[] = [];

      for (const ch of chars) {
        if (ch.isWithering) continue;
        for (const stem of ch.stems) {
          if (!stem.severed) {
            eligibleCurves.push({ curve: stem, char: ch });
          }
        }
      }

      if (eligibleCurves.length === 0) return false;

      // Pick random vine
      const chosen = eligibleCurves[Math.floor(Math.random() * eligibleCurves.length)];
      chosen.curve.severed = true;
      chosen.curve.cutT = 0.45 + Math.random() * 0.1;

      // Spawn falling leaves and petals from cut location
      const cutX = (chosen.curve.p0.x + chosen.curve.p3.x) / 2;
      const cutY = (chosen.curve.p0.y + chosen.curve.p3.y) / 2;

      for (let p = 0; p < 7; p++) {
        fallingParticlesRef.current.push({
          x: cutX + (Math.random() - 0.5) * 20,
          y: cutY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2.5,
          vy: 1.0 + Math.random() * 2.5,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
          size: 6 + Math.random() * 8,
          color: Math.random() > 0.5 ? palette.accentColor : palette.leafColors.base,
          type: Math.random() > 0.5 ? 'petal' : 'leaf',
          opacity: 1.0,
          decay: 0.008 + Math.random() * 0.008,
        });
      }

      return true;
    }, [palette]);

    // Handle Wither Letter with Backspace
    const witherLastCharacter = useCallback((): boolean => {
      const chars = charactersRef.current;
      // Find last active char
      let targetIdx = -1;
      for (let i = chars.length - 1; i >= 0; i--) {
        if (!chars[i].isWithering && chars[i].char.trim().length > 0) {
          targetIdx = i;
          break;
        }
      }

      if (targetIdx === -1) return false;

      const targetChar = chars[targetIdx];
      targetChar.isWithering = true;
      targetChar.witherStartTime = performance.now();

      // Shower of falling withered petals and dry leaves
      const bounds = targetChar.bounds;
      for (let p = 0; p < 14; p++) {
        fallingParticlesRef.current.push({
          x: bounds.x + Math.random() * bounds.width,
          y: bounds.y + Math.random() * bounds.height,
          vx: (Math.random() - 0.5) * 2.0,
          vy: 1.2 + Math.random() * 2.8,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
          size: 6 + Math.random() * 9,
          color: Math.random() > 0.4 ? '#8C6F62' : '#5C4A3E',
          type: Math.random() > 0.5 ? 'petal' : 'leaf',
          opacity: 1.0,
          decay: 0.007 + Math.random() * 0.006,
        });
      }

      // After 600ms, notify parent to remove the character from text state
      setTimeout(() => {
        if (onLetterWithered) {
          const currentText = settings.text;
          if (currentText.length > 0) {
            onLetterWithered(currentText.slice(0, -1));
          }
        }
      }, 550);

      return true;
    }, [settings.text, onLetterWithered]);

    // Smooth Clear Fade Transition
    const triggerClearFade = useCallback((onComplete: () => void) => {
      isClearingRef.current = true;
      let opacity = 1.0;

      const fadeInterval = setInterval(() => {
        opacity -= 0.08;
        clearOpacityRef.current = Math.max(0, opacity);
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          charactersRef.current = [];
          butterfliesRef.current = [];
          fallingParticlesRef.current = [];
          isClearingRef.current = false;
          clearOpacityRef.current = 1.0;
          onComplete();
        }
      }, 30);
    }, []);

    // Spawn butterflies
    const spawnButterfliesAt = useCallback(
      (x: number, y: number, count: number = 3) => {
        const spawned = spawnButterflies(x, y, count, palette);
        // Cap active butterflies to 12 for smooth 60fps performance
        butterfliesRef.current = [...butterfliesRef.current.slice(-9), ...spawned];
      },
      [palette]
    );

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        getCanvas: () => canvasRef.current,
        cutRandomVine,
        witherLastCharacter,
        triggerClearFade,
        spawnButterfliesAt,
      }),
      [cutRandomVine, witherLastCharacter, triggerClearFade, spawnButterfliesAt]
    );

    // Resize observer to handle responsive canvas resolution
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const handleResize = () => {
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile performance

        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        rebuildGarden();
      };

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserver.observe(container);
      handleResize();

      return () => {
        resizeObserver.disconnect();
      };
    }, [rebuildGarden]);

    // Main 60fps animation loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let running = true;

      const loop = (timestamp: number) => {
        if (!running) return;

        const deltaTime = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
        lastTimeRef.current = timestamp;

        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Collect all blooming roses for butterfly and cursor interaction
        const allRoses = charactersRef.current.flatMap((c) => c.roses);

        // 1. Update Cursor-Aware Roses
        if (pointerRef.current.isOver) {
          updateRosesInteraction(
            allRoses,
            pointerRef.current.x,
            pointerRef.current.y,
            timestamp / 1000,
            settings.reducedMotion
          );
        } else {
          updateRosesInteraction(
            allRoses,
            -1000,
            -1000,
            timestamp / 1000,
            settings.reducedMotion
          );
        }

        // 2. Update Butterflies
        butterfliesRef.current = updateButterflies(
          butterfliesRef.current,
          deltaTime,
          allRoses,
          width,
          height
        );

        // 3. Update Falling Particles
        const aliveParticles: FallingParticle[] = [];
        for (const p of fallingParticlesRef.current) {
          p.x += p.vx + Math.sin(timestamp * 0.005 + p.y * 0.05) * 0.4;
          p.y += p.vy;
          p.rotation += p.vRot;
          p.opacity -= p.decay;

          if (p.opacity > 0 && p.y < height + 40) {
            aliveParticles.push(p);
          }
        }
        fallingParticlesRef.current = aliveParticles;

        // 4. Render Background
        ctx.save();
        ctx.fillStyle = palette.canvasBg;
        ctx.fillRect(0, 0, width, height);

        // Subtle ambient botanical background texture/vignette
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.3,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.75
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(
          1,
          palette.uiTone === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.04)'
        );
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Apply clear fade transition if in progress
        if (isClearingRef.current) {
          ctx.globalAlpha = clearOpacityRef.current;
        }

        // 5. Render Botanical Garden (text letterforms, stems, leaves, layered roses, cut branches, particles)
        renderGarden(
          ctx,
          charactersRef.current,
          palette,
          timestamp,
          settings.animationSpeed,
          settings.reducedMotion,
          fallingParticlesRef.current,
          settings
        );

        // 6. Render Butterflies
        drawButterflies(ctx, butterfliesRef.current);

        ctx.restore();

        // Continue loop if animated or still growing
        if (settings.isAnimated || butterfliesRef.current.length > 0 || fallingParticlesRef.current.length > 0) {
          animFrameRef.current = requestAnimationFrame(loop);
        } else {
          // Render on-demand once settled
          animFrameRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameRef.current = requestAnimationFrame(loop);

      return () => {
        running = false;
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }, [palette, settings.animationSpeed, settings.reducedMotion, settings.isAnimated]);

    // Handle pointer interactions
    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isOver: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.isOver = false;
    };

    const handleClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnButterfliesAt(x, y, 3);
    };

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
        style={{ backgroundColor: palette.canvasBg }}
      >
        <canvas
          ref={canvasRef}
          data-testid="garden-canvas"
          className="absolute inset-0 cursor-pointer block"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handleClick}
          title="Click to summon butterflies · Move pointer to tilt roses"
        />

        {/* Quiet instructional hint only when text input is empty */}
        {settings.text.trim().length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <p
              className={`font-serif text-2xl md:text-3xl italic tracking-wide ${
                palette.uiTone === 'dark' ? 'text-stone-300' : 'text-stone-700'
              }`}
            >
              Type your thoughts to seed the garden...
            </p>
          </div>
        )}
      </div>
    );
  }
);

GardenCanvas.displayName = 'GardenCanvas';
