import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import ConfettiBurst from './magic/ConfettiBurst';
import './Footer.css';

/* ─── Floating star particles ─────────────────────────── */
function FloatingStars({ count = 12 }: { count?: number }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      top: `${5 + Math.random() * 85}%`,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
    })), [count]);

  return (
    <div className="footer__stars" aria-hidden="true">
      {stars.map(s => (
        <span
          key={s.id}
          className="footer__star"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Variants ────────────────────────────────────────── */
const dividerVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

const textVariants = (i: number): Variants => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.18 },
  },
});

const glowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};

/* ─── Component ───────────────────────────────────────── */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [clickCount, setClickCount] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);
  const [finaleKey, setFinaleKey] = useState(0);
  const egged = useRef(false);

  useEffect(() => {
    const onFinale = () => setFinaleKey((k) => k + 1);
    window.addEventListener('luna:finale', onFinale);
    return () => window.removeEventListener('luna:finale', onFinale);
  }, []);
  const handleNineteenClick = () => {
    if (egged.current) return;
    const next = clickCount + 1;
    setClickCount(next);

    if (next >= 5) {
      egged.current = true;
      setEasterEgg(true);
      setTimeout(() => {
        setEasterEgg(false);
        setClickCount(0);
      }, 3000);
    }
  };

  return (
    <footer ref={ref} className={`footer ${easterEgg ? 'footer--egged' : ''}`} aria-label="Site footer">
      {/* Floating stars */}
      <FloatingStars count={14} />

      {/* Soft radial glow */}
      <motion.div
        className="footer__glow"
        variants={glowVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        aria-hidden="true"
      />

      {/* Top divider — draws from center */}
      <motion.div
        className="footer__divider"
        variants={dividerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        aria-hidden="true"
      />

      {/* Closing beat */}
      <p className="footer__sealed">Built for one person. Happy birthday, Swethaaa.</p>
      {/* Main text: "Made for Swethaaa" */}
      <motion.p
        className="footer__main"
        variants={textVariants(0)}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Made for{' '}
        <button
          type="button"
          className="footer__nineteen"
          onClick={handleNineteenClick}
        >
          {easterEgg ? '✨' : 'Swethaaa'}
        </button>
      </motion.p>

      {/* The "19" — hero of the footer */}
      <motion.div
        className="footer__age"
        variants={textVariants(1)}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <button
          type="button"
          className="footer__nineteen footer__age-num"
          onClick={handleNineteenClick}
        >
          {easterEgg ? '🎉' : '19'}
        </button>
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="footer__tagline"
        variants={textVariants(2)}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Here&apos;s to nineteen, and every year after.
      </motion.p>

      {/* Made by credit */}
      <motion.p
        className="footer__maker"
        variants={textVariants(3)}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Made by{' '}
        <span className="footer__maker-name">Dev</span>
      </motion.p>

      {/* Copyright */}
      <motion.p
        className="footer__copyright"
        variants={textVariants(4)}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        &copy; 2026
      </motion.p>

      {/* Fade-to-dark bottom edge — book closing gesture */}
      <div className="footer__fade-out" aria-hidden="true" />

      {finaleKey > 0 && (
        <ConfettiBurst
          key={finaleKey}
          level="celebration"
          onComplete={() => setFinaleKey(0)}
        />
      )}
    </footer>
  );
}
