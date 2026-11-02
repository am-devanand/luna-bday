import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useInView } from 'framer-motion';
import SectionShell from './system/SectionShell';
import Eyebrow from './system/Eyebrow';
import Reveal from './system/Reveal';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './ConstellationFinale.css';

/* ─── The heart curve ─────────────────────────────────────────
   Twenty-one years of math for one sentence: I love you.
   Sampled densely, then resampled by arc length so the nineteen
   stars sit evenly around the outline instead of bunching at
   the cusp. All of it is deterministic — no randomness in the
   shape, so it never jitters between reloads.                        */

const HEART_STEPS = 1440;

const HEART_POINTS = Array.from({ length: HEART_STEPS }, (_, i) => {
  const t = (i / HEART_STEPS) * Math.PI * 2;
  return {
    x: 16 * Math.sin(t) ** 3,
    y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
  };
});

const ARC = (() => {
  const lengths = [0];
  for (let i = 1; i <= HEART_STEPS; i += 1) {
    const a = HEART_POINTS[(i - 1) % HEART_STEPS];
    const b = HEART_POINTS[i % HEART_STEPS];
    lengths.push(lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  return lengths;
})();

const STARS_BY_ARC = (() => {
  const total = ARC[ARC.length - 1];
  return Array.from({ length: 19 }, (_, k) => {
    const target = (k / 19) * total;
    let idx = 1;
    while (idx < ARC.length - 1 && ARC[idx] < target) idx += 1;
    const span = ARC[idx] - ARC[idx - 1] || 1;
    const f = (target - ARC[idx - 1]) / span;
    const a = HEART_POINTS[(idx - 1) % HEART_STEPS];
    const b = HEART_POINTS[idx % HEART_STEPS];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  });
})();

const VIEW = 440;
const PAD = 42;

const STAR_COORDS = (() => {
  const xs = STARS_BY_ARC.map((p) => p.x);
  const ys = STARS_BY_ARC.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min((VIEW - PAD * 2) / (maxX - minX), (VIEW - PAD * 2) / (maxY - minY));
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  return STARS_BY_ARC.map((p) => ({
    x: VIEW / 2 + (p.x - midX) * scale,
    y: VIEW / 2 - (p.y - midY) * scale,
  }));
})();

/* Background dust — seeded so the sky is the same every visit. */
const DUST = (() => {
  let seed = 20261106;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 64 }, (_, i) => ({
    id: i,
    x: rand() * VIEW,
    y: rand() * VIEW,
    r: 0.5 + rand() * 1.3,
    o: 0.18 + rand() * 0.42,
    delay: `${(rand() * 5).toFixed(2)}s`,
    duration: `${(3 + rand() * 4).toFixed(2)}s`,
  }));
})();

/* ─── Countdown ───────────────────────────────────────────── */

const BIRTHDAY = new Date(2026, 10, 6, 0, 0, 0).getTime();

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
}

function readRemaining(): Remaining {
  const delta = BIRTHDAY - Date.now();
  if (delta <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }
  const seconds = Math.floor(delta / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    passed: false,
  };
}

const UNITS: { key: keyof Omit<Remaining, 'passed'>; label: string }[] = [
  { key: 'days', label: 'days' },
  { key: 'hours', label: 'hours' },
  { key: 'minutes', label: 'minutes' },
  { key: 'seconds', label: 'seconds' },
];

/* ─── Component ───────────────────────────────────────────── */

