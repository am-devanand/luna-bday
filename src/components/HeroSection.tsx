  import { useState, useEffect, useCallback, useRef, useLayoutEffect, type RefObject, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AmbientSparkles from './magic/AmbientSparkles';
import ConfettiBurst from './magic/ConfettiBurst';
import './HeroSection.css';

const BG_IMAGE_PATH = '/images/luna/hero.jpg';
const BG_IMAGE_AVIF = '/images/luna/hero-480w.avif 480w, /images/luna/hero-720w.avif 720w';
const BG_IMAGE_SIZES = '100vw';
const BG_IMAGE_PRELOAD = '/images/luna/hero-720w.avif';

/* ─── Timeline (ms) — refined cascade, each beat has room to breathe ─── */
const T = {
  /* Phase 0 — Sealed hold (0–0.5s) */
  HOLD: 400,           // Anticipation beat on sealed black
  SPARKLE_1: 500,      // Center sparkle ignites — a single point of gold in the dark
  SPARKLE_2: 680,      // Orbit slowly fans out
  SPARKLE_3: 860,
  SPARKLE_4: 1040,
  SPARKLE_5: 1200,
  RIBBON: 1380,        // Gold ribbon sweeps — gift metaphor (0.7s run)
  LIGHT_LEAK: 1700,    // Warm amber bleeds from the edges
  APERTURE: 2000,      // Iris opens — the big reveal (was 1750, now breathes more)
  DUST: 2200,          // Particles begin drifting
  GRAIN: 2350,         // Photographic grain settles
  BLOOM: 2500,         // Warm bloom washes over

  /* Phase 2 — Kinetic typography (2.7s–4.0s) — each word lands, holds, then next */
  WORD_1: 2700,        // "HAPPY" — per-letter blur-rise
  WORD_2: 2980,        // "19TH"
  WORD_3: 3260,        // "BIRTHDAY" + shimmer sweep
  DIVIDER: 3480,       // Gold line draws in
  NAME: 3650,          // "Swethaaa" — the emotional anchor
  SUBTITLE: 3840,      // Subtitle whispers in
  BUTTON_DOT: 3960,    // Button: tiny gold dot
  BUTTON_OUTLINE: 4080,// Button: outline ring expands
  BUTTON_FILL: 4160,   // Button: fills with gold
  BUTTON_TEXT: 4260,   // Button: text appears
};

/* ─── ENTER click sequence (ms) — inhale + three acts, total ≤1800ms ─── */
/* MERGE (1200) + SETTLE_END (1500) are frozen timing contracts. */
const ENTER_SEQ = {
  INHALE: 120,       // Anticipation: button inhales (scale 0.94) before release
  DISPERSE_END: 470, // Act 1 end: letters scattered, rings expanding (= INHALE + 350)
  RING_OUT: 1050,    // Rings unmount (ring 2 starts +120ms, runs 800ms)
  BLOOM_END: 1070,   // Act 2 end: flash + trails fade (= DISPERSE_END + 600)
  MERGE: 1200,       // Act 3: compact merge (existing timing contract, unchanged)
  SETTLE_END: 1500,  // Settle cue on, sequence done (unchanged)
};

/* ─── ENTER letter dispersal vectors (px drift + deg rotate) ───── */
const ENTER_LETTER_DRIFT = [
  { x: -46, y: -30, r: -16 },
  { x: -26, y: -42, r: -9 },
  { x: -8, y: -48, r: -4 },
  { x: 10, y: -46, r: 5 },
  { x: 28, y: -36, r: 10 },
  { x: 8, y: -12, r: 0 },
  { x: 48, y: -20, r: 10 },
];

/* ─── Sparkle-trail configs (four-point stars rising on bloom) ─── */
const ENTER_TRAILS = [
  { dx: '-52px', delay: '0ms', size: '12px' },
  { dx: '-36px', delay: '60ms', size: '8px' },
  { dx: '-20px', delay: '120ms', size: '14px' },
  { dx: '-8px', delay: '40ms', size: '9px' },
  { dx: '6px', delay: '100ms', size: '12px' },
  { dx: '18px', delay: '20ms', size: '7px' },
  { dx: '30px', delay: '140ms', size: '11px' },
  { dx: '44px', delay: '80ms', size: '8px' },
  { dx: '-44px', delay: '160ms', size: '9px' },
  { dx: '12px', delay: '200ms', size: '13px' },
];

/* ─── Gold-dust column configs (rising dots during disperse) ───────── */
const ENTER_GOLD_DUST = [
  { dx: '-26px', delay: '0ms' },
  { dx: '-16px', delay: '40ms' },
  { dx: '-8px', delay: '80ms' },
  { dx: '0px', delay: '20ms' },
  { dx: '8px', delay: '100ms' },
  { dx: '16px', delay: '60ms' },
  { dx: '26px', delay: '140ms' },
];

/* ─── Idle orbit sparkle offsets (converge on the pill, 6s loop) ───── */
const ENTER_ORBITS = [
  { ox: '-46px', oy: '-30px', delay: '0s' },
  { ox: '48px', oy: '-22px', delay: '2s' },
  { ox: '4px', oy: '38px', delay: '4s' },
];

/* ─── Four-point star path (matches AmbientSparkles idiom) ─────── */
const STAR_PATH = 'M12 2 C13.5 8.5 15.5 10.5 22 12 C15.5 13.5 13.5 15.5 12 22 C10.5 15.5 8.5 13.5 2 12 C8.5 10.5 10.5 8.5 12 2 Z';

/* ─── Sparkle constellation ──────────────────────────── */
const SPARKLE_POSITIONS = [
  { x: '50%', y: '50%' },        // center — anchor
  { x: '38%', y: '44%' },        // upper-left orbit
  { x: '62%', y: '56%' },        // lower-right orbit
  { x: '42%', y: '58%' },        // lower-left orbit
  { x: '58%', y: '42%' },        // upper-right orbit
];

const SPARKLE_DRIFT = [
  { x: 0, y: 0 },
  { x: -20, y: -14 },
  { x: 24, y: 16 },
  { x: -16, y: 18 },
  { x: 18, y: -12 },
];

/* ─── Dust mote configs ──────────────────────────────── */
const DUST_MOTES = [
  { x: '30%', y: '38%', delay: '0s', size: '2px', dur: '7s' },
  { x: '58%', y: '32%', delay: '1.5s', size: '3px', dur: '9s' },
  { x: '42%', y: '62%', delay: '2.8s', size: '2px', dur: '8s' },
  { x: '68%', y: '48%', delay: '1s', size: '2.5px', dur: '10s' },
  { x: '28%', y: '55%', delay: '2s', size: '2px', dur: '7.5s' },
  { x: '50%', y: '28%', delay: '3.5s', size: '1.5px', dur: '11s' },
];

/* ─── ChevronDown inline SVG ─────────────────────────── */
function ChevronDown() {
  return (
    <svg
      className="hero-section__scroll-chevron"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* ─── THE one and only ENTER button (single <button> in this file) ───── */
/* Morph stages (dot/outline/filled) are decorative spans; both the cinematic
   path and the reduced-motion path render this component. */
function EnterButton({
  enchanted,
  dispersing,
  inhaling,
  buttonRef,
  onEnter,
}: {
  enchanted: boolean;
  dispersing: boolean;
  inhaling: boolean;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onEnter: () => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onEnter}
      aria-label="Enter website"
      tabIndex={dispersing ? -1 : undefined}
      className={
        `hero-section__enter` +
        (enchanted ? ' hero-section__enter--enchanted' : '') +
        (dispersing ? ' hero-section__enter--dispersing' : '') +
        (inhaling ? ' hero-section__enter--inhale' : '')
      }
    >
      {enchanted ? (
        'ENTER →'.split('').map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="hero-section__enter-letter"
            style={{
              '--i': i,
              '--dx': `${ENTER_LETTER_DRIFT[i]?.x ?? 0}px`,
              '--dy': `${ENTER_LETTER_DRIFT[i]?.y ?? 0}px`,
              '--rot': `${ENTER_LETTER_DRIFT[i]?.r ?? 0}deg`,
            } as CSSProperties}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))
      ) : (
        'ENTER →'
      )}
      {enchanted && (
        <span className="hero-section__enter-orbit" aria-hidden="true">
          {ENTER_ORBITS.map((o, i) => (
            <svg
              key={i}
              className="hero-section__enter-orbit-star"
              viewBox="0 0 24 24"
              style={{ '--ox': o.ox, '--oy': o.oy, '--orbit-delay': o.delay } as CSSProperties}
            >
              <path d={STAR_PATH} />
            </svg>
          ))}
        </span>
      )}
    </button>
  );
}

