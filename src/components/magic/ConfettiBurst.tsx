import { useEffect, useRef, useEffectEvent } from 'react';
import { createPortal } from 'react-dom';

/* ─── Types ──────────────────────────────────────────── */
type BurstLevel = 'tiny' | 'micro' | 'small' | 'celebration';

interface ConfettiBurstProps {
  level?: BurstLevel;
  originX?: number; // 0-1 percentage of viewport width
  originY?: number; // 0-1 percentage of viewport height
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  sizeW: number;
  sizeH: number;
  color: string;
  opacity: number;
  decay: number;
  shape: 'rect' | 'circle' | 'streamer' | 'star';
}

/* ─── Config ─────────────────────────────────────────── */
const COLORS = ['#C8A46B', '#E0C99A', '#A8884D', '#F6F1E8', '#FFFFFF'];

const BURST_CONFIGS: Record<BurstLevel, { count: number; duration: number }> = {
  tiny: { count: 5, duration: 1200 },
  micro: { count: 8, duration: 1500 },
  small: { count: 18, duration: 2000 },
  celebration: { count: 30, duration: 3000 },
};

function createParticle(originX: number, originY: number): Particle {
  const shapeKeys: Particle['shape'][] = ['rect', 'circle', 'streamer', 'star'];
  const shape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
  const isRect = shape === 'rect' || shape === 'streamer';

  return {
    x: originX * window.innerWidth,
    y: originY * window.innerHeight,
    vx: (Math.random() - 0.5) * 6,
    vy: -4 - Math.random() * 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    sizeW: isRect ? 4 + Math.random() * 6 : 2 + Math.random() * 3,
    sizeH: shape === 'streamer' ? 2 : isRect ? 2 + Math.random() * 3 : 2 + Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 1,
    decay: 0.015 + Math.random() * 0.01,
    shape,
  };
}

/* ─── Draw shape helpers ─────────────────────────────── */
function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = Math.max(0, p.opacity);
  ctx.fillStyle = p.color;

  switch (p.shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, p.sizeW / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'star': {
      const r = p.sizeW / 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    default:
      // rect / streamer
      ctx.fillRect(-p.sizeW / 2, -p.sizeH / 2, p.sizeW, p.sizeH);
  }
  ctx.restore();
}

/* ─── Component ──────────────────────────────────────── */
export default function ConfettiBurst({
  level = 'small',
  originX = 0.5,
  originY = 0.5,
  onComplete,
}: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const onCompleteEvent = useEffectEvent(() => onComplete?.());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { count, duration } = BURST_CONFIGS[level];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: count }, () => createParticle(originX, originY));
    const gravity = 0.15;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onCompleteEvent();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;
        if (p.opacity > 0) {
          drawParticle(ctx, p);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [level, originX, originY]);

  /* Portal the canvas to document.body so it escapes any
     will-change:transform / transform containing block. */
  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />,
    document.body,
  );
}
