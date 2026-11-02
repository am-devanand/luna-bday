import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import './NineteenPortal.css';

/* ─── Orbiting particles ─────────────────────────────── */
/* Module-scope particle config — generated once, never during render. */
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  angle: (i / 10) * 360,
  radius: 60 + Math.random() * 40,
  duration: 8 + Math.random() * 4,
  delay: Math.random() * 2,
}));

function OrbitingParticles() {
  return (
    <div className="portal-particles" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="portal-particle"
          style={{
            animation: `portalOrbit ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            '--angle': `${p.angle}deg`,
            '--radius': `${p.radius}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────── */
export default function NineteenPortal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Observe the UNCLIPPED section. IntersectionObserver never reports an
  // element whose own clip-path clips it to nothing (fires with ratio 0),
  // so observing the clipped entrance could never trigger the reveal.
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Compositor-friendly scale instead of font-size (which forced layout
  // recalculation on every scroll frame).
  const charScale = useTransform(scrollYProgress, [0, 0.22, 0.4], [0.25, 0.5, 1]);
  const split = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const leftX = useTransform(split, [0, 1], ['0%', '-42%']);
  const rightX = useTransform(split, [0, 1], ['0%', '42%']);
  const leftOpacity = useTransform(split, [0, 0.5], [1, 0]);
  const rightOpacity = useTransform(split, [0, 0.5], [1, 0]);

  // Tail: closing line + watermark fill the empty back half of the scroll.
  const tailOpacity = useTransform(scrollYProgress, [0.42, 0.58], [0, 1]);
  const tailY = useTransform(scrollYProgress, [0.42, 0.58], [24, 0]);
  const watermarkOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 0.12]);

  return (
    <section className="nineteen-portal" ref={sectionRef} aria-label="19 transition">
      <motion.div
        className="nineteen-portal__entrance"
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={isInView ? { clipPath: 'circle(100% at 50% 50%)' } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nineteen-portal__sticky">
          {/* "19" characters that scale and split */}
          <div className="nineteen-portal__text-wrap">
            <motion.span
              className="nineteen-portal__char"
              style={{ scale: charScale, opacity: leftOpacity, x: leftX }}
            >
              1
            </motion.span>
            <motion.span
              className="nineteen-portal__char"
              style={{ scale: charScale, opacity: rightOpacity, x: rightX }}
            >
              9
            </motion.span>
          </div>

          {/* Background watermark — strengthens to fill the tail */}
          <motion.div
            className="nineteen-portal__watermark"
            style={{ opacity: watermarkOpacity }}
            aria-hidden="true"
          >
            19
          </motion.div>

          {/* Closing line — bridges into HappyBirthday */}
          <motion.p
            className="nineteen-portal__tail"
            style={{ opacity: tailOpacity, y: tailY }}
          >
            nineteen, and our story is only beginning.
          </motion.p>

          {/* Orbiting gold particles */}
          <OrbitingParticles />
        </div>
      </motion.div>
    </section>
  );
}
