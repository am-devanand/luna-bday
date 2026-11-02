import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion';
import './Playground.css';

/* ─── Photo files ────────────────────────────────────── */
const PHOTO_FILES = [
  '/images/moments/moment-01.jpg',
  '/images/moments/moment-02.jpg',
  '/images/moments/moment-03.jpg',
  '/images/moments/moment-04.jpg',
  '/images/moments/moment-05.jpg',
];

/* ─── Keepsake contract (L4/L2: key + event, private-mode safe) ─── */
type Keepsake = { id: string; kind: 'wish' | 'photo'; label: string; imageSrc?: string; ts: number };
const KEEPSAKE_KEY = 'luna-keepsakes-v1';

function readKeepsakes(): Keepsake[] {
  try {
    const raw = localStorage.getItem(KEEPSAKE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Keepsake[]) : [];
  } catch {
    return [];
  }
}

function appendKeepsake(keepsake: Keepsake): void {
  try {
    const prev = readKeepsakes();
    prev.push(keepsake);
    localStorage.setItem(KEEPSAKE_KEY, JSON.stringify(prev));
    window.dispatchEvent(new CustomEvent('luna:keepsake', { detail: keepsake }));
  } catch {
    /* private-mode safety: keepsake writes must never throw */
  }
}

/* ─── Card entrance variants — each unique ───────────── */
const cardVariants: Variants[] = [
  /* Card 1: rotates in from a slight tilt */
  {
    hidden: { opacity: 0, rotate: -3, scale: 0.92, y: 20 },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
    },
  },
  /* Card 2: slides in from right with a skew */
  {
    hidden: { opacity: 0, x: 40, skewY: 2 },
    visible: {
      opacity: 1,
      x: 0,
      skewY: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
    },
  },
  /* Card 3: pops in with a soft spring */
  {
    hidden: { opacity: 0, scale: 0.8, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 160,
        damping: 14,
        mass: 0.9,
        delay: 0.3,
      },
    },
  },
];

/* ─── Section title variants — editorial clip-path ───── */
const titleVariants: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
};

