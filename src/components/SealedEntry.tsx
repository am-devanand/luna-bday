import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ConfettiBurst from './magic/ConfettiBurst';
import './SealedEntry.css';

const STORAGE_KEY = 'luna-unsealed';

type Phase = 'sealed' | 'breaking' | 'leaving' | 'skipping' | 'gone';

function readUnsealed(): boolean {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v === '1' || v === 'skip';
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── Star field: memoised random stars ── */
interface StarConfig {
  left: string;
  top: string;
  size: number;
  minOp: number;
  maxOp: number;
  dur: number;
  delay: number;
}

function generateStars(count: number): StarConfig[] {
  return Array.from({ length: count }, () => ({
    left: `${2 + Math.random() * 96}%`,
    top: `${2 + Math.random() * 68}%`,
    size: 0.8 + Math.random() * 2.2,
    minOp: 0.15 + Math.random() * 0.25,
    maxOp: 0.6 + Math.random() * 0.4,
    dur: 2 + Math.random() * 4,
    delay: Math.random() * 4,
  }));
}

/* ── Sun-ray SVG ── */
function SunRays() {
  return (
    <svg
      viewBox="0 0 120 120"
      width={120}
      height={120}
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', overflow: 'visible' }}
    >
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360;
        const inner = 56;
        const outer = 90 + (i % 3) * 12;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={60 + Math.cos(rad) * inner}
            y1={60 + Math.sin(rad) * inner}
            x2={60 + Math.cos(rad) * outer}
            y2={60 + Math.sin(rad) * outer}
            stroke="rgba(237,207,179,0.7)"
            strokeWidth={i % 3 === 0 ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export default function SealedEntry() {
  const [phase, setPhase] = useState<Phase>(() => (readUnsealed() ? 'gone' : 'sealed'));
  const [burst, setBurst] = useState(false);
  const timers = useRef<number[]>([]);
  const stars = useMemo(() => generateStars(80), []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const finish = useCallback(() => {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    try { window.dispatchEvent(new CustomEvent('luna:unsealed')); } catch { /* noop */ }
    setPhase('leaving');
    const id = window.setTimeout(() => {
      setPhase('gone');
      setBurst(true);
    }, 200);
    const backstop = window.setTimeout(() => {
      setPhase((prev) => (prev === 'gone' ? prev : 'gone'));
    }, 1000);
    timers.current.push(id, backstop);
  }, []);

  const skip = useCallback(() => {
    setPhase((prev) => {
      if (prev !== 'sealed') return prev;
      try { sessionStorage.setItem(STORAGE_KEY, 'skip'); } catch { /* noop */ }
      const id = window.setTimeout(() => {
        setPhase('gone');
        setBurst(false);
      }, 300);
      timers.current.push(id);
      return 'skipping';
    });
  }, []);

  const unseal = useCallback(() => {
    setPhase((prev) => {
      if (prev !== 'sealed') return prev;
      if (prefersReducedMotion()) {
        const id = window.setTimeout(finish, 320);
        timers.current.push(id);
        return 'leaving';
      }
      // Phase cascade: breaking → leaving → gone
      const t1 = window.setTimeout(() => setPhase('leaving'), 700);
      const t2 = window.setTimeout(finish, 1400);
      timers.current.push(t1, t2);
      return 'breaking';
    });
  }, [finish]);

  useEffect(() => {
    if (phase !== 'sealed') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') unseal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, unseal]);

  if (phase === 'gone') {
    return burst ? (
      <ConfettiBurst level="tiny" originX={0.5} originY={0.45} onComplete={() => setBurst(false)} />
    ) : null;
  }

  const breaking = phase === 'breaking' || phase === 'leaving';

  return (
    <>
      <div
        className={`sealed-entry${phase === 'leaving' || phase === 'skipping' ? ' sealed-entry--leaving' : ''}${breaking ? ' sealed-entry--veil sealed-entry--breaking' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label="Sealed birthday gift entry"
      >
        {/* Night sky background */}
        <div className="sealed-entry__sky" aria-hidden="true" />
        {/* Horizon glow — warms on sunrise */}
        <div className="sealed-entry__horizon" aria-hidden="true" />

        {/* Star field */}
        <div className="sealed-entry__stars" aria-hidden="true">
          {stars.map((s, i) => (
            <span
              key={i}
              className="sealed-entry__star"
              style={{
                left: s.left,
                top: s.top,
                width: `${s.size}px`,
                height: `${s.size}px`,
                '--star-min-op': s.minOp,
                '--star-max-op': s.maxOp,
                '--star-dur': `${s.dur}s`,
                '--star-delay': `${s.delay}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Shooting star */}
        <div className="sealed-entry__shooting-star" aria-hidden="true" />

        {/* Moon */}
        <div className="sealed-entry__moon" aria-hidden="true" />

        {/* Card content */}
        <div className="sealed-entry__card">
          <p className="sealed-entry__eyebrow">A birthday gift</p>
          <h1 className="sealed-entry__headline">For Luna</h1>
          <p className="sealed-entry__body">
            A little universe made just for you.<br />Break the seal when you&apos;re ready.
          </p>

          <div className="sealed-entry__seal-wrap">
            {/* Sun rays (appear on break) */}
            {breaking && (
              <div className={`sealed-entry__rays sealed-entry__rays--active`} aria-hidden="true">
                <SunRays />
              </div>
            )}

            <button
              type="button"
              className={`sealed-entry__seal${breaking ? ' sealed-entry__seal--breaking' : ''}`}
              onClick={unseal}
              aria-label="Break the seal and enter"
              autoFocus
            >
              <span className="sealed-entry__seal-emblem" aria-hidden="true">L</span>
            </button>

            <span
              className={`sealed-entry__ring${breaking ? ' sealed-entry__ring--active' : ''}`}
              aria-hidden="true"
            />

            <span className="sealed-entry__annotation" aria-hidden="true">open me</span>

            {breaking && <span className="sealed-entry__ribbon" aria-hidden="true" />}
            {breaking && <span className="sealed-entry__farewell" aria-hidden="true" />}
          </div>

          <button type="button" className="sealed-entry__skip" onClick={skip}>
            skip
          </button>
        </div>
      </div>

      {burst && (
        <ConfettiBurst level="tiny" originX={0.5} originY={0.45} onComplete={() => setBurst(false)} />
      )}
    </>
  );
}
