import type { Butterfly, Rose, Palette } from '../types/garden.ts';
import { PRNG } from './prng.ts';

/**
 * Spawns a flutter of butterflies at the target point
 */
export function spawnButterflies(
  originX: number,
  originY: number,
  count: number = 3,
  palette: Palette
): Butterfly[] {
  const rng = new PRNG(Date.now() + Math.random() * 1000);
  const butterflies: Butterfly[] = [];

  for (let i = 0; i < count; i++) {
    const angle = rng.range(0, Math.PI * 2);
    const speed = rng.range(1.5, 3.2);

    // Pick vibrant butterfly colors inspired by the palette
    const color1 = rng.pick(palette.rosePetalPalette);
    const color2 = palette.flowerColors[0]?.secondary || '#FFF';

    butterflies.push({
      id: `bf_${Date.now()}_${i}_${Math.random()}`,
      x: originX + rng.range(-15, 15),
      y: originY + rng.range(-15, 15),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      targetX: originX + rng.range(-140, 140),
      targetY: originY + rng.range(-120, 120),
      size: rng.range(14, 22),
      color1,
      color2,
      wingAngle: rng.range(0, Math.PI),
      wingSpeed: rng.range(14, 22),
      heading: angle,
      state: 'flying',
      restTimer: 0,
      age: 0,
      maxAge: rng.range(10, 16), // alive for 10-16 seconds
    });
  }

  return butterflies;
}

/**
 * Updates butterflies: flight steering, wing flapping, landing on flowers, resting and take-off
 */
export function updateButterflies(
  butterflies: Butterfly[],
  deltaTime: number,
  roses: Rose[],
  canvasWidth: number,
  canvasHeight: number
): Butterfly[] {
  const alive: Butterfly[] = [];

  for (const b of butterflies) {
    b.age += deltaTime;
    if (b.age >= b.maxAge) continue; // Naturally expired

    if (b.state === 'resting') {
      b.restTimer -= deltaTime;
      // Gentle subtle breathing wing flap while perched
      b.wingAngle = Math.sin(b.age * 3) * 0.35 + 0.5;

      if (b.restTimer <= 0) {
        // Take off again!
        b.state = 'flying';
        const escapeAngle = Math.random() * Math.PI * 2;
        b.vx = Math.cos(escapeAngle) * 2;
        b.vy = Math.sin(escapeAngle) * 2;
        b.targetX = Math.random() * canvasWidth;
        b.targetY = Math.random() * canvasHeight;
      }
      alive.push(b);
      continue;
    }

    // Flying state
    b.wingAngle += b.wingSpeed * deltaTime;

    // Check if close to a rose to land
    if (roses.length > 0 && Math.random() < 0.008) {
      // Pick a random rose to fly towards
      const targetRose = roses[Math.floor(Math.random() * roses.length)];
      b.targetX = targetRose.x + (Math.random() - 0.5) * targetRose.currentRadius * 0.4;
      b.targetY = targetRose.y + (Math.random() - 0.5) * targetRose.currentRadius * 0.4;
    }

    // Steer towards target
    const dx = b.targetX - b.x;
    const dy = b.targetY - b.y;
    const dist = Math.hypot(dx, dy);

    // If reached target, pick new wander target or rest if near a flower
    if (dist < 20) {
      // Check if near any blooming rose
      const nearbyRose = roses.find((r) => Math.hypot(r.x - b.x, r.y - b.y) < r.currentRadius + 15);
      if (nearbyRose && Math.random() < 0.6) {
        b.state = 'resting';
        b.restTimer = 2.0 + Math.random() * 2.5; // Rest for 2 to 4.5 seconds
        b.vx = 0;
        b.vy = 0;
      } else {
        b.targetX = Math.max(40, Math.min(canvasWidth - 40, b.x + (Math.random() - 0.5) * 300));
        b.targetY = Math.max(40, Math.min(canvasHeight - 40, b.y + (Math.random() - 0.5) * 260));
      }
    } else {
      // Gentle steering force
      const targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - b.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      b.heading += angleDiff * 0.08;

      // Add gentle organic wobble
      b.heading += Math.sin(b.age * 6) * 0.04;

      const currentSpeed = 2.2 + Math.sin(b.age * 8) * 0.8;
      b.vx = Math.cos(b.heading) * currentSpeed;
      b.vy = Math.sin(b.heading) * currentSpeed;
    }

    b.x += b.vx;
    b.y += b.vy;

    // Wrap / bounce gently around canvas margins
    if (b.x < 10) b.vx += 1;
    if (b.x > canvasWidth - 10) b.vx -= 1;
    if (b.y < 10) b.vy += 1;
    if (b.y > canvasHeight - 10) b.vy -= 1;

    alive.push(b);
  }

  return alive;
}

