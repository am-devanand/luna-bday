import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import './Reasons.css';

const REASONS = [
  'The way you ask “ennanga aachu?” and actually mean it.',
  'Your voice notes — especially “thangam” and “chellam”.',
  'The kindness you show people who can do nothing for you.',
  'Your faith, quiet and steady, even when you are scared.',
  'The way you pray for us before you speak.',
  'Your laugh when you are trying very hard not to laugh.',
  'Your terrible opinion of my mirror selfies.',
  'The pink flower you wear like it was always part of you.',
  'How you love animals, especially the ones nobody else notices.',
  'The way “lusu paiyan” somehow became a pet name.',
  'Your courage on February 13 — the ring, the secret, the hope.',
  'How you make long distance feel like sharing a room.',
  'The way you listen — really listen — before you answer.',
  'Your ambition, even on the days you doubt yourself.',
  'The home you have made inside my ordinary routines.',
  'Your “singleeeee inchhhh gap” promise.',
  'How beautiful you look in a saree, and how you do not even know it.',
  'The way you choose us, again and again.',
  'That you exist, and that I get to love you.',
];

export default function Reasons() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const reduce = useReducedMotion();

  return (
    <section className="reasons" ref={ref} aria-label="Nineteen things I love about Luna">
      <div className="reasons__glow" aria-hidden="true" />
      <div className="reasons__inner">
        <motion.p
          className="reasons__eyebrow"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Nineteen
        </motion.p>

        <motion.h2
          className="reasons__title"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          Nineteen things I love about you
        </motion.h2>

        <motion.div
          className="reasons__divider"
          initial={reduce ? false : { scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          aria-hidden="true"
        >
          <span className="reasons__divider-diamond" />
        </motion.div>

        <motion.p
          className="reasons__subtitle"
          initial={reduce ? false : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.28 }}
        >
          One for every year — and a few just because.
        </motion.p>

        <ol className="reasons__list">
          {REASONS.map((reason, i) => (
            <motion.li
              key={reason}
              className="reasons__item"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: reduce ? 0 : 0.32 + i * 0.035,
              }}
            >
              <span className="reasons__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="reasons__text">{reason}</span>
            </motion.li>
          ))}
        </ol>

        <p className="reasons__tail">...and a hundred more the list doesn&apos;t have room for.</p>
      </div>
    </section>
  );
}