/* ─── Scratch Card ───────────────────────────────────── */
function ScratchCard({ onReveal, onReset }: { onReveal: () => void; onReset?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setScratched] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#C8A46B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#E0C99A';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const handleStart = () => { isDrawing.current = true; };
  const handleEnd = useCallback(() => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    const pct = transparent / (pixels.length / 4) * 100;
    setScratched(pct);
    if (pct > 65 && !revealed) {
      setRevealed(true);
      onReveal();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [revealed, onReveal]);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
  };

  const reset = () => {
    onReset?.();
    setRevealed(false);
    setScratched(0);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#C8A46B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#E0C99A';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const revealNow = () => {
    if (revealed) return;
    setRevealed(true);
    onReveal();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleScratchKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    revealNow();
  };

  return (
    <div className="playground-card scratch-card">        <h3 className="playground-card__title">Scratch Card</h3>
      <div className="scratch-card__wrapper">
        <div className="scratch-card__message">
          <span className="scratch-card__msg-line">Happy 19th!</span>
          <span className="scratch-card__msg-sub">Here&apos;s to nineteen, Swethaaa.</span>
        </div>
        <canvas
          ref={canvasRef}
          width={220}
          height={140}
          className="scratch-card__canvas"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseMove={handleMove}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onTouchMove={handleMove}
          onKeyDown={handleScratchKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Scratch card. Press Enter or Space to reveal the message."
        />
      </div>
      {revealed && (
        <div className="scratch-card__actions">
          <button type="button" className="scratch-card__reset" onClick={reset}>Scratch Again</button>
          <span className="playground-card__kept" role="status">Kept ✓</span>
        </div>
      )}
    </div>
  );
}

/* ─── Photo Developer (Random Frame) ─────────────────── */
function PhotoDeveloper({ onDevelop }: { onDevelop: (photoSrc: string) => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [developing, setDeveloping] = useState(false);
  const [developed, setDeveloped] = useState(false);

  const develop = () => {
    const next = PHOTO_FILES[Math.floor(Math.random() * PHOTO_FILES.length)];
    setPhoto(next);
    setDeveloping(true);
    setDeveloped(false);
    setTimeout(() => {
      setDeveloping(false);
      setDeveloped(true);
      onDevelop(next);
    }, 2000);
  };

  const frameNum = photo ? PHOTO_FILES.indexOf(photo) + 1 : 0;

  return (
    <div className="playground-card photo-developer">
      <h3 className="playground-card__title">Random Frame</h3>

      {!photo && (
        <button type="button" className="playground-card__btn" onClick={develop}>
          DEVELOP A PHOTO
        </button>
      )}

      {photo && (
        <motion.button
          type="button"
          className="photo-developer__card"
          onClick={develop}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.8 }}
        >
          {developing && (
            <motion.div
              className="photo-developer__developing"
              initial={{ filter: 'brightness(5) sepia(0.3) saturate(0.2)' }}
              animate={{ filter: 'brightness(1) sepia(0) saturate(1)' }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              <img src={photo} alt="A developed photograph of Swethaaa" className="photo-developer__img" />
              <div className="photo-developer__grain" />
            </motion.div>
          )}
          {developed && (
            <motion.div
              className="photo-developer__result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img src={photo} alt="A developed photograph of Swethaaa" className="photo-developer__img" />
              <span className="photo-developer__frame-label">
                FRAME {(frameNum).toString().padStart(2, '0')} / 05
              </span>
              <span className="photo-developer__stamp">19</span>
            </motion.div>
          )}
        </motion.button>
      )}

      {developed && (
        <p className="photo-developer__hint">Tap to develop another</p>
      )}
      {developed && (
        <span className="playground-card__kept" role="status">Kept ✓</span>
      )}
    </div>
  );
}


/* ─── Teddy Bear (Bear Hug) ──────────────────────────── */
const TEDDY_WORDS = [
  'thoughtful', 'sunshine', 'kind-hearted', 'brilliant',
  'radiant', 'genuine', 'sweet', 'irreplaceable',
];

function TeddyBear({ onHug }: { onHug: (word: string) => void }) {
  const [hugs, setHugs] = useState(0);
  const [hugging, setHugging] = useState(false);
  const [squishKey, setSquishKey] = useState(0);
  const [kept, setKept] = useState(false);
  const hugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => () => {
    if (hugTimer.current) window.clearTimeout(hugTimer.current);
  }, []);

  const hug = useCallback(() => {
    const word = TEDDY_WORDS[hugs % TEDDY_WORDS.length];
    onHug(word);
    setHugs((h) => h + 1);
    setKept(true);
    if (reducedMotion) return;
    setSquishKey((k) => k + 1);
    setHugging(true);
    if (hugTimer.current) window.clearTimeout(hugTimer.current);
    hugTimer.current = window.setTimeout(() => setHugging(false), 650);
  }, [hugs, onHug, reducedMotion]);

  const word = TEDDY_WORDS[(hugs - 1 + TEDDY_WORDS.length) % TEDDY_WORDS.length];

  return (
    <div className="playground-card teddy-card">
      <h3 className="playground-card__title">Bear Hug</h3>

      {/* Speech bubble — one compliment per hug */}
      <div className="teddy__bubble-zone" aria-live="polite" role="status">
        <AnimatePresence mode="wait">
          <motion.div
            key={hugs}
            className="teddy__bubble"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            {hugs === 0 ? (
              <span className="teddy__bubble-hint">tap for a hug</span>
            ) : (
              <>
                <span className="teddy__bubble-eyebrow">you are</span>
                <span className="teddy__bubble-word">{word}!</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The bear — a button that squishes */}
      <motion.button
        type="button"
        className={`teddy${hugging ? ' teddy--hugging' : ''}`}
        onClick={hug}
        whileTap={reducedMotion ? undefined : { scale: 0.93 }}
        aria-label="Hug the teddy bear"
        data-cursor-label="HUG"
      >
        <span className="teddy__art">
          <svg className="teddy__svg-art" viewBox="0 0 760 920" role="img" aria-label="A soft grey teddy bear wearing a teal scarf">
            <defs>
              <linearGradient id="tedFur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D8C9B6" />
                <stop offset="60%" stopColor="#C9BAAA" />
                <stop offset="100%" stopColor="#A68F7B" />
              </linearGradient>
              <radialGradient id="tedCream" cx="45%" cy="36%" r="78%">
                <stop offset="0%" stopColor="#F7ECDC" />
                <stop offset="100%" stopColor="#E7D5BC" />
              </radialGradient>
              <radialGradient id="tedEarIn" cx="45%" cy="40%" r="70%">
                <stop offset="0%" stopColor="#EFA48E" />
                <stop offset="100%" stopColor="#D37F66" />
              </radialGradient>
              <linearGradient id="tedScarfG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8CAEA6" />
                <stop offset="100%" stopColor="#5F847C" />
              </linearGradient>
            </defs>

            <motion.g
              key={squishKey}
              initial={squishKey === 0 || reducedMotion ? false : { scaleY: 1 }}
              animate={reducedMotion ? {} : { scaleY: [1, 0.9, 1.04, 1] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
            <ellipse cx="380" cy="884" rx="285" ry="30" fill="#D8CFC2" />

            <g id="body">
              <ellipse cx="380" cy="650" rx="238" ry="220" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" />
              <path d="M590 540 Q606 650 590 760 Q600 650 584 544 Z" fill="#6B4E35" opacity="0.14" />
              <path d="M170 540 Q154 650 170 760 Q160 650 176 544 Z" fill="#FFFDF7" opacity="0.12" />
              <ellipse cx="380" cy="692" rx="128" ry="140" fill="url(#tedCream)" />
              <path d="M264 730 Q380 780 496 730 Q380 762 264 730 Z" fill="#B57A44" opacity="0.10" />
            </g>

            <g id="leg-left">
              <ellipse cx="245" cy="822" rx="108" ry="80" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" />
              <ellipse cx="240" cy="834" rx="66" ry="52" fill="url(#tedCream)" />
            </g>
            <g id="leg-right">
              <ellipse cx="515" cy="822" rx="108" ry="80" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" />
              <ellipse cx="520" cy="834" rx="66" ry="52" fill="url(#tedCream)" />
            </g>

            <g id="arm-left" className="teddy__arm teddy__arm--l">
              <ellipse cx="165" cy="640" rx="70" ry="148" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" transform="rotate(14 165 640)" />
              <path d="M120 560 Q112 640 120 720" fill="none" stroke="#8A5A30" strokeWidth="4" opacity="0.3" strokeLinecap="round" />
              <ellipse cx="152" cy="736" rx="32" ry="40" fill="url(#tedCream)" opacity="0.95" />
            </g>
            <g id="arm-right" className="teddy__arm teddy__arm--r">
              <ellipse cx="595" cy="640" rx="70" ry="148" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" transform="rotate(-14 595 640)" />
              <path d="M640 560 Q648 640 640 720" fill="none" stroke="#8A5A30" strokeWidth="4" opacity="0.3" strokeLinecap="round" />
              <ellipse cx="608" cy="736" rx="32" ry="40" fill="url(#tedCream)" opacity="0.95" />
            </g>

            <g id="scarf">
              <path d="M 200 470 Q 380 550 560 470 Q 576 505 566 528 Q 380 610 194 528 Q 184 505 200 470 Z" fill="url(#tedScarfG)" stroke="#42605B" strokeWidth="3" strokeOpacity="0.55" />
              <path d="M 230 492 Q 380 560 530 492" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" strokeLinecap="round" />
              <path d="M 348 566 Q 380 586 412 566 L 420 700 Q 380 720 340 700 Z" fill="url(#tedScarfG)" stroke="#42605B" strokeWidth="3" strokeOpacity="0.55" />
              <path d="M 362 578 L 366 690 M 398 578 L 394 690" stroke="#42605B" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.45" />
              <path d="M 355 706 v 24 M 380 712 v 24 M 405 706 v 24" stroke="#42605B" strokeWidth="10" strokeLinecap="round" fill="none" />
              <circle cx="380" cy="545" r="40" fill="url(#tedScarfG)" stroke="#42605B" strokeWidth="3" strokeOpacity="0.55" />
              <ellipse cx="380" cy="558" rx="30" ry="14" fill="#33473F" opacity="0.35" />
              <path d="M 250 505 q 12 16 8 30 M 300 522 q 10 16 6 30 M 460 522 q -10 16 -6 30 M 510 505 q -12 16 -8 30" stroke="#33473F" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.35" />
            </g>

            <g id="head" className="teddy__head">
              <g id="ear-left">
                <circle cx="100" cy="134" r="92" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" />
                <circle cx="106" cy="140" r="50" fill="url(#tedEarIn)" />
              </g>
              <g id="ear-right">
                <circle cx="660" cy="134" r="92" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" />
                <circle cx="654" cy="140" r="50" fill="url(#tedEarIn)" />
              </g>
              <ellipse cx="380" cy="300" rx="258" ry="212" fill="url(#tedFur)" stroke="#8A7565" strokeWidth="3" strokeOpacity="0.45" />
              <path d="M610 190 Q632 300 610 410 Q622 300 604 196 Z" fill="#6B4E35" opacity="0.14" />
              <ellipse cx="280" cy="180" rx="70" ry="38" fill="#FFFDF7" opacity="0.14" transform="rotate(-16 280 180)" />
              <ellipse cx="380" cy="500" rx="120" ry="26" fill="#6B4E35" opacity="0.10" />
              <ellipse id="muzzle" cx="380" cy="392" rx="104" ry="76" fill="url(#tedCream)" />
              <path id="nose" d="M 348 356 Q 380 336 412 356 Q 407 392 380 400 Q 353 392 348 356 Z" fill="#38281E" />
              <ellipse cx="370" cy="362" rx="8" ry="5" fill="#FFFDF7" opacity="0.85" />
              <path id="mouth" d="M 380 400 L 380 414 M 380 414 Q 372 434 348 428 M 380 414 Q 388 434 412 428" stroke="#38281e" strokeWidth="7" strokeLinecap="round" fill="none" />
              <g id="eye-left">
                <circle cx="287" cy="312" r="25" fill="#38281E" />
                <circle cx="295" cy="304" r="7" fill="#ffffff" opacity="0.9" />
              </g>
              <g id="eye-right">
                <circle cx="473" cy="312" r="25" fill="#38281E" />
                <circle cx="481" cy="304" r="7" fill="#ffffff" opacity="0.9" />
              </g>
              <path id="brow-left" d="M 246 246 Q 282 226 318 240" stroke="#38281e" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path id="brow-right" d="M 442 240 Q 478 226 514 246" stroke="#38281e" strokeWidth="7" strokeLinecap="round" fill="none" />
            </g>
            </motion.g>
          <span className="teddy__blush teddy__blush--l" aria-hidden="true" />
          <span className="teddy__blush teddy__blush--r" aria-hidden="true" />
        </svg>
        </span>
      </motion.button>

      {kept && (
        <span className="playground-card__kept" role="status">Kept ✓</span>
      )}
    </div>
  );
}

/* ─── Main Playground Section ────────────────────────── */
export default function Playground() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });
  /* Session guards: one keepsake per card per session; reset re-arms scratch only */
  const scratchKeptRef = useRef(false);
  const photoKeptRef = useRef(false);
  const teddyKeptRef = useRef(false);

  const handleScratchReveal = useCallback(() => {
    if (scratchKeptRef.current) return;
    scratchKeptRef.current = true;
    const now = Date.now();
    appendKeepsake({ id: `wish-scratch-${now}`, kind: 'wish', label: 'Scratched: Happy 19th', ts: now });
  }, []);

  const handleScratchReset = useCallback(() => {
    scratchKeptRef.current = false;
  }, []);

  const handlePhotoDevelop = useCallback((photoSrc: string) => {
    if (photoKeptRef.current) return;
    photoKeptRef.current = true;
    const now = Date.now();
    const frame = String(PHOTO_FILES.indexOf(photoSrc) + 1).padStart(2, '0');
    appendKeepsake({ id: `photo-frame${frame}-${now}`, kind: 'photo', label: `Developed FRAME ${frame}`, imageSrc: photoSrc, ts: now });
  }, []);

  const handleTeddyHug = useCallback((word: string) => {
    if (teddyKeptRef.current) return;
    teddyKeptRef.current = true;
    const now = Date.now();
    appendKeepsake({ id: `hug-bear-${now}`, kind: 'wish', label: `Bear hug: ${word}`, ts: now });
  }, []);

  return (
    <section className="playground" ref={sectionRef} aria-label="Birthday Playground">
      <div className="playground__inner">
        <div ref={titleRef}>
          <motion.h2
            className="playground__title"
            variants={titleVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            Birthday Playground
          </motion.h2>
          <motion.p
            className="playground__subtitle"
            variants={subtitleVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            A few small things. Click it. Obviously.
          </motion.p>
        </div>

        <div className="playground__grid">
          <motion.div
            variants={cardVariants[0]}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <ScratchCard onReveal={handleScratchReveal} onReset={handleScratchReset} />
          </motion.div>
          <motion.div
            variants={cardVariants[1]}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <PhotoDeveloper onDevelop={handlePhotoDevelop} />
          </motion.div>
          <motion.div
            variants={cardVariants[2]}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <TeddyBear onHug={handleTeddyHug} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