export default function ConstellationFinale() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-12%' });
  const reduceMotion = usePrefersReducedMotion();

  const [litCount, setLitCount] = useState(0);
  const [run, setRun] = useState(0);
  const [remaining, setRemaining] = useState<Remaining>(() => readRemaining());

  /* Reduced motion gets the finished sky at once, not a slower animation. */
  const drawnCount = reduceMotion ? 19 : litCount;
  const complete = drawnCount >= 19;

  /* Countdown ticks once a second, and immediately catches up when the
     tab comes back into view after being throttled. */
  useEffect(() => {
    const tick = () => setRemaining(readRemaining());
    tick();
    const id = window.setInterval(tick, 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  /* Draw one star at a time once the chapter is on screen. Reduced
     motion gets the finished sky at once, not a slower animation. */
  useEffect(() => {
    if (!inView || reduceMotion) return undefined;

    /* Initial state is 0 and replay() resets it, so no sync setState here. */
    let drawn = 0;
    const id = window.setInterval(() => {
      drawn += 1;
      setLitCount(drawn);
      if (drawn >= 19) window.clearInterval(id);
    }, 240);

    return () => window.clearInterval(id);
  }, [inView, reduceMotion, run]);

  const replay = () => {
    setLitCount(0);
    setRun((value) => value + 1);
  };

  const statusLabel = reduceMotion
    ? 'Nineteen stars, already in place.'
    : complete
      ? 'Nineteen stars. One heart.'
      : `${String(drawnCount).padStart(2, '0')} / 19 stars traced`;

  return (
    <SectionShell
      label="Constellation finale"
      tone="ink"
      width="editorial"
      className="constellation"
    >
      <div ref={sectionRef} className="constellation__grid">
        <Reveal className="constellation__sky">
          <div className="constellation__sky-glow" aria-hidden="true" />

          <svg
            className="constellation__svg"
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            role="img"
            aria-label="A heart traced by nineteen stars, closing around the name Luna"
          >
            <g aria-hidden="true">
              {DUST.map((star) => (
                <circle
                  key={star.id}
                  className="constellation__dust"
                  cx={star.x}
                  cy={star.y}
                  r={star.r}
                  style={
                    {
                      opacity: star.o,
                      '--twinkle-delay': star.delay,
                      '--twinkle-duration': star.duration,
                    } as CSSProperties
                  }
                />
              ))}
            </g>

            <g className="constellation__lines" aria-hidden="true">
              {STAR_COORDS.map((point, i) => {
                const next = STAR_COORDS[(i + 1) % STAR_COORDS.length];
                const drawn = i < drawnCount - 1;
                return (
                  <line
                    key={`line-${i}`}
                    x1={point.x}
                    y1={point.y}
                    x2={next.x}
                    y2={next.y}
                    pathLength={1}
                    className={`constellation__line${drawn ? ' is-drawn' : ''}`}
                  />
                );
              })}
            </g>

            <g className="constellation__stars" aria-hidden="true">
              {STAR_COORDS.map((point, i) => {
                const lit = i < drawnCount;
                return (
                  <g
                    key={`star-${i}`}
                    className={`constellation__star${lit ? ' is-lit' : ''}`}
                    style={{ '--star-delay': `${i * 0.02}s` } as CSSProperties}
                  >
                    <circle className="constellation__star-halo" cx={point.x} cy={point.y} r={8} />
                    <circle className="constellation__star-core" cx={point.x} cy={point.y} r={2.6} />
                  </g>
                );
              })}
            </g>
          </svg>

          <div className={`constellation__core${complete ? ' is-visible' : ''}`} aria-hidden={!complete}>
            <span className="constellation__core-num">19</span>
            <span className="constellation__core-name">Luna</span>
            <span className="constellation__core-note">my whole sky</span>
          </div>

          <p className="constellation__status" aria-live="polite">
            {statusLabel}
          </p>

          {!reduceMotion && (
            <button
              type="button"
              className="constellation__replay"
              onClick={replay}
              disabled={!inView}
            >
              {complete ? 'Trace it again' : 'Trace the stars'}
            </button>
          )}
        </Reveal>

        <Reveal className="constellation__copy" delay={0.12}>
          <Eyebrow className="constellation__eyebrow">The last page</Eyebrow>
          <h2 className="constellation__title">
            Every star I could find,
            <br />
            arranged into you.
          </h2>
          <p className="constellation__body">
            Nineteen stars for nineteen years — one for each November you made the world
            softer. Follow them and they close into the only shape that matters.
          </p>

          <div className="constellation__countdown" aria-label="Countdown to Luna's birthday">
            <p className="constellation__countdown-kicker">
              {remaining.passed ? 'It has begun' : 'Until 06 · 11 · 2026'}
            </p>

            {remaining.passed ? (
              <p className="constellation__arrived">
                It&apos;s your day, Luna. The candles are lit, the stars showed up, and so did I.
              </p>
            ) : (
              <div className="constellation__clock">
                {UNITS.map((unit) => (
                  <div className="constellation__unit" key={unit.key}>
                    <span className="constellation__unit-value">
                      {String(remaining[unit.key]).padStart(2, '0')}
                    </span>
                    <span className="constellation__unit-label">{unit.label}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="constellation__countdown-note">
              {remaining.passed
                ? 'Nothing here expires at midnight.'
                : 'Not that I’m counting. (I am.)'}
            </p>
          </div>

          <p className="constellation__sign">always, Dev</p>
        </Reveal>
      </div>
    </SectionShell>
  );
}