/**
 * Draws procedural butterflies on Canvas with fluttering wings and antennae
 */
export function drawButterflies(
  ctx: CanvasRenderingContext2D,
  butterflies: Butterfly[]
): void {
  for (const b of butterflies) {
    const fade = Math.min(1, Math.min(b.age / 0.8, (b.maxAge - b.age) / 1.5));
    if (fade <= 0) continue;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.heading + Math.PI / 2);
    ctx.globalAlpha = fade;

    const wingFlap = Math.cos(b.wingAngle);
    const wingScaleX = Math.abs(wingFlap);
    const size = b.size;

    // 1. Draw Left Wing
    ctx.save();
    ctx.scale(wingScaleX, 1);

    // Forewing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.6, -size * 0.8, -size * 1.3, -size * 0.9, -size * 1.1, -size * 0.2);
    ctx.bezierCurveTo(-size * 1.0, size * 0.2, -size * 0.4, 0, 0, 0);
    ctx.fillStyle = b.color1;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.fill();

    // Forewing inner accent
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.4, -size * 0.5, -size * 0.8, -size * 0.6, -size * 0.7, -size * 0.15);
    ctx.bezierCurveTo(-size * 0.6, size * 0.1, -size * 0.2, 0, 0, 0);
    ctx.fillStyle = b.color2;
    ctx.fill();

    // Hindwing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.5, size * 0.2, -size * 0.9, size * 0.8, -size * 0.4, size * 1.0);
    ctx.bezierCurveTo(-size * 0.1, size * 0.8, 0, size * 0.4, 0, 0);
    ctx.fillStyle = b.color1;
    ctx.fill();

    ctx.restore();

    // 2. Draw Right Wing
    ctx.save();
    ctx.scale(-wingScaleX, 1);

    // Forewing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.6, -size * 0.8, -size * 1.3, -size * 0.9, -size * 1.1, -size * 0.2);
    ctx.bezierCurveTo(-size * 1.0, size * 0.2, -size * 0.4, 0, 0, 0);
    ctx.fillStyle = b.color1;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.fill();

    // Forewing inner accent
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.4, -size * 0.5, -size * 0.8, -size * 0.6, -size * 0.7, -size * 0.15);
    ctx.bezierCurveTo(-size * 0.6, size * 0.1, -size * 0.2, 0, 0, 0);
    ctx.fillStyle = b.color2;
    ctx.fill();

    // Hindwing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.5, size * 0.2, -size * 0.9, size * 0.8, -size * 0.4, size * 1.0);
    ctx.bezierCurveTo(-size * 0.1, size * 0.8, 0, size * 0.4, 0, 0);
    ctx.fillStyle = b.color1;
    ctx.fill();

    ctx.restore();

    // 3. Slender butterfly body & head
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.08, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#222222';
    ctx.fill();

    // Antennae
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4);
    ctx.quadraticCurveTo(-size * 0.25, -size * 0.8, -size * 0.35, -size * 0.9);
    ctx.moveTo(0, -size * 0.4);
    ctx.quadraticCurveTo(size * 0.25, -size * 0.8, size * 0.35, -size * 0.9);
    ctx.stroke();

    ctx.restore();
  }
}
