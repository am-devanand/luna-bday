import { useEffect, useRef, useMemo, useState } from 'react';
import './AmbientSparkles.css';

/* ─── Sparkle shape SVG paths ────────────────────────── */
const SHAPES = {
  star: 'M0,-8 L1,-2 L8,0 L1,2 L0,8 L-1,2 L-8,0 L-1,-2 Z',
  dot: '',
  diamond: '',
  spec: '',
} as const;

type SparkleShape = keyof typeof SHAPES;

interface SparkleConfig {
  id: number;
  shape: SparkleShape;
  size: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  delay: number; // animation delay in seconds
  duration: number; // twinkle duration in seconds
  opacity: number;
}

interface AmbientSparklesProps {
  density?: 'low' | 'medium' | 'high';
  color?: string;
  twinkle?: boolean;
  interactive?: boolean;
  section?: string;
}

function generateSparkles(count: number, density: string): SparkleConfig[] {
  const shapes: SparkleShape[] = ['star', 'dot', 'diamond', 'spec'];
  // Distribute based on density
  const actualCount = density === 'low' ? count * 0.5 : density === 'high' ? count * 1.5 : count;
  return Array.from({ length: Math.round(actualCount) }, (_, i) => ({
    id: i,
    shape: shapes[i % shapes.length],
    size: shapes[i % shapes.length] === 'dot' ? 1.5 + Math.random() * 0.5
         : shapes[i % shapes.length] === 'spec' ? 1 + Math.random() * 0.5
         : 3 + Math.random() * 5,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 3,
    opacity: 0.3 + Math.random() * 0.4,
  }));
}

function SparkleSVG({ config, color }: { config: SparkleConfig; color: string }) {
  const size = config.size;

  switch (config.shape) {
    case 'star':
      return (
        <svg
          width={size * 2}
          height={size * 2}
          viewBox="-10 -10 20 20"
          aria-hidden="true"
          className="ambient-sparkle ambient-sparkle--star"
          style={{
            left: `${config.x}%`,
            top: `${config.y}%`,
            animationDelay: `${config.delay}s`,
            animationDuration: `${config.duration}s`,
            opacity: config.opacity,
          }}
        >
          <path d={SHAPES.star} fill={color} />
        </svg>
      );
    case 'dot':
      return (
        <svg
          width={size * 2}
          height={size * 2}
          viewBox="-2 -2 4 4"
          aria-hidden="true"
          className="ambient-sparkle ambient-sparkle--dot"
          style={{
            left: `${config.x}%`,
            top: `${config.y}%`,
            animationDelay: `${config.delay}s`,
            animationDuration: `${config.duration}s`,
            opacity: config.opacity,
          }}
        >
          <circle r="1.5" fill={color} />
        </svg>
      );
    case 'diamond':
      return (
        <svg
          width={size * 2}
          height={size * 2}
          viewBox="-3 -3 6 6"
          aria-hidden="true"
          className="ambient-sparkle ambient-sparkle--diamond"
          style={{
            left: `${config.x}%`,
            top: `${config.y}%`,
            animationDelay: `${config.delay}s`,
            animationDuration: `${config.duration}s`,
            opacity: config.opacity,
          }}
        >
          <rect x="-1.5" y="-1.5" width="3" height="3" transform="rotate(45)" fill={color} />
        </svg>
      );
    case 'spec':
      return (
        <svg
          width={size * 2}
          height={size * 2}
          viewBox="-2 -2 4 4"
          aria-hidden="true"
          className="ambient-sparkle ambient-sparkle--spec"
          style={{
            left: `${config.x}%`,
            top: `${config.y}%`,
            animationDelay: `${config.delay}s`,
            animationDuration: `${config.duration}s`,
            opacity: config.opacity * 0.4,
          }}
        >
          <circle r="1" fill={color} opacity="0.4" />
        </svg>
      );
  }
}

export default function AmbientSparkles({
  density = 'medium',
  color = 'var(--gold-light, #E0C99A)',
  twinkle = true,
  interactive = false,
}: AmbientSparklesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const baseCount = 10;
  const sparkles = useMemo(() => generateSparkles(baseCount, density), [density]);

  /* Offscreen pause via IntersectionObserver */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Tab visibility pause */
  useEffect(() => {
    const handleVis = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  /* Interactive proximity — subtle shift on mouse */
  useEffect(() => {
    if (!interactive) return;
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const animate = () => {
      if (containerRef.current && isVisible && isTabVisible) {
        const sparkleEls = containerRef.current.querySelectorAll<HTMLElement>('.ambient-sparkle');
        const mx = mouseRef.current.x / window.innerWidth;
        const my = mouseRef.current.y / window.innerHeight;
        sparkleEls.forEach((el, i) => {
          const baseX = parseFloat(el.dataset.baseX ?? '0');
          const baseY = parseFloat(el.dataset.baseY ?? '0');
          const offset = 3;
          el.style.transform = `translate(${baseX + (mx - 0.5) * offset}px, ${baseY + (my - 0.5) * offset}px)`;
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, [interactive, isVisible, isTabVisible]);

  /* Store base positions */
  useEffect(() => {
    if (!containerRef.current || !interactive) return;
    const sparkleEls = containerRef.current.querySelectorAll<HTMLElement>('.ambient-sparkle');
    sparkleEls.forEach((el) => {
      if (!el.dataset.baseX) {
        const match = el.style.left?.match(/([\d.]+)/);
        const x = match ? parseFloat(match[1]) * window.innerWidth / 100 : 0;
        const yMatch = el.style.top?.match(/([\d.]+)/);
        const y = yMatch ? parseFloat(yMatch[1]) * window.innerHeight / 100 : 0;
        el.dataset.baseX = String(x);
        el.dataset.baseY = String(y);
      }
    });
  }, [sparkles, interactive]);

  const shouldAnimate = twinkle && isVisible && isTabVisible;

  return (
    <div
      ref={containerRef}
      className={`ambient-sparkles-container ${shouldAnimate ? '' : 'ambient-sparkles-container--paused'}`}
      aria-hidden="true"
    >
      {sparkles.map((s) => (
        <SparkleSVG key={s.id} config={s} color={color} />
      ))}
    </div>
  );
}