/* ─── Gold divider with diamond ──────────────────────── */
function GoldDivider({ show }: { show: boolean }) {
  return (
    <motion.div
      className={`hero-section__divider ${show ? 'hero-section__divider--visible' : ''}`}
      initial={{ opacity: 0 }}
      animate={show ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <span className="hero-section__divider-diamond" />
    </motion.div>
  );
}

/* ─── Kinetic word: per-letter blur(8px)→0 + y 24→0, 45ms stagger ────── */
/* After the last letter lands, ONE gold shimmer sweeps the line, then unmounts. */
/* Reduced-motion renders the plain static word (no framer stagger, no shine). */
const KINETIC_STAGGER = 45;
function KineticWord({ text, revealed }: { text: string; revealed: boolean }) {
  const [shine, setShine] = useState(false);
  const reduced = isReducedMotion();
  useEffect(() => {
    if (!revealed || reduced) return;
    const lettersMs = text.length * KINETIC_STAGGER + 450;
    const on = window.setTimeout(() => setShine(true), lettersMs);
    const off = window.setTimeout(() => setShine(false), lettersMs + 950);
    return () => { window.clearTimeout(on); window.clearTimeout(off); };
  }, [revealed, reduced, text]);
  if (!revealed)
    return (
      <span className="hero-section__word-wrapper">
        <span className="hero-section__word" style={{ opacity: 0 }} aria-hidden="true">
          {text}
        </span>
      </span>
    );
  if (reduced) return (
    <span className="hero-section__word-wrapper">
      <span className="hero-section__word">{text}</span>
    </span>
  );
  return (
    <span className="hero-section__word-wrapper hero-section__kinetic-word">
      {text.split('').map((ch, i) => (
        <motion.span
          key={`${text}-${i}`}
          className="hero-section__word hero-section__kinetic-letter"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          {ch}
        </motion.span>
      ))}
      <span className="hero-section__word hero-section__kinetic-a11y">{text}</span>
      {shine && (
        <span className="hero-section__word hero-section__kinetic-shine" aria-hidden="true">
          {text}
        </span>
      )}
    </span>
  );
}

/* ═══ Component ════════════════════════════════════════ */

/* ── Seal-arrival helpers: sessionStorage ritual key + reduced-motion probe ── */
function readSealArrival(): boolean {
  try {
    return sessionStorage.getItem('luna-unsealed') === '1';
  } catch {
    return false;
  }
}

function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Desktop keeps the full-bleed cinematic portrait; the compact portrait card is for narrow screens. */
function shouldCompact(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(max-width: 768px)').matches;
}
export default function HeroSection() {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  /* Seal arrival → auto-merge ritual (zero clicks); reduced-motion + seal settles instantly. */
  const [autoMerge] = useState(readSealArrival);
  const [autoReducedSettled] = useState(() => autoMerge && isReducedMotion());
  const [entered, setEntered] = useState(autoReducedSettled);
  const [showPostEnter, setShowPostEnter] = useState(autoReducedSettled);
  /* Cinematic exit guard: force-unmounts the pre-enter caption stack if the 300ms
     AnimatePresence exit ever stalls (a frozen mid-exit twin = permanent smeared
     subtitle). Healthy case: the twin is already gone, so this flag is a no-op. */
  const [cinematicGone, setCinematicGone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [mergePhase, setMergePhase] = useState<'idle' | 'compact'>(autoReducedSettled && shouldCompact() ? 'compact' : 'idle');
  /* ENTER click sequence states (inhale + three acts, total ≤1800ms) */
  const [enterPhase, setEnterPhase] = useState<'idle' | 'inhale' | 'disperse' | 'bloom' | 'settle' | 'done'>('idle');
  const [showShockwave, setShowShockwave] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showTrails, setShowTrails] = useState(false);
  const [showGoldDust, setShowGoldDust] = useState(false);
  const [showSettleCue, setShowSettleCue] = useState(autoReducedSettled);
  const [burstOrigin, setBurstOrigin] = useState({ x: 0, y: 0 });
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0.3, y: 0.8 });
  const settleRef = useRef(false);
  /* Live seal bridge: mount-read misses the post-mount seal click, so the
     seal-break finish also dispatches 'luna:unsealed' — subscribed below. */
  const [liveAuto, setLiveAuto] = useState(false);
  const [showSharedGlow, setShowSharedGlow] = useState(false);
  const mountTimeRef = useRef(0);
  useEffect(() => { mountTimeRef.current = Date.now(); }, []);
  const enteredRef = useRef(false);
  useEffect(() => { enteredRef.current = entered; }, [entered]);

  /* Animation phase states */
  const [showBlack, setShowBlack] = useState(true);
  const [sparkleVisible, setSparkleVisible] = useState<boolean[]>([false, false, false, false, false]);
  const [showRibbon, setShowRibbon] = useState(false);
  const [showRibbonTip, setShowRibbonTip] = useState(false);
  const [showLightLeak, setShowLightLeak] = useState(false);
  const [apertureOpen, setApertureOpen] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [showGrain, setShowGrain] = useState(false);
  const [showBloom, setShowBloom] = useState(false);
  const [wordRevealed, setWordRevealed] = useState<boolean[]>([false, false, false]);
  const [showDivider, setShowDivider] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [buttonPhase, setButtonPhase] = useState<'hidden' | 'dot' | 'outline' | 'filled' | 'text'>('hidden');

  const skipped = useRef(false);
  const autoDoneRef = useRef(false);
  const liveSettledRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const [ribbonTipRange, setRibbonTipRange] = useState<{ start: number; end: number } | null>(null);

  /* ── Preload image ── */
  useEffect(() => {
    const img = new Image();
    let cancelled = false;
    img.onload = () => { if (!cancelled) setImageStatus('loaded'); };
    img.onerror = () => { if (!cancelled) setImageStatus('error'); };
    img.src = BG_IMAGE_PRELOAD;
    return () => { cancelled = true; img.onload = null; img.onerror = null; };
  }, []);

  /* ── Skip cinematic (graceful 300ms cascade) ── */
  const skipToEnd = useCallback(() => {
    if (skipped.current) return;
    skipped.current = true;

    setShowBlack(false);
    setApertureOpen(true);
    setShowLightLeak(true);
    setShowSharedGlow(false);
    timersRef.current.push(
      window.setTimeout(() => {
        setShowDust(true);
        setShowGrain(true);
        setShowBloom(true);
        setSparkleVisible([true, true, true, true, true]);
        setShowRibbon(true);
        setShowRibbonTip(true);
      }, 80),
      window.setTimeout(() => {
        setWordRevealed([true, true, true]);
        setShowDivider(true);
        setShowName(true);
        setShowSubtitle(true);
        setButtonPhase('text');
      }, 200),
      window.setTimeout(() => {
        setShowRibbon(false);
        setShowRibbonTip(false);
      }, 1100),
    );
  }, []);

  /* ── Skip event listeners ── */
  useEffect(() => {
    const handleSkip = (e: Event) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return;
      skipToEnd();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        if (
          buttonRef.current &&
          document.activeElement === buttonRef.current &&
          (e.key === 'Enter' || e.key === ' ')
        ) return;
        skipToEnd();
      }
    };

    window.addEventListener('wheel', handleSkip, { passive: true });
    window.addEventListener('touchstart', handleSkip, { passive: true });
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('wheel', handleSkip);
      window.removeEventListener('touchstart', handleSkip);
      window.removeEventListener('keydown', handleKey);
    };
  }, [skipToEnd]);

  /* ── Ribbon-tip travel range (8%→92% of container, as pixels) ── */
  useLayoutEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      setRibbonTipRange({ start: w * 0.08, end: w * 0.92 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* ── Clear skip/enter timers on unmount ── */
  useEffect(() => {
    const pending = timersRef.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /* ── Animation timeline ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const s = (delay: number, fn: () => void) =>
      setTimeout(() => { if (!skipped.current) fn(); }, delay);

    const timers = [
      s(T.SPARKLE_1, () => {
        setSparkleVisible(p => { const n = [...p]; n[0] = true; return n; });
        /* Shared-light continuity: the constellation ignites from the gate's last glow. */
        setShowSharedGlow(true);
      }),
      s(T.SPARKLE_2, () => setSparkleVisible(p => { const n = [...p]; n[1] = true; return n; })),
      s(T.SPARKLE_3, () => setSparkleVisible(p => { const n = [...p]; n[2] = true; return n; })),
      s(T.SPARKLE_4, () => setSparkleVisible(p => { const n = [...p]; n[3] = true; return n; })),
      s(T.SPARKLE_5, () => setSparkleVisible(p => { const n = [...p]; n[4] = true; return n; })),
      s(T.SPARKLE_1 + 1400, () => setShowSharedGlow(false)),
      s(T.RIBBON, () => { setShowRibbon(true); setShowRibbonTip(true); }),
      s(T.RIBBON + 1000, () => { setShowRibbon(false); setShowRibbonTip(false); }),
      s(T.LIGHT_LEAK, () => setShowLightLeak(true)),
      s(T.APERTURE, () => { setApertureOpen(true); setShowBlack(false); }),
      s(T.DUST, () => setShowDust(true)),
      s(T.GRAIN, () => setShowGrain(true)),
      s(T.BLOOM, () => setShowBloom(true)),
      s(T.WORD_1, () => setWordRevealed(p => { const n = [...p]; n[0] = true; return n; })),
      s(T.WORD_2, () => setWordRevealed(p => { const n = [...p]; n[1] = true; return n; })),
      s(T.WORD_3, () => setWordRevealed(p => { const n = [...p]; n[2] = true; return n; })),
      s(T.DIVIDER, () => setShowDivider(true)),
      s(T.NAME, () => setShowName(true)),
      s(T.SUBTITLE, () => setShowSubtitle(true)),
      s(T.BUTTON_DOT, () => setButtonPhase('dot')),
      s(T.BUTTON_OUTLINE, () => setButtonPhase('outline')),
      s(T.BUTTON_FILL, () => setButtonPhase('filled')),
      s(T.BUTTON_TEXT, () => setButtonPhase('text')),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  /* ── Post-enter timer ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReduced ? 100 : T.BUTTON_TEXT + 700;
    const timer = setTimeout(() => setShowPostEnter(true), delay);
    return () => clearTimeout(timer);
  }, []);

  /* Cinematic exit guard: the exit below runs 300ms; if it stalls, force-unmount
     the exiting twin at 450ms (already at opacity 0, so the cut is invisible).
     True conditional unmount — never opacity-only. */
  useEffect(() => {
    if (!entered || cinematicGone) return;
    const kill = window.setTimeout(() => setCinematicGone(true), 450);
    return () => window.clearTimeout(kill);
  }, [entered, cinematicGone]);

  /* ── Seal-arrival auto-merge: full cascade plays, then settles to compact (no ENTER) ── */
  /* Mount path (autoMerge via sessionStorage) + live path (liveAuto via 'luna:unsealed'
     event) share one settle mark: mount + BUTTON_TEXT + 600. Reuses the mergePhase
     compact machinery; ENTER button is unmounted (not hidden). */
  useEffect(() => {
    const autoActive = autoMerge || liveAuto;
    if (!autoActive) return;
    if (isReducedMotion()) {
      skipped.current = true;
      autoDoneRef.current = true;
      return;
    }
    const settleAuto = () => {
      if (autoDoneRef.current) return;
      autoDoneRef.current = true;
      timersRef.current.forEach(clearTimeout);
      timersRef.current.length = 0;
      skipToEnd();
      skipped.current = true;
      setEntered(true);
      setMergePhase(shouldCompact() ? 'compact' : 'idle');
      setShowSettleCue(true);
      setShowConfetti(false);
      // Delay post-enter so AnimatePresence exit (300ms) finishes first
      timersRef.current.push(window.setTimeout(() => setShowPostEnter(true), 420));
    };
    const settleTimer = window.setTimeout(() => {
      if (autoDoneRef.current) return;
      autoDoneRef.current = true;
      setEntered(true);
      setMergePhase(shouldCompact() ? 'compact' : 'idle');
      setShowSettleCue(true);
      setShowConfetti(false);
      // Delay post-enter so AnimatePresence exit (300ms) finishes first
      timersRef.current.push(window.setTimeout(() => setShowPostEnter(true), 420));
    }, autoMerge ? T.BUTTON_TEXT + 600 : Math.max(0, mountTimeRef.current + T.BUTTON_TEXT + 600 - Date.now()));
    timersRef.current.push(settleTimer);
    window.addEventListener('click', settleAuto);
    window.addEventListener('keydown', settleAuto);
    window.addEventListener('wheel', settleAuto, { passive: true });
    window.addEventListener('touchstart', settleAuto, { passive: true });
    return () => {
      window.removeEventListener('click', settleAuto);
      window.removeEventListener('keydown', settleAuto);
      window.removeEventListener('wheel', settleAuto);
      window.removeEventListener('touchstart', settleAuto);
    };
  }, [autoMerge, liveAuto, skipToEnd]);

  /* ── Live seal bridge: the seal click lands AFTER mount, when the sessionStorage
     read above has already resolved false. The seal-break finish dispatches
     'luna:unsealed'; here we re-ignite the shared glow (overlapping the gate's
     150ms farewell hold) and arm live-auto so the cascade settles itself at the
     same BUTTON_TEXT+600 mark — zero further clicks. Stale events (already
     entered/settled) are ignored. Reduced-motion settles synchronously in the
     handler (no effect-setState). Listener removed on unmount. ── */
  useEffect(() => {
    const onUnsealed = () => {
      if (autoMerge) return;
      if (autoDoneRef.current || settleRef.current || liveSettledRef.current) return;
      if (enteredRef.current) return;
      if (isReducedMotion()) {
        autoDoneRef.current = true;
        liveSettledRef.current = true;
        skipped.current = true;
        setEntered(true);
        setMergePhase(shouldCompact() ? 'compact' : 'idle');
        setShowSettleCue(true);
        setShowPostEnter(true);
        return;
      }
      /* Shared-light continuity: hero glow blooms as the gate lifts. */
      setShowSharedGlow(true);
      const glowOff = window.setTimeout(() => setShowSharedGlow(false), 1400);
      timersRef.current.push(glowOff);
      liveSettledRef.current = true;
      setLiveAuto(true);
    };
    window.addEventListener('luna:unsealed', onUnsealed);
    return () => window.removeEventListener('luna:unsealed', onUnsealed);
  }, [autoMerge]);

  /* ── ENTER click: inhale + three-act magical transition (total ≤1800ms) ── */
  /* Timer map: t+0 press → inhale (120ms anticipation) → t+120 disperse
     (letters 32ms stagger + dual rings + small burst + gold dust) →
     t+470 bloom (entered + warm flash + trails) → t+1050 rings out →
     t+1070 settle (flash out) → t+1200 compact merge (frozen) →
     t+1500 cue + done. */
  const fastForwardEnter = useCallback(() => {
    if (enterPhase === 'idle' || settleRef.current) return;
    settleRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current.length = 0;
    setRipple(false);
    setShowShockwave(false);
    setShowFlash(false);
    setShowTrails(false);
    setShowGoldDust(false);
    setEntered(true);
    setEnterPhase('done');
    setMergePhase(shouldCompact() ? 'compact' : 'idle');
    setShowSettleCue(true);
  }, [enterPhase]);

  const handleEnter = useCallback(() => {
    if (entered || settleRef.current) return;
    if (enterPhase !== 'idle') { fastForwardEnter(); return; }
    skipped.current = true;
    const prefersReducedClick = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setBurstOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setConfettiOrigin({
        x: Math.min(0.95, Math.max(0.05, (rect.left + rect.width / 2) / window.innerWidth)),
        y: Math.min(0.95, Math.max(0.05, (rect.top + rect.height / 2) / window.innerHeight)),
      });
    }
    if (prefersReducedClick) {
      settleRef.current = true;
      setEntered(true);
      setShowConfetti(true);
      setMergePhase(shouldCompact() ? 'compact' : 'idle');
      setShowSettleCue(true);
      return;
    }
    setEnterPhase('inhale');
    timersRef.current.push(
      window.setTimeout(() => {
        setEnterPhase('disperse');
        setShowShockwave(true);
        setRipple(true);
        setShowConfetti(true);
        setShowGoldDust(true);
      }, ENTER_SEQ.INHALE),
      window.setTimeout(() => setRipple(false), ENTER_SEQ.INHALE + 600),
      window.setTimeout(() => {
        setEnterPhase('bloom');
        setShowFlash(true);
        setShowTrails(true);
        setEntered(true);
      }, ENTER_SEQ.DISPERSE_END),
      window.setTimeout(() => setShowShockwave(false), ENTER_SEQ.RING_OUT),
      window.setTimeout(() => {
        setShowFlash(false);
        setEnterPhase('settle');
      }, ENTER_SEQ.BLOOM_END),
      window.setTimeout(() => setMergePhase(shouldCompact() ? 'compact' : 'idle'), ENTER_SEQ.MERGE),
      window.setTimeout(() => {
        setShowTrails(false);
        setShowGoldDust(false);
        setShowSettleCue(true);
        setEnterPhase('done');
      }, ENTER_SEQ.SETTLE_END),
    );
  }, [entered, enterPhase, fastForwardEnter]);

  /* ── Fast-forward: any keypress/click mid-sequence jumps to settled end ── */
  useEffect(() => {
    if (enterPhase === 'idle' || enterPhase === 'done') return;
    const onClick = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      fastForwardEnter();
    };
    const onKey = () => fastForwardEnter();
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [enterPhase, fastForwardEnter]);

  /* ── Reduced motion fallback ── */
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  if (prefersReduced) {
    return (
      <section className={`hero-section ${mergePhase === 'compact' ? 'hero-section--compact' : ''}`} aria-label="Hero" role="banner">
        {imageStatus !== 'error' && (
          <picture>
            <source type="image/avif" srcSet={BG_IMAGE_AVIF} sizes={BG_IMAGE_SIZES} />
            <img src={BG_IMAGE_PATH} alt="" aria-hidden="true" className="hero-section__bg hero-section__bg--loaded" />
          </picture>
        )}
        {imageStatus === 'error' && <div className="hero-section__fallback" aria-hidden="true" />}
        <div className="hero-section__color-grade" aria-hidden="true" />
        <div className="hero-section__vignette" aria-hidden="true" />
        <div className="hero-section__overlay" aria-hidden="true" />
        <div className="hero-section__caption-scrim" aria-hidden="true" />
        <div className="hero-section__content">
          <div className="hero-section__pre-title">
            <span className="hero-section__word">HAPPY</span>
            <span className="hero-section__word">19TH</span>
            <span className="hero-section__word">BIRTHDAY</span>
          </div>
          <div className="hero-section__divider" aria-hidden="true">
            <span className="hero-section__divider-diamond" />
          </div>
          <h1 className="hero-section__title">
            <span className="hero-section__title-gradient">Swethaaa</span>
          </h1>
          <p className="hero-section__subtitle">A little universe, lit only for you.</p>
          {!autoMerge && !liveAuto && <EnterButton enchanted={false} dispersing={false} inhaling={false} buttonRef={buttonRef} onEnter={handleEnter} />}
        </div>
        <div className="hero-section__scroll" aria-hidden="true">
          <span className="hero-section__scroll-label">Scroll</span>
          <ChevronDown />
        </div>
        {showConfetti && <ConfettiBurst level="small" />}
      </section>
    );
  }

  /* ═══ Full cinematic sequence ═══════════════════════ */

  // ── Sparkle renderer ──
  const renderSparkle = (idx: number) => {
    if (!sparkleVisible[idx]) return null;
    const isCenter = idx === 0;
    return (
      <div
        key={`sparkle-wrapper-${SPARKLE_POSITIONS[idx].x}-${SPARKLE_POSITIONS[idx].y}`}
        style={{
          position: 'absolute',
          left: SPARKLE_POSITIONS[idx].x,
          top: SPARKLE_POSITIONS[idx].y,
          transform: 'translate(-50%, -50%)',
          zIndex: 19,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          className={`hero-section__sparkle ${isCenter ? 'hero-section__sparkle--center' : ''}`}
          style={{
            position: 'relative',
            width: isCenter ? '4px' : idx < 3 ? '3px' : '2.5px',
            height: isCenter ? '4px' : idx < 3 ? '3px' : '2.5px',
          }}
          initial={
            isCenter
              ? { opacity: 0, scale: 0 }
              : { opacity: 0, scale: 0, x: SPARKLE_DRIFT[idx].x, y: SPARKLE_DRIFT[idx].y }
          }
          animate={
            isCenter
              ? { opacity: 1, scale: [1, 1.6, 1] }
              : { opacity: 1, scale: [0.8, 1.1, 0.9], x: 0, y: 0 }
          }
          transition={
            isCenter
              ? { duration: 0.6, ease: 'easeOut' }
              : {
                  x: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 1.6, ease: [0.34, 1.1, 0.5, 1] },
                  opacity: { duration: 0.4, ease: 'easeOut' },
                  scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                }
          }
        />
      </div>
    );
  };

  return (
    <motion.section
      layout
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`hero-section ${mergePhase === 'compact' ? 'hero-section--compact' : ''}`}
      aria-label="Hero"
      role="banner"
      ref={containerRef}
    >
      {/* ══════════════════════════════════════════════════
         PHASE 1 — DARK ANTICIPATION (0–2.2s)
         ══════════════════════════════════════════════════ */}

      {/* 0.0s–2.2s: Rich warm-black prelude */}
      <AnimatePresence>
        {showBlack && (
          <motion.div
            className="hero-section__black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Subtle texture in the black — like fine wrapping paper */}
            <div className="hero-section__black-texture" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0.45s–1.05s: Sparkle constellation (after the 400ms sealed hold) */}
      {renderSparkle(0)}
      {[1, 2, 3, 4].map(i => renderSparkle(i))}

      {/* Shared-light continuity: the constellation ignites from the gate's last glow. */}
      {showSharedGlow && (
        <div className="hero-section__shared-glow" aria-hidden="true" />
      )}

      {/* 1.6s: Gold ribbon sweep — the gift wrap metaphor */}
      {showRibbon && mergePhase !== 'compact' && (
        <>
          <motion.div
            className="hero-section__ribbon"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.25, 0.7, 1], ease: 'easeInOut' }}
          />
          {showRibbonTip && (
            <motion.div
              className="hero-section__ribbon-tip"
              initial={{ x: ribbonTipRange?.start ?? 0, y: '-50%', opacity: 0 }}
              animate={{ x: ribbonTipRange?.end ?? 0, y: '-50%', opacity: [0, 1, 0.7, 0] }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </>
      )}

      {/* 1.8s: Warm light leak — light through wrapping paper */}
      {showLightLeak && (
        <motion.div
          className="hero-section__light-leak"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}

      {/* Giant translucent 19 — recurring motif background */}
      <div className="hero-section__bg-nineteen" aria-hidden="true">19</div>

      {/* ══════════════════════════════════════════════════
         PHASE 2 — UNWRAPPING (2.2s+)
         ══════════════════════════════════════════════════ */}

      {/* 1.75s: Aperture opens — photo revealed with warmth ramp */}
      <motion.div
        className={`hero-section__aperture ${entered ? 'hero-section__aperture--entered' : ''} ${enterPhase === 'bloom' ? 'hero-section__aperture--bloom' : ''}`}
        initial={{ clipPath: 'inset(50% 0 50% 0)' }}
        animate={{
          clipPath: apertureOpen ? 'inset(0 0 0 0)' : 'inset(50% 0 50% 0)',
          scale: entered ? [1, 1.015, 1.006] : 1,
        }}
        transition={{
          clipPath: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {imageStatus !== 'error' && (
          <picture>
            <source type="image/avif" srcSet={BG_IMAGE_AVIF} sizes={BG_IMAGE_SIZES} />
            <img
              src={BG_IMAGE_PATH}
              alt=""
              aria-hidden="true"
              className={`hero-section__bg hero-section__bg--cinematic ${apertureOpen ? 'hero-section__bg--develop' : ''} ${
                imageStatus === 'loaded' ? 'hero-section__bg--loaded' : 'hero-section__bg--loading'
              }`}
            />
          </picture>
        )}
      </motion.div>

      {imageStatus === 'error' && <div className="hero-section__fallback" aria-hidden="true" />}

      {/* Warm color grade — golden hour film treatment */}
      <div className="hero-section__color-grade" aria-hidden="true" />

      {/* Vignette — photographic depth */}
      <div className="hero-section__vignette" aria-hidden="true" />

      {/* Light bloom — soft golden glow */}
      <motion.div
        className="hero-section__bloom"
        initial={{ opacity: 0 }}
        animate={showBloom ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        aria-hidden="true"
      />

      {/* Film grain */}
      <div
        className={`hero-section__grain ${showGrain ? 'hero-section__grain--visible' : ''}`}
        aria-hidden="true"
      />

      {/* Floating particles */}
      {showDust && DUST_MOTES.map((mote, i) => (
        <div
          key={`dust-${i}`}
          className="hero-section__dust"
          style={{
            left: mote.x,
            top: mote.y,
            width: mote.size,
            height: mote.size,
            animationDelay: mote.delay,
            animationDuration: mote.dur,
          }}
        />
      ))}

      {/* Gradient overlay — text readability */}
      <div className="hero-section__overlay" aria-hidden="true" />
      <div className="hero-section__caption-scrim" aria-hidden="true" />

      {/* Ambient sparkles (after aperture, only on photo area) */}
      {apertureOpen && imageStatus === 'loaded' && (
        <AmbientSparkles density="low" color="var(--gold-light, #E0C99A)" twinkle />
      )}

      {/* ══════════════════════════════════════════════════
         PHASE 3 — TYPOGRAPHY & INTERACTION (3.2s+)
         ══════════════════════════════════════════════════ */}

      <div className="hero-section__content">
        {!cinematicGone && (
        <AnimatePresence mode="wait" onExitComplete={() => setCinematicGone(true)}>
          {!entered && (
            <motion.div
              key="cinematic-content"
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pre-title: kinetic blur-rise, 45ms stagger, single gold shine */}
              <div className="hero-section__pre-title">
                <KineticWord text="HAPPY" revealed={wordRevealed[0]} />
                <KineticWord text="19TH" revealed={wordRevealed[1]} />
                <KineticWord text="BIRTHDAY" revealed={wordRevealed[2]} />
              </div>

              {/* Gold decorative divider */}
              <GoldDivider show={showDivider} />

              {/* Name — the emotional anchor */}
              {showName && (
                <motion.h1
                  className="hero-section__title"
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="hero-section__title-gradient">Swethaaa</span>
                  {/* Light sweep across the name */}
                  <span className="hero-section__title-sweep" aria-hidden="true" />
                </motion.h1>
              )}

              {/* Subtitle */}
              {showSubtitle && (
                <motion.p
                  className="hero-section__subtitle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  A little universe, lit only for you.
                </motion.p>
              )}

              {/* THE enter button — exactly one <button> ever (morph stages are spans) */}
              {buttonPhase !== 'hidden' && !entered && !autoMerge && !liveAuto && (
                <div className="hero-section__enter-wrapper">
                  {buttonPhase === 'dot' && (
                    <motion.span
                      className="hero-section__enter hero-section__enter--dot"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      aria-hidden="true"
                    />
                  )}
                  {buttonPhase === 'outline' && (
                    <motion.span
                      className="hero-section__enter hero-section__enter--outline"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      aria-hidden="true"
                    />
                  )}
                  {buttonPhase === 'filled' && (
                    <motion.span
                      className="hero-section__enter hero-section__enter--filled"
                      initial={{ scale: 0.95, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  )}
                  {buttonPhase === 'text' && (
                    <EnterButton
                      enchanted
                      dispersing={enterPhase !== 'idle' && enterPhase !== 'inhale'}
                      inhaling={enterPhase === 'inhale'}
                      buttonRef={buttonRef}
                      onEnter={handleEnter}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        )}

        {/* Expanding ripple on ENTER click */}
        {ripple && (
          <motion.div
            className="hero-section__ripple"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}

        {/* Confetti burst (upgraded to small for the ENTER moment) */}
        {showConfetti && <ConfettiBurst level="small" originX={confettiOrigin.x} originY={confettiOrigin.y} />}

        {/* Act 1: dual shockwave rings from the button center (second delayed 120ms) */}
        {showShockwave && (
          <>
            <div
              className="hero-section__shockwave"
              style={{ left: burstOrigin.x, top: burstOrigin.y }}
              aria-hidden="true"
            />
            <div
              className="hero-section__shockwave hero-section__shockwave--second"
              style={{ left: burstOrigin.x, top: burstOrigin.y }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Act 2: warm-white flash melting into a faint gold tint */}
        {showFlash && (
          <>
            <div className="hero-section__enter-flash" aria-hidden="true" />
            <div className="hero-section__enter-flash hero-section__enter-flash--gold" aria-hidden="true" />
          </>
        )}

        {/* Act 2: sparkle trails rising from the burst point */}
        {showTrails && (
          <div
            className="hero-section__trails"
            style={{ left: burstOrigin.x, top: burstOrigin.y }}
            aria-hidden="true"
          >
            {ENTER_TRAILS.map((trail, i) => (
              <svg
                key={i}
                className="hero-section__trail"
                viewBox="0 0 24 24"
                style={{
                  '--dx': trail.dx,
                  '--trail-delay': trail.delay,
                  '--trail-size': trail.size,
                } as CSSProperties}
              >
                <path d={STAR_PATH} />
              </svg>
            ))}
          </div>
        )}

        {/* Act 1: rising gold-dust column from the burst point */}
        {showGoldDust && (
          <div
            className="hero-section__gold-dust"
            style={{ left: burstOrigin.x, top: burstOrigin.y }}
            aria-hidden="true"
          >
            {ENTER_GOLD_DUST.map((dot, i) => (
              <span
                key={i}
                className="hero-section__gold-dot"
                style={{ '--dx': dot.dx, '--i': i, animationDelay: dot.delay } as CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Post-enter content */}
        {entered && showPostEnter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="hero-section__pre-title hero-section__post-item" style={{ '--i': 0 } as CSSProperties}>
              <span className="hero-section__word">HAPPY</span>
              <span className="hero-section__word">19TH</span>
              <span className="hero-section__word">BIRTHDAY</span>
            </div>
            <div className="hero-section__divider hero-section__post-item" style={{ '--i': 1 } as CSSProperties} aria-hidden="true">
              <span className="hero-section__divider-diamond" />
            </div>
            <h1 className="hero-section__title hero-section__post-item" style={{ '--i': 2 } as CSSProperties}>
              <span className="hero-section__title-gradient">Swethaaa</span>
            </h1>
            <p className="hero-section__subtitle hero-section__post-item" style={{ '--i': 3 } as CSSProperties}>
              A little universe, lit only for you.
            </p>
          </motion.div>
        )}
      </div>

      {/* Playful footnote */}
      {entered && (
        <motion.p
          className="hero-section__footnote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          I could&apos;ve just sent a text. But you deserve a whole sky.
        </motion.p>
      )}

      {/* Settle cue — the single scroll cue (cue only, never auto-scrolls) */}
      {showSettleCue && (
        <div className="hero-section__settle-cue" aria-hidden="true">
          <span className="hero-section__settle-cue-label">scroll gently</span>
          <span className="hero-section__settle-chevrons">
            <ChevronDown />
            <ChevronDown />
          </span>
        </div>
      )}
    </motion.section>
  );
}
