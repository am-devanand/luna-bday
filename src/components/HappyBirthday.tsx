import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion';
import './HappyBirthday.css';

import AmbientSparkles from './magic/AmbientSparkles';

/* ─── Variants ────────────────────────────────────────── */
const lineVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.15 + i * 0.18,
    },
  }),
};

const dividerVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 },
  },
};

/* ─── Component ───────────────────────────────────────── */
export default function HappyBirthday() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  /* Glow intensity breathes as you scroll through */
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.9], [0, 1, 0.6]);
  const glowScale = useTransform(scrollYProgress, [0.1, 0.4, 0.9], [0.8, 1.1, 1]);

  return (
    <section className="hb" ref={sectionRef} aria-label="Happy Birthday">
      {/* Floating sparkles */}
      <AmbientSparkles density="low" color="var(--gold-light, #E0C99A)" twinkle />

      {/* Background radial glow — golden, breathes with scroll */}
      <motion.div
        className="hb__glow"
        style={{ opacity: glowOpacity, scale: glowScale }}
        aria-hidden="true"
      />

      <div className="hb__inner">
        {/* Decorative divider above */}
        <motion.div
          className="hb__divider"
          variants={dividerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          aria-hidden="true"
        />

        {/* Main text */}
        <motion.p
          className="hb__line hb__line--main"
          custom={0}
          variants={lineVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          Happy Birthday
        </motion.p>

        {/* Name */}
        <motion.p
          className="hb__line hb__line--name"
          custom={1}
          variants={lineVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          Luna
        </motion.p>

        {/* Age */}
        <motion.p
          className="hb__line hb__line--age"
          custom={2}
          variants={lineVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          19
        </motion.p>

        {/* The date — November 6 */}
        <motion.p
          className="hb__line hb__line--date"
          custom={3}
          variants={lineVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          06 · 11 · 2026
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="hb__line hb__line--tag"
          custom={4}
          variants={lineVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          Nineteen has never looked this beautiful.
        </motion.p>

        {/* Decorative divider below */}
        <motion.div
          className="hb__divider"
          variants={dividerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
